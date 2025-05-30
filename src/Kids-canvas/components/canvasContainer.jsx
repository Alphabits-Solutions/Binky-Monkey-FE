import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import KidsCanvas from './KidsCanvas';
import AdminToolbar from './AdminToolbar';
import ConnectionStatus from './ConnectionStatus';
import { useSocket } from '../hooks/useSocket';
import { useCanvasState } from '../hooks/useCanvasState';
import '../styles/CanvasContainer.css';

const CanvasContainer = ({ 
  activityId = "675a4b0e1b42db3a6df6ae5b",
  socketUrl = "http://localhost:8000",
  apiBaseUrl = "http://localhost:8000"
}) => {
  // Hardcoded isModerator for now
  const isModerator = localStorage.getItem('isModerator') === 'true' || false;
  const userId = "user-" + Math.random().toString(36).substr(2, 9);
  const userName = "User " + Math.random().toString(36).substr(2, 5);
  
  // Initialize hooks
  const {
    socket,
    isConnected,
    reconnecting,
    connectionError,
    joinActivity,
    sendCanvasInteraction,
    sendAdminControl,
    sendPageChange,
    sendZoomControl,
    sendCelebrate,
    requestLock,
    releaseLock
  } = useSocket(socketUrl);

  const {
    pages,
    layers,
    currentPageIndex,
    setCurrentPageIndex,
    interactionStates,
    setInteractionStates,
    canvasShapes,
    setCanvasShapes,
    canvas3DObjects,
    setCanvas3DObjects,
    selectedColors,
    setSelectedColors,
    activeColor,
    setActiveColor,
    zoomLevel,
    setZoomLevel,
    loadActivityData,
    updateLayerRealtime,
    updateShapeRealtime,
    update3DObjectRealtime,
    syncWithServerState
  } = useCanvasState(apiBaseUrl);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState({});
  
  // NEW: Lock management states
  const [myLocks, setMyLocks] = useState(new Set());
  const [layerLocks, setLayerLocks] = useState(new Map()); // layerId -> { userId, userName }
  const [pendingServerUpdates, setPendingServerUpdates] = useState(new Set());
  
  // NEW: Throttling timestamps to prevent flickering
  const dragUpdateTimestamps = useRef(new Map());
  const resizeUpdateTimestamps = useRef(new Map());
  const rotation3DTimestamps = useRef(new Map());
  
  const canvasRef = useRef(null);

  // Initialize activity and join room
  useEffect(() => {
    const initializeActivity = async () => {
      try {
        setLoading(true);
        // Load activity data
        await loadActivityData(activityId);
        
        // Join socket room once connected
        if (socket && isConnected) {
          joinActivity({
            activityId,
            userId,
            isModerator,
            userName
          });
        }
      } catch (err) {
        console.error('Failed to initialize activity:', err);
        setError('Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };

    initializeActivity();
  }, [activityId, socket, isConnected]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle room state updates
    socket.on('room-state', (data) => {
      console.log('Received room state:', data);
      setInteractionStates(data.interactions);
      
      // Clamp zoom level between 100 and 200
      const clampedZoom = Math.max(100, Math.min(200, data.zoomLevel || 100));
      setZoomLevel(clampedZoom);
      
      if (data.currentPage) {
        const pageIndex = pages.findIndex(page => page._id === data.currentPage);
        if (pageIndex !== -1) {
          setCurrentPageIndex(pageIndex);
        }
      }

      // Sync with server layer states
      if (data.layerStates) {
        syncWithServerState(data.layerStates);
      }

      // Update layer locks
      if (data.layerLocks) {
        setLayerLocks(new Map(Object.entries(data.layerLocks)));
      }
    });

    // Handle interaction control changes
    socket.on('interaction-control', (data) => {
      console.log('Interaction control update:', data);
      setInteractionStates(prev => ({
        ...prev,
        [data.interactionType]: data.enabled
      }));
      
      showMessage(`${data.interactionType} ${data.enabled ? 'enabled' : 'disabled'} by ${data.updatedBy}`);
    });

    // Handle zoom changes
    socket.on('zoom-changed', (data) => {
      console.log('Zoom changed:', data);
      const clampedZoom = Math.max(100, Math.min(200, data.zoomLevel));
      setZoomLevel(clampedZoom);
    });

    // NEW: Handle lock events
    socket.on('lock-granted', (data) => {
      console.log('Lock granted:', data);
      setMyLocks(prev => new Set(prev).add(data.layerId));
    });

    socket.on('lock-denied', (data) => {
      console.log('Lock denied:', data);
      const lockedByUser = layerLocks.get(data.layerId)?.userName || 'Another user';
      showMessage(`${lockedByUser} is using this item`);
    });

    socket.on('lock-released', (data) => {
      console.log('Lock released:', data);
      setLayerLocks(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.layerId);
        return newMap;
      });
    });

    socket.on('lock-update', (data) => {
      console.log('Lock update:', data);
      setLayerLocks(new Map(Object.entries(data.locks)));
    });

    // SIMPLIFIED: Handle real-time canvas updates
    socket.on('canvas-update', (data) => {
      console.log('Canvas update received:', data);
      
      // Only process updates from OTHER users (ignore my own updates)
      if (data.userId === userId) {
        console.log('Ignoring my own update for layer:', data.layerId);
        return;
      }
      
      // Handle different interaction types
      switch (data.type) {
        case 'drag':
          updateLayerRealtime(data.layerId, { positionOrigin: data.position });
          break;
          
        case 'resize':
          updateLayerRealtime(data.layerId, { 
            size: data.size,
            positionOrigin: data.position 
          });
          break;
          
        case 'colorfill':
          updateShapeRealtime(data.shapeId, data.elementId, data.color);
          break;
          
        case 'model3d':
          // Only process updates from OTHER users (ignore my own updates)
          if (data.userId === userId) {
            console.log('Ignoring my own 3D update for layer:', data.layerId);
            return;
          }
          
          // Update 3D model rotation in real-time for other users
          const canvasComponent = canvasRef.current;
          if (canvasComponent && canvasComponent.update3DRotation) {
            canvasComponent.update3DRotation(data.objectId, data.rotation);
          }
          
          // Update layer state for 3D rotation
          const layer = layers.find(l => (l.objectId || `3d-${l._id}`) === data.objectId || l._id === data.layerId);
          if (layer) {
            updateLayerRealtime(layer._id, { 
              rotation: data.rotation
            });
          }
          break;
          
        case 'audio':
          handleRemoteAudioPlay(data);
          break;
          
        case 'vibration':
          if (data.userId !== userId) {
            if (data.action === 'start') {
              const canvasComponent = canvasRef.current;
              if (canvasComponent && canvasComponent.startVibration) {
                canvasComponent.startVibration(data.layerId);
              }
            } else if (data.action === 'end') {
              const canvasComponent = canvasRef.current;
              if (canvasComponent && canvasComponent.endVibration) {
                canvasComponent.endVibration(data.layerId);
              }
            }
          }
          break;
      }
    });

    // Handle confetti celebration
    socket.on('confetti-start', (data) => {
      console.log('Confetti celebration started by:', data.triggeredBy);
      triggerConfetti();
    });

    // Handle page changes
    socket.on('page-changed', (data) => {
      console.log('Page changed:', data);
      setCurrentPageIndex(data.pageIndex);
    });

    // Handle interaction blocks
    socket.on('interaction-blocked', (data) => {
      showMessage(data.message);
    });

    // Handle sync data for reconnection
    socket.on('sync-data', (queuedInteractions) => {
      console.log('Syncing queued interactions:', queuedInteractions);
      queuedInteractions.forEach(interaction => {
        if (interaction.userId !== userId) {
          handleQueuedInteraction(interaction);
        }
      });
    });

    // Handle errors
    socket.on('error', (data) => {
      showMessage(`Error: ${data.message}`);
    });

    return () => {
      socket.off('room-state');
      socket.off('interaction-control');
      socket.off('zoom-changed');
      socket.off('canvas-update');
      socket.off('confetti-start');
      socket.off('page-changed');
      socket.off('interaction-blocked');
      socket.off('sync-data');
      socket.off('error');
      socket.off('lock-granted');
      socket.off('lock-denied');
      socket.off('lock-released');
      socket.off('lock-update');
    };
  }, [socket, pages, layers, userId, myLocks, layerLocks]);

  // Handle queued interactions
  const handleQueuedInteraction = (interaction) => {
    switch (interaction.type) {
      case 'drag':
        updateLayerRealtime(interaction.layerId, { positionOrigin: interaction.position });
        break;
      case 'resize':
        updateLayerRealtime(interaction.layerId, { 
          size: interaction.size,
          positionOrigin: interaction.position 
        });
        break;
      case 'colorfill':
        updateShapeRealtime(interaction.shapeId, interaction.elementId, interaction.color);
        break;
      case 'model3d':
        const layer = layers.find(l => (l.objectId || `3d-${l._id}`) === interaction.objectId);
        if (layer) {
          updateLayerRealtime(layer._id, { 
            properties: {
              ...layer.properties,
              rotation: interaction.rotation
            }
          });
        }
        break;
    }
  };

  // Handle remote audio play
  const handleRemoteAudioPlay = (data) => {
    const audioElement = document.getElementById(`audio-${data.layerId}`);
    if (audioElement) {
      if (data.action === 'play') {
        audioElement.play().catch(err => console.error('Audio play failed:', err));
      } else if (data.action === 'pause') {
        audioElement.pause();
      }
    }
  };

  // Show message to user
  const showMessage = (message) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'toast-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
    `;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 3000);
  };

  // Canvas interaction handlers
  const handleCanvasInteraction = (type, data) => {
    // Vibration is always allowed
    if (type === 'vibration') {
      sendCanvasInteraction({
        type,
        ...data,
        userId,
        activityId,
        pageId: pages[currentPageIndex]?._id,
        timestamp: Date.now()
      });
      return;
    }
  
    // Check if interaction is allowed
    if (!interactionStates[type]) {
      showMessage(`${type} interaction is currently disabled`);
      return;
    }
  
    // Send to socket with userId
    sendCanvasInteraction({
      type,
      ...data,
      userId,
      activityId,
      pageId: pages[currentPageIndex]?._id,
      timestamp: Date.now()
    });
  };

  // NEW: Simplified interaction handlers with locking
  const handleDragStart = async (layerId) => {
    console.log('Requesting drag lock for layer:', layerId);
    
    const lockGranted = await requestLock(layerId, 'drag');
    if (lockGranted) {
      console.log('Drag lock granted for layer:', layerId);
      return true;
    } else {
      console.log('Drag lock denied for layer:', layerId);
      return false;
    }
  };

  const handleDragEnd = (layerId, position, completed = false) => {
    console.log('Ending drag for layer:', layerId);
    
    // Send the final position (this is important for server state)
    handleCanvasInteraction('drag', {
      layerId,
      position,
      completed,
      userId,
      final: true // Mark as final update
    });
    
    // Release lock
    releaseLock(layerId);
    setMyLocks(prev => {
      const newSet = new Set(prev);
      newSet.delete(layerId);
      return newSet;
    });
    
    // Clear throttling timestamp
    dragUpdateTimestamps.current.delete(layerId);
  };

  const handleDragMove = (layerId, position) => {
    // Update layer state immediately for smooth interaction
    updateLayerRealtime(layerId, { positionOrigin: position });
    
    // Throttle server updates to reduce flickering (send every 100ms max)
    const now = Date.now();
    const lastUpdate = dragUpdateTimestamps.current.get(layerId) || 0;
    
    if (now - lastUpdate > 100) { // Only send every 100ms
      // Send real-time update to others
      handleCanvasInteraction('drag', {
        layerId,
        position,
        userId
      });
      dragUpdateTimestamps.current.set(layerId, now);
    }
  };

  const handleResizeStart = async (layerId) => {
    console.log('Requesting resize lock for layer:', layerId);
    
    const lockGranted = await requestLock(layerId, 'resize');
    if (lockGranted) {
      console.log('Resize lock granted for layer:', layerId);
      return true;
    } else {
      console.log('Resize lock denied for layer:', layerId);
      return false;
    }
  };

  const handleResizeEnd = (layerId, size, position) => {
    console.log('Ending resize for layer:', layerId);
    
    // Send final size and position (important for server state)
    handleCanvasInteraction('resize', {
      layerId,
      size,
      position,
      userId,
      final: true // Mark as final update
    });
    
    // Release lock
    releaseLock(layerId);
    setMyLocks(prev => {
      const newSet = new Set(prev);
      newSet.delete(layerId);
      return newSet;
    });
    
    // Clear throttling timestamp
    resizeUpdateTimestamps.current.delete(layerId);
  };

  const handleResizeMove = (layerId, size, position) => {
    // Update layer state immediately for smooth interaction
    updateLayerRealtime(layerId, { size, positionOrigin: position });
    
    // Throttle server updates to reduce flickering (send every 100ms max)
    const now = Date.now();
    const lastUpdate = resizeUpdateTimestamps.current.get(layerId) || 0;
    
    if (now - lastUpdate > 100) { // Only send every 100ms
      // Send real-time update to others
      handleCanvasInteraction('resize', {
        layerId,
        size,
        position,
        userId
      });
      resizeUpdateTimestamps.current.set(layerId, now);
    }
  };

  const handle3DStart = async (layerId) => {
    console.log('Requesting 3D lock for layer:', layerId);
    
    const lockGranted = await requestLock(layerId, 'model3d');
    if (lockGranted) {
      console.log('3D lock granted for layer:', layerId);
      return true;
    } else {
      console.log('3D lock denied for layer:', layerId);
      return false;
    }
  };

  // NEW: Handle 3D rotation updates with better state management
  const handle3DMove = (layerId, objectId, rotation) => {
    // Update layer state immediately for smooth rotation
    updateLayerRealtime(layerId, { 
      rotation: rotation
    });
    
    // Throttle server updates for 3D rotation - LESS aggressive throttling
    const now = Date.now();
    const lastUpdate = rotation3DTimestamps.current.get(layerId) || 0;
    
    if (now - lastUpdate > 150) { // Increased to 150ms to reduce flickering
      handleCanvasInteraction('model3d', {
        objectId,
        layerId,
        rotation,
        userId
      });
      rotation3DTimestamps.current.set(layerId, now);
    }
  };

  const handle3DEnd = (layerId, objectId, rotation) => {
    console.log('Ending 3D interaction for layer:', layerId, 'final rotation:', rotation);
    
    // CRITICAL: Update layer state with final rotation FIRST
    updateLayerRealtime(layerId, { 
      rotation: rotation
    });
    
    // Then send final rotation to server with a small delay to ensure layer state is updated
    setTimeout(() => {
      handleCanvasInteraction('model3d', {
        objectId,
        layerId,
        rotation,
        userId,
        final: true // Mark as final update
      });
    }, 50); // Small delay to ensure state is updated
    
    // Release lock
    releaseLock(layerId);
    setMyLocks(prev => {
      const newSet = new Set(prev);
      newSet.delete(layerId);
      return newSet;
    });
    
    // Clear throttling timestamp
    rotation3DTimestamps.current.delete(layerId);
  };

  // Admin control handlers
  const handleAdminControl = (interactionType, enabled) => {
    sendAdminControl({
      interactionType,
      enabled,
      activityId
    });
  };

  // Zoom control handlers
  const handleZoomChange = (newZoomLevel) => {
    const clampedZoom = Math.max(100, Math.min(200, newZoomLevel));
    sendZoomControl({ zoomLevel: clampedZoom });
  };

  // Page navigation handlers
  const handlePageChange = (direction) => {
    let newIndex;
    if (direction === "next" && currentPageIndex < pages.length - 1) {
      newIndex = currentPageIndex + 1;
    } else if (direction === "prev" && currentPageIndex > 0) {
      newIndex = currentPageIndex - 1;
    } else {
      return;
    }

    setCurrentPageIndex(newIndex);
    sendPageChange({
      pageId: pages[newIndex]._id,
      pageIndex: newIndex,
      activityId
    });
  };

  // Confetti handlers
  const triggerConfetti = () => {
    setConfettiConfig({
      numberOfPieces: 500,
      recycle: false,
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8'],
      gravity: 0.3,
      wind: 0,
      initialVelocityX: 15,
      initialVelocityY: 25,
      spread: 360
    });
    setShowConfetti(true);
    
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  const handleCelebrate = () => {
    sendCelebrate();
    triggerConfetti();
  };

  // Handle reconnection
  useEffect(() => {
    if (isConnected && !reconnecting) {
      socket?.emit('sync-request');
    }
  }, [isConnected, reconnecting]);

  if (loading) {
    return (
      <div className="canvas-loading">
        <div className="loading-spinner">Loading activity...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="canvas-error">
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const currentPage = pages[currentPageIndex];
  const currentPageLayers = layers.filter(layer => layer.pageId === currentPage?._id);

  return (
    <div className="canvas-container">
      {/* Confetti overlay */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          {...confettiConfig}
        />
      )}

      {/* Connection Status */}
      <ConnectionStatus 
        isConnected={isConnected}
        reconnecting={reconnecting}
        error={connectionError}
      />

      {/* Admin Controls */}
      {isModerator && (
        <>
          {/* Admin Toolbar */}
          <AdminToolbar
            interactionStates={interactionStates}
            onInteractionToggle={handleAdminControl}
            onCelebrate={handleCelebrate}
            zoomLevel={zoomLevel}
            onZoomChange={handleZoomChange}
          />

          {/* Page Navigation */}
          <div className="page-navigation">
            <button
              className="nav-button prev-button"
              onClick={() => handlePageChange("prev")}
              disabled={currentPageIndex === 0}
              title={currentPageIndex > 0 ? `Go to page ${currentPageIndex}` : 'First page'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>
            
            <span className="page-indicator">
              Page {currentPageIndex + 1} of {pages.length}
            </span>
            
            <button
              className="nav-button next-button"
              onClick={() => handlePageChange("next")}
              disabled={currentPageIndex === pages.length - 1}
              title={currentPageIndex < pages.length - 1 ? `Go to page ${currentPageIndex + 2}` : 'Last page'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
          </div>
        </>
      )}

      {/* Main Canvas */}
      <KidsCanvas
        ref={canvasRef}
        currentPage={currentPage}
        layers={currentPageLayers}
        canvasShapes={canvasShapes}
        setCanvasShapes={setCanvasShapes}
        canvas3DObjects={canvas3DObjects}
        setCanvas3DObjects={setCanvas3DObjects}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        activeColor={activeColor}
        setActiveColor={setActiveColor}
        interactionStates={interactionStates}
        onCanvasInteraction={handleCanvasInteraction}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
        onResizeStart={handleResizeStart}
        onResizeEnd={handleResizeEnd}
        onResizeMove={handleResizeMove}
        on3DStart={handle3DStart}
        on3DEnd={handle3DEnd}
        on3DMove={handle3DMove}
        zoomLevel={zoomLevel}
        myLocks={myLocks}
        layerLocks={layerLocks}
        isModerator={isModerator}
        apiBaseUrl={apiBaseUrl}
        userId={userId}
        userName={userName}
      />
    </div>
  );
};

export default CanvasContainer;