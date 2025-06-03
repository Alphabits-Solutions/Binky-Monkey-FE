import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { ModelViewer } from '../utils/threeDUtils';
import { enhanceSvgVisibility, applyFillsToSvgString, createFallbackSvg } from '../utils/canvasUtils';

const KidsCanvas = forwardRef(({
  currentPage,
  layers,
  canvasShapes,
  setCanvasShapes,
  canvas3DObjects,
  setCanvas3DObjects,
  selectedColors,
  activeColor,
  setActiveColor,
  interactionStates,
  onCanvasInteraction,
  onDragStart,
  onDragEnd,
  onDragMove,
  onResizeStart,
  onResizeEnd,
  onResizeMove,
  on3DStart,
  on3DEnd,
  on3DMove,
  myLocks,
  layerLocks,
  zoomLevel,
  isModerator,
  apiBaseUrl,
  userId,
  userName
}, ref) => {
  const canvasRef = useRef(null);
  const modelContainersRef = useRef({});
  const modelViewers = useRef({});
  const audioRef = useRef(null);
  
  // Canvas state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingLayerId, setDraggingLayerId] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizingLayerId, setResizingLayerId] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [isRotating3D, setIsRotating3D] = useState(false);
  const [rotating3DId, setRotating3DId] = useState(null);
  const [rotationStart, setRotationStart] = useState({ x: 0, y: 0 });
  const [initialRotation, setInitialRotation] = useState({ x: 0, y: 0, z: 0 });
  const [currentRotation, setCurrentRotation] = useState({ x: 0, y: 0, z: 0 });
  const [playingAudioLayerId, setPlayingAudioLayerId] = useState(null);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 20, y: 20 });
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  const [vibratingLayerIds, setVibratingLayerIds] = useState(new Set());
  
  // Image cache for performance
  const imageCache = useRef({});

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    redraw: () => {
      redrawCanvas();
    },
    startVibration: (layerId) => {
      setVibratingLayerIds(prev => new Set(prev).add(layerId));
    },
    endVibration: (layerId) => {
      setVibratingLayerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(layerId);
        return newSet;
      });
    },
    update3DRotation: (objectId, rotation) => {
      const viewer = modelViewers.current[objectId];
      if (viewer) {
        viewer.setModelRotation(rotation.x, rotation.y, rotation.z);
      }
    }
  }));

  // Initialize 3D model viewers - IMPROVED to prevent flickering
  useEffect(() => {
    const model3DLayers = layers.filter(layer => 
      layer.action === "model3d" && 
      layer.properties.modelUrl &&
      layer.pageId === currentPage?._id
    );

    model3DLayers.forEach(layer => {
      const objectId = layer.objectId || `3d-${layer._id}`;
      
      // Only create viewer if it doesn't exist AND container exists
      if (!modelViewers.current[objectId] && modelContainersRef.current[objectId]) {
        const container = modelContainersRef.current[objectId];
        const viewer = new ModelViewer(container);
        
        viewer.loadModel(layer.properties.modelUrl)
          .then(() => {
            const rotation = layer.properties.rotation || { x: 0, y: 0, z: 0 };
            viewer.setModelRotation(rotation.x, rotation.y, rotation.z);
            
            if (layer.properties.scale) {
              viewer.setModelScale(layer.properties.scale);
            }
            
            console.log('3D model loaded successfully:', objectId);
          })
          .catch(error => {
            console.error(`Error loading 3D model for layer ${layer._id}:`, error);
            createFallback3DElement(objectId, layer.properties.modelUrl);
          });
        
        modelViewers.current[objectId] = viewer;
      }
    });

    // IMPROVED: Only cleanup if layer is actually removed, not just re-rendered
    const existingIds = new Set(model3DLayers.map(layer => layer.objectId || `3d-${layer._id}`));
    Object.keys(modelViewers.current).forEach(id => {
      if (!existingIds.has(id)) {
        console.log('Cleaning up removed 3D model:', id);
        if (modelViewers.current[id]) {
          modelViewers.current[id].dispose();
          delete modelViewers.current[id];
        }
      }
    });
  }, [layers.length, currentPage]); // Changed dependencies to be less aggressive

  // Update 3D models when layer rotation changes - IMPROVED
  useEffect(() => {
    layers.forEach(layer => {
      if (layer.action === "model3d" && layer.properties.rotation) {
        const objectId = layer.objectId || `3d-${layer._id}`;
        const viewer = modelViewers.current[objectId];
        
        // Only update if we're NOT currently rotating this object
        if (viewer && rotating3DId !== objectId) {
          const rotation = layer.properties.rotation;
          console.log('Applying layer rotation to viewer:', objectId, rotation);
          viewer.setModelRotation(rotation.x, rotation.y, rotation.z);
        }
      }
    });
  }, [layers, rotating3DId]); // Added rotating3DId dependency

  // Create fallback 3D element
  const createFallback3DElement = (objectId, modelUrl) => {
    const container = modelContainersRef.current[objectId];
    if (!container) return;

    container.innerHTML = `
      <div class="fallback-3d-model">
        <div class="fallback-content">
          <div class="fallback-icon">📦</div>
          <div class="fallback-text">${getModelFileName(modelUrl)}</div>
        </div>
      </div>
    `;
  };

  // Get model filename from URL
  const getModelFileName = (url) => {
    try {
      return url.split('/').pop() || '3D Model';
    } catch {
      return '3D Model';
    }
  };

  // Preload images
  const preloadImages = () => {
    layers.forEach(layer => {
      if (layer.properties.imgUrl && !imageCache.current[layer.properties.imgUrl]) {
        const img = new Image();
        img.src = layer.properties.imgUrl;
        img.onload = () => {
          imageCache.current[layer.properties.imgUrl] = img;
          redrawCanvas();
        };
      }
      
      if (layer.properties.destinationImgUrl && !imageCache.current[layer.properties.destinationImgUrl]) {
        const img = new Image();
        img.src = layer.properties.destinationImgUrl;
        img.onload = () => {
          imageCache.current[layer.properties.destinationImgUrl] = img;
          redrawCanvas();
        };
      }
    });
  };

  // Redraw canvas helper
  const redrawCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      drawLayers(ctx);
    }
  };

  // Get effective layer state
  const getEffectiveLayerState = (layer) => {
    return layer.properties;
  };

  // Check if layer is locked by someone else
  const isLayerLockedByOther = (layerId) => {
    const lockInfo = layerLocks.get(layerId);
    return lockInfo && lockInfo.userId !== userId;
  };

  // Get lock owner name
  const getLockOwnerName = (layerId) => {
    const lockInfo = layerLocks.get(layerId);
    return lockInfo ? lockInfo.userName : null;
  };

  // Draw layers
  const drawLayers = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw destination images first
    layers.forEach((layer) => {
      if (layer.action === "drag" && layer.properties.positionDestination) {
        drawDestinationImage(ctx, layer);
      }
    });

    // Draw main layer images
    layers.forEach((layer) => {
      if (layer.properties.type === "model3d") return;

      if (layer.properties.imgUrl) {
        const effectiveState = getEffectiveLayerState(layer);
        drawLayerImage(ctx, layer, effectiveState);
      }
    });
  };

  // Draw destination image
  const drawDestinationImage = (ctx, layer) => {
    if (!layer.properties.positionDestination) return;
    
    const destinationUrl = layer.properties.destinationImgUrl || layer.properties.imgUrl;
    
    if (imageCache.current[destinationUrl]) {
      const img = imageCache.current[destinationUrl];
      ctx.save();
      ctx.globalAlpha = layer.properties.destinationImgUrl ? 1.0 : 0.5;
      ctx.drawImage(
        img,
        layer.properties.positionDestination.x,
        layer.properties.positionDestination.y,
        parseInt(layer.properties.size[0]),
        parseInt(layer.properties.size[1])
      );
      ctx.restore();
    }
  };

  // Draw layer image with lock indicators
  const drawLayerImage = (ctx, layer, effectiveState) => {
    const position = effectiveState.positionOrigin;
    const size = effectiveState.size;
    
    if (imageCache.current[layer.properties.imgUrl]) {
      const img = imageCache.current[layer.properties.imgUrl];
      
      ctx.save();
      
      // Apply vibration effect
      if (vibratingLayerIds.has(layer._id)) {
        const shakeX = (Math.random() - 0.5) * 10;
        const shakeY = (Math.random() - 0.5) * 10;
        ctx.translate(shakeX, shakeY);
      }
      
      // Handle rotation
      if (layer.action === "rotation" && layer.properties.rotationAngle) {
        ctx.translate(
          position.x + parseInt(size[0]) / 2,
          position.y + parseInt(size[1]) / 2
        );
        ctx.rotate((layer.properties.rotationAngle * Math.PI) / 180);
        ctx.translate(
          -(position.x + parseInt(size[0]) / 2),
          -(position.y + parseInt(size[1]) / 2)
        );
      }
      
      ctx.drawImage(
        img,
        position.x,
        position.y,
        parseInt(size[0]),
        parseInt(size[1])
      );
      
      // Draw lock indicator border
      if (isLayerLockedByOther(layer._id)) {
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          position.x - 2,
          position.y - 2,
          parseInt(size[0]) + 4,
          parseInt(size[1]) + 4
        );
      } else if (myLocks.has(layer._id)) {
        ctx.strokeStyle = '#2ed573';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          position.x - 2,
          position.y - 2,
          parseInt(size[0]) + 4,
          parseInt(size[1]) + 4
        );
      }
      
      // Draw resize handle for resize-enabled images
      if (layer.action === "resize") {
        drawResizeHandle(ctx, position, size, layer._id === resizingLayerId);
      }
      
      // Draw audio indicator
      if (layer.action === "audio" && layer.properties.audioUrl) {
        drawAudioIndicator(ctx, layer, position);
      }
      
      ctx.restore();
    }
  };

  // Draw resize handle
  const drawResizeHandle = (ctx, position, size, isActive) => {
    const handleX = position.x + parseInt(size[0]) - 8;
    const handleY = position.y + parseInt(size[1]) - 8;
    const handleSize = 16;
    
    ctx.save();
    
    ctx.fillStyle = isActive ? '#ff4757' : '#3742fa';
    ctx.beginPath();
    ctx.roundRect(handleX, handleY, handleSize, handleSize, 4);
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(handleX + 4, handleY + 12);
    ctx.lineTo(handleX + 12, handleY + 4);
    ctx.moveTo(handleX + 6, handleY + 12);
    ctx.lineTo(handleX + 12, handleY + 6);
    ctx.moveTo(handleX + 8, handleY + 12);
    ctx.lineTo(handleX + 12, handleY + 8);
    ctx.stroke();
    
    ctx.restore();
  };

  // Draw audio indicator
  const drawAudioIndicator = (ctx, layer, position) => {
    const indicatorX = position.x + parseInt(layer.properties.size[0]) - 15;
    const indicatorY = position.y + 15;
    const isPlaying = playingAudioLayerId === layer._id;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 12, 0, 2 * Math.PI);
    ctx.fillStyle = isPlaying ? "rgba(255, 59, 48, 0.8)" : "rgba(0, 122, 255, 0.8)";
    ctx.fill();
    
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isPlaying ? "⏸" : "▶", indicatorX, indicatorY);
    ctx.restore();
  };

  // Check if position is near destination
  const isNearDestination = (position, destination, tolerance = 30) => {
    return (
      Math.abs(position.x - destination.x) <= tolerance &&
      Math.abs(position.y - destination.y) <= tolerance
    );
  };

  // Apply vibration effect
  const applyVibration = (layerId) => {
    setVibratingLayerIds(prev => new Set(prev).add(layerId));
    
    onCanvasInteraction('vibration', {
      layerId,
      action: 'start'
    });
    
    setTimeout(() => {
      setVibratingLayerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(layerId);
        return newSet;
      });
      
      onCanvasInteraction('vibration', {
        layerId,
        action: 'end'
      });
    }, 300);
  };

  // Mouse event handlers
  const handleMouseDown = async (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scrollLeft = canvas.parentElement.scrollLeft || 0;
    const scrollTop = canvas.parentElement.scrollTop || 0;
    const x = (e.clientX - rect.left) + scrollLeft;
    const y = (e.clientY - rect.top) + scrollTop;

    // Check for resize handles first - MODERATOR BYPASS
    for (const layer of layers) {
      if (layer.action === "resize" && (interactionStates.resize || isModerator)) {
        if (isLayerLockedByOther(layer._id)) {
          continue;
        }
        
        const effectiveState = getEffectiveLayerState(layer);
        const position = effectiveState.positionOrigin;
        const size = effectiveState.size;
        const handleX = position.x + parseInt(size[0]) - 8;
        const handleY = position.y + parseInt(size[1]) - 8;
        
        if (x >= handleX && x <= handleX + 16 && y >= handleY && y <= handleY + 16) {
          const lockGranted = await onResizeStart(layer._id);
          if (lockGranted) {
            setIsResizing(true);
            setResizingLayerId(layer._id);
            setResizeStart({ x: e.clientX, y: e.clientY });
            setInitialSize({
              width: parseInt(size[0]),
              height: parseInt(size[1])
            });
            setInitialPosition(position);
            return;
          }
        }
      }
    }

    // Check for audio layers
    for (const layer of layers) {
      if (layer.action === "audio" && layer.properties.audioUrl) {
        const effectiveState = getEffectiveLayerState(layer);
        const position = effectiveState.positionOrigin;
        const size = effectiveState.size;
        if (
          x >= position.x &&
          x <= position.x + parseInt(size[0]) &&
          y >= position.y &&
          y <= position.y + parseInt(size[1])
        ) {
          handleAudioClick(layer);
          return;
        }
      }
    }

    // Check for draggable layers - MODERATOR BYPASS
    if (interactionStates.drag || isModerator) {
      for (const layer of layers) {
        if (layer.action === "drag") {
          if (isLayerLockedByOther(layer._id)) {
            continue;
          }
          
          const effectiveState = getEffectiveLayerState(layer);
          const position = effectiveState.positionOrigin;
          const size = effectiveState.size;
          if (
            x >= position.x &&
            x <= position.x + parseInt(size[0]) &&
            y >= position.y &&
            y <= position.y + parseInt(size[1])
          ) {
            const lockGranted = await onDragStart(layer._id);
            if (lockGranted) {
              setIsDragging(true);
              setDraggingLayerId(layer._id);
              setDragStart({ x: x - position.x, y: y - position.y });
              return;
            }
          }
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scrollLeft = canvas.parentElement.scrollLeft || 0;
    const scrollTop = canvas.parentElement.scrollTop || 0;
    const x = (e.clientX - rect.left) + scrollLeft;
    const y = (e.clientY - rect.top) + scrollTop;
  
    if (isResizing && resizingLayerId) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(50, initialSize.width + deltaX);
      const newHeight = Math.max(50, initialSize.height + deltaY);
      const newSize = [`${newWidth}px`, `${newHeight}px`];
      
      onResizeMove(resizingLayerId, newSize, initialPosition);
      redrawCanvas();
      return;
    }
  
    if (isDragging && draggingLayerId) {
      const newPosition = {
        x: x - dragStart.x,
        y: y - dragStart.y
      };
  
      onDragMove(draggingLayerId, newPosition);
      redrawCanvas();
    }
  };

  const handleMouseUp = (e) => {
    if (isResizing && resizingLayerId) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const finalWidth = Math.max(50, initialSize.width + deltaX);
      const finalHeight = Math.max(50, initialSize.height + deltaY);
      const finalSize = [`${finalWidth}px`, `${finalHeight}px`];
      
      onResizeEnd(resizingLayerId, finalSize, initialPosition);
      
      setIsResizing(false);
      setResizingLayerId(null);
      return;
    }
  
    if (isDragging && draggingLayerId) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scrollLeft = canvas.parentElement.scrollLeft || 0;
      const scrollTop = canvas.parentElement.scrollTop || 0;
      const x = (e.clientX - rect.left) + scrollLeft;
      const y = (e.clientY - rect.top) + scrollTop;
      
      const finalPosition = {
        x: x - dragStart.x,
        y: y - dragStart.y
      };
      
      const layer = layers.find(l => l._id === draggingLayerId);
      let completed = false;
      
      if (layer && layer.action === "drag" && layer.properties.positionDestination) {
        if (isNearDestination(finalPosition, layer.properties.positionDestination)) {
          completed = true;
          finalPosition.x = layer.properties.positionDestination.x;
          finalPosition.y = layer.properties.positionDestination.y;
        } else {
          applyVibration(draggingLayerId);
        }
      }
      
      onDragEnd(draggingLayerId, finalPosition, completed);
      
      setIsDragging(false);
      setDraggingLayerId(null);
    }
  };

  // Handle audio playback - MODERATOR BYPASS
  const handleAudioClick = (layer) => {
    if (!interactionStates.audio && !isModerator) {
      return;
    }

    const audioUrl = layer.properties.audioUrl;
    
    if (playingAudioLayerId === layer._id && audioRef.current) {
      audioRef.current.pause();
      setPlayingAudioLayerId(null);
      onCanvasInteraction('audio', {
        layerId: layer._id,
        action: 'pause'
      });
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.addEventListener('ended', () => {
        setPlayingAudioLayerId(null);
      });
      
      audio.play()
        .then(() => {
          setPlayingAudioLayerId(layer._id);
          onCanvasInteraction('audio', {
            layerId: layer._id,
            action: 'play'
          });
        })
        .catch(err => {
          console.error("Error playing audio:", err);
        });
    }
  };

  // Handle shape color filling - MODERATOR BYPASS
  const handleShapeClick = (e, shapeId) => {
    if (!interactionStates.colorfill && !isModerator) {
      return;
    }
    
    if (!activeColor) {
      return;
    }

    const targetElement = e.target;
    if (!targetElement.getAttribute || !targetElement.getAttribute('fill')) return;
    
    const elementId = targetElement.id || targetElement.tagName;
    
    setCanvasShapes(shapes => 
      shapes.map(shape => {
        if (shape.id === shapeId) {
          const newFills = {
            ...shape.fills,
            [elementId]: activeColor
          };
          return { ...shape, fills: newFills };
        }
        return shape;
      })
    );

    onCanvasInteraction('colorfill', {
      shapeId,
      elementId,
      color: activeColor
    });
  };

  // Handle 3D model rotation - MODERATOR BYPASS
  const handle3DMouseDown = async (e, objectId) => {
    if (!interactionStates.model3d && !isModerator) {
      return;
    }

    e.stopPropagation();
    
    const layer = layers.find(l => (l.objectId || `3d-${l._id}`) === objectId);
    if (!layer) return;

    if (isLayerLockedByOther(layer._id)) {
      return;
    }

    const lockGranted = await on3DStart(layer._id);
    if (!lockGranted) {
      return;
    }

    setIsRotating3D(true);
    setRotating3DId(objectId);
    setRotationStart({ x: e.clientX, y: e.clientY });
    setInitialRotation(layer.properties.rotation || { x: 0, y: 0, z: 0 });
  };

  const handle3DMouseMove = (e) => {
    if (!isRotating3D || !rotating3DId) return;

    const deltaX = e.clientX - rotationStart.x;
    const deltaY = e.clientY - rotationStart.y;

    const newRotation = {
      x: initialRotation.x + deltaY * 0.5,
      y: initialRotation.y + deltaX * 0.5,
      z: initialRotation.z
    };

    // Store current rotation for final update
    setCurrentRotation(newRotation);

    const viewer = modelViewers.current[rotating3DId];
    if (viewer) {
      viewer.setModelRotation(newRotation.x, newRotation.y, newRotation.z);
    }

    const layer = layers.find(l => (l.objectId || `3d-${l._id}`) === rotating3DId);
    if (layer) {
      on3DMove(layer._id, rotating3DId, newRotation);
    }
  };

  const handle3DMouseUp = () => {
    if (isRotating3D && rotating3DId) {
      const layer = layers.find(l => (l.objectId || `3d-${l._id}`) === rotating3DId);
      if (layer) {
        // Use the stored current rotation as final rotation
        const finalRotation = currentRotation;
        
        console.log('3D Mouse up - final rotation:', finalRotation);
        on3DEnd(layer._id, rotating3DId, finalRotation);
      }
    }
    
    setIsRotating3D(false);
    setRotating3DId(null);
  };

  // Handle toolbar color selection
  const handleToolbarColorSelect = (color) => {
    setActiveColor(color);
  };

  // Handle toolbar dragging
  const handleToolbarMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingToolbar(true);
    setDragStart({ x: e.clientX - toolbarPosition.x, y: e.clientY - toolbarPosition.y });
  };

  const handleToolbarMouseMove = (e) => {
    if (!isDraggingToolbar) return;
    
    setToolbarPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleToolbarMouseUp = () => {
    setIsDraggingToolbar(false);
  };

  // Effects
  useEffect(() => {
    if (isRotating3D) {
      document.addEventListener('mousemove', handle3DMouseMove);
      document.addEventListener('mouseup', handle3DMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handle3DMouseMove);
        document.removeEventListener('mouseup', handle3DMouseUp);
      };
    }
  }, [isRotating3D, rotating3DId, rotationStart, initialRotation]);

  useEffect(() => {
    if (isDraggingToolbar) {
      document.addEventListener('mousemove', handleToolbarMouseMove);
      document.addEventListener('mouseup', handleToolbarMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleToolbarMouseMove);
        document.removeEventListener('mouseup', handleToolbarMouseUp);
      };
    }
  }, [isDraggingToolbar, dragStart]);

  useEffect(() => {
    let animationFrame;
    if (vibratingLayerIds.size > 0) {
      const animate = () => {
        redrawCanvas();
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [vibratingLayerIds.size]);

  useEffect(() => {
    preloadImages();
  }, [layers]);

  useEffect(() => {
    const shouldRedraw = !isDragging && !isResizing && !isRotating3D;
    
    if (shouldRedraw) {
      redrawCanvas();
    }
  }, [layers, currentPage, myLocks, layerLocks]);

  if (!currentPage) {
    return (
      <div className="canvas-placeholder">
        <div>No page selected</div>
      </div>
    );
  }

  return (
    <div className="kids-canvas-container">
      <div 
        className="canvas-scroll-wrapper"
        style={{
          width: '800px',
          height: '600px',
          overflow: 'auto',
          position: 'relative'
        }}
      >
        <div 
          className="canvas-wrapper"
          style={{
            width: `${800 * (zoomLevel / 100)}px`,
            height: `${600 * (zoomLevel / 100)}px`,
            position: 'relative'
          }}
        >
          <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="main-canvas"
          style={{
            width: `${800 * (zoomLevel / 100)}px`,
            height: `${600 * (zoomLevel / 100)}px`,
            display: 'block'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        <div className="models-overlay" style={{ pointerEvents: 'none' }}>
          {layers
            .filter(layer => 
              layer.action === "model3d" && 
              layer.properties.modelUrl &&
              layer.pageId === currentPage._id
            )
            .map((layer) => {
              const objectId = layer.objectId || `3d-${layer._id}`;
              const effectiveState = getEffectiveLayerState(layer);
              const position = effectiveState.positionOrigin;
              const size = effectiveState.size;
              const scale = zoomLevel / 100;
              const isLocked = isLayerLockedByOther(layer._id);
              const isMyLock = myLocks.has(layer._id);
              
              return (
                <div
                  key={objectId}
                  className="model-container"
                  style={{
                    position: 'absolute',
                    left: `${position.x * scale}px`,
                    top: `${position.y * scale}px`,
                    width: `${parseInt(size[0]) * scale}px`,
                    height: `${parseInt(size[1]) * scale}px`,
                    cursor: ((interactionStates.model3d || isModerator) && !isLocked) ? 'grab' : 'default',
                    pointerEvents: ((interactionStates.model3d || isModerator) && !isLocked) ? 'all' : 'none',
                    border: isLocked ? '3px solid #ff4757' : (isMyLock ? '3px solid #2ed573' : 'none'),
                    borderRadius: '4px'
                  }}
                  ref={el => {
                    if (el) modelContainersRef.current[objectId] = el;
                  }}
                  onMouseDown={(e) => handle3DMouseDown(e, objectId)}
                />
              );
            })}
        </div>

        <div className="shapes-overlay" style={{ pointerEvents: 'none' }}>
          {canvasShapes
            .filter(shape => {
              const layerExists = layers.some(layer => 
                layer.shapeId === shape.id && 
                layer.pageId === currentPage._id
              );
              return layerExists;
            })
            .map((shape) => {
              const scale = zoomLevel / 100;
              let filledSvg;
              try {
                filledSvg = applyFillsToSvgString(shape.svg, shape.fills);
                filledSvg = enhanceSvgVisibility(filledSvg);
              } catch (error) {
                console.error('Error processing SVG:', error);
                filledSvg = createFallbackSvg();
              }
              
              return (
                <div
                  key={shape.id}
                  className="shape-container"
                  style={{
                    position: 'absolute',
                    left: `${shape.x * scale}px`,
                    top: `${shape.y * scale}px`,
                    pointerEvents: (interactionStates.colorfill || isModerator) ? 'auto' : 'none',
                    cursor: ((interactionStates.colorfill || isModerator) && activeColor) ? 'pointer' : 'default',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left'
                  }}
                  onClick={(e) => handleShapeClick(e, shape.id)}
                >
                  <div 
                    dangerouslySetInnerHTML={{ __html: filledSvg }}
                    style={{ 
                      width: '100px',
                      height: '100px',
                      filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))'
                    }}
                  />
                </div>
              );
            })}
        </div>

        {((interactionStates.colorfill || isModerator) && 
         selectedColors.length > 0 && 
         layers.some(layer => layer.action === "colorfill" && layer.pageId === currentPage._id)) && (
          <div 
            className="floating-color-toolbar"
            style={{ 
              position: 'absolute',
              left: `${toolbarPosition.x}px`, 
              top: `${toolbarPosition.y}px`,
              zIndex: 1000,
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              cursor: 'move',
              backdropFilter: 'blur(10px)'
            }}
            onMouseDown={handleToolbarMouseDown}
          >
            <div className="toolbar-colors" style={{ display: 'flex', gap: '10px' }}>
              {selectedColors.map((color) => (
                <div 
                  key={color}
                  className={`toolbar-color ${activeColor === color ? 'active' : ''}`}
                  style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    backgroundColor: color,
                    border: activeColor === color ? '3px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    boxShadow: activeColor === color ? 
                      '0 0 0 2px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.3)' : 
                      '0 2px 8px rgba(0,0,0,0.1)',
                    transform: activeColor === color ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleToolbarColorSelect(color)}
                />
              ))}
            </div>
            {!activeColor && (
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '8px', 
                textAlign: 'center',
                fontWeight: '500'
              }}>
                Select a color to paint
              </div>
            )}
          </div>
        )}

        {layers
          .filter(layer => layer.action === "audio" && layer.properties.audioUrl)
          .map(layer => (
            <audio
              key={layer._id}
              id={`audio-${layer._id}`}
              src={layer.properties.audioUrl}
              style={{ display: 'none' }}
            />
          ))}
      </div>
    </div>
  </div>
);
});

export default KidsCanvas;