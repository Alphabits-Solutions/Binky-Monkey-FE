import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (socketUrl) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const messageQueueRef = useRef([]);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      setReconnecting(false);
      setConnectionError(null);
      
      // Send queued messages
      if (messageQueueRef.current.length > 0) {
        messageQueueRef.current.forEach(message => {
          socketInstance.emit(message.event, message.data);
        });
        messageQueueRef.current = [];
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        setReconnecting(true);
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setReconnecting(false);
      setConnectionError(null);
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber);
      setReconnecting(true);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      setConnectionError('Reconnection failed');
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('Socket reconnection failed completely');
      setReconnecting(false);
      setConnectionError('Unable to reconnect to server');
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socketInstance.disconnect();
    };
  }, [socketUrl]);

  // Queue message if not connected
  const queueMessage = useCallback((event, data) => {
    messageQueueRef.current.push({ event, data });
  }, []);

  // Join activity room
  const joinActivity = useCallback((activityData) => {
    if (socket && isConnected) {
      socket.emit('join-activity', activityData);
    } else {
      queueMessage('join-activity', activityData);
    }
  }, [socket, isConnected, queueMessage]);

  // Send canvas interaction
  const sendCanvasInteraction = useCallback((interactionData) => {
    if (socket && isConnected) {
      socket.emit('canvas-interaction', interactionData);
    } else {
      queueMessage('canvas-interaction', interactionData);
    }
  }, [socket, isConnected, queueMessage]);

  // Send admin control
  const sendAdminControl = useCallback((controlData) => {
    if (socket && isConnected) {
      socket.emit('admin-control', controlData);
    } else {
      queueMessage('admin-control', controlData);
    }
  }, [socket, isConnected, queueMessage]);

  // Send page change
  const sendPageChange = useCallback((pageData) => {
    if (socket && isConnected) {
      socket.emit('page-change', pageData);
    } else {
      queueMessage('page-change', pageData);
    }
  }, [socket, isConnected, queueMessage]);

  // Send zoom control
  const sendZoomControl = useCallback((zoomData) => {
    if (socket && isConnected) {
      socket.emit('zoom-control', zoomData);
    } else {
      queueMessage('zoom-control', zoomData);
    }
  }, [socket, isConnected, queueMessage]);

  // NEW: Request lock for layer interaction
  const requestLock = useCallback(async (layerId, interactionType) => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve(false);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000); // 5 second timeout

      const handleLockResponse = (data) => {
        if (data.layerId === layerId) {
          clearTimeout(timeout);
          socket.off('lock-granted', handleLockResponse);
          socket.off('lock-denied', handleLockResponse);
          resolve(data.success !== false);
        }
      };

      socket.on('lock-granted', handleLockResponse);
      socket.on('lock-denied', handleLockResponse);

      socket.emit('request-lock', {
        layerId,
        interactionType,
        timestamp: Date.now()
      });
    });
  }, [socket, isConnected]);

  // NEW: Release lock for layer
  const releaseLock = useCallback((layerId) => {
    if (socket && isConnected) {
      socket.emit('release-lock', {
        layerId,
        timestamp: Date.now()
      });
    } else {
      queueMessage('release-lock', { layerId, timestamp: Date.now() });
    }
  }, [socket, isConnected, queueMessage]);

  // Send celebrate
  const sendCelebrate = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('celebrate', { timestamp: Date.now() });
    } else {
      queueMessage('celebrate', { timestamp: Date.now() });
    }
  }, [socket, isConnected, queueMessage]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    if (socket) {
      setReconnecting(true);
      setConnectionError(null);
      socket.connect();
    }
  }, [socket]);

  // Get connection quality indicator
  const getConnectionQuality = useCallback(() => {
    if (!socket || !isConnected) return 'poor';
    
    const ping = socket.ping;
    if (ping < 100) return 'excellent';
    if (ping < 300) return 'good';
    if (ping < 500) return 'fair';
    return 'poor';
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    reconnecting,
    connectionError,
    joinActivity,
    sendCanvasInteraction,
    sendAdminControl,
    sendPageChange,
    sendZoomControl,
    requestLock,     // NEW
    releaseLock,     // NEW
    sendCelebrate,
    reconnect,
    getConnectionQuality
  };
};