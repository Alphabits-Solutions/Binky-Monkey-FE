// Socket.IO event constants and utilities

// Client to Server Events
export const CLIENT_EVENTS = {
    JOIN_ACTIVITY: 'join-activity',
    CANVAS_INTERACTION: 'canvas-interaction',
    ADMIN_CONTROL: 'admin-control',
    PAGE_CHANGE: 'page-change',
    SYNC_REQUEST: 'sync-request'
  };
  
  // Server to Client Events
  export const SERVER_EVENTS = {
    ROOM_STATE: 'room-state',
    INTERACTION_CONTROL: 'interaction-control',
    CANVAS_UPDATE: 'canvas-update',
    PAGE_CHANGED: 'page-changed',
    INTERACTION_BLOCKED: 'interaction-blocked',
    USER_JOINED: 'user-joined',
    USER_LEFT: 'user-left',
    SYNC_DATA: 'sync-data',
    ERROR: 'error'
  };
  
  // Interaction Types
  export const INTERACTION_TYPES = {
    DRAG: 'drag',
    COLORFILL: 'colorfill',
    AUDIO: 'audio',
    MODEL3D: 'model3d'
  };
  
  // Canvas Interaction Event Creators
  export const createCanvasInteraction = (type, data) => {
    const baseEvent = {
      type,
      timestamp: Date.now(),
      ...data
    };
  
    switch (type) {
      case INTERACTION_TYPES.DRAG:
        return {
          ...baseEvent,
          layerId: data.layerId,
          position: data.position,
          completed: data.completed || false
        };
  
      case INTERACTION_TYPES.COLORFILL:
        return {
          ...baseEvent,
          shapeId: data.shapeId,
          elementId: data.elementId,
          color: data.color
        };
  
      case INTERACTION_TYPES.AUDIO:
        return {
          ...baseEvent,
          layerId: data.layerId,
          action: data.action // 'play' or 'pause'
        };
  
      case INTERACTION_TYPES.MODEL3D:
        return {
          ...baseEvent,
          objectId: data.objectId,
          rotation: data.rotation,
          scale: data.scale
        };
  
      default:
        return baseEvent;
    }
  };
  
  // Admin Control Event Creator
  export const createAdminControl = (interactionType, enabled) => {
    return {
      interactionType,
      enabled,
      timestamp: Date.now()
    };
  };
  
  // Page Change Event Creator
  export const createPageChange = (pageId, pageIndex) => {
    return {
      pageId,
      pageIndex,
      timestamp: Date.now()
    };
  };
  
  // Join Activity Event Creator
  export const createJoinActivity = (activityId, userId, isModerator, userName) => {
    return {
      activityId,
      userId,
      isModerator,
      userName,
      timestamp: Date.now()
    };
  };
  
  // Event Validators
  export const validateCanvasInteraction = (event) => {
    if (!event.type || !INTERACTION_TYPES[event.type.toUpperCase()]) {
      return { valid: false, error: 'Invalid interaction type' };
    }
  
    switch (event.type) {
      case INTERACTION_TYPES.DRAG:
        if (!event.layerId || !event.position) {
          return { valid: false, error: 'Missing layerId or position for drag interaction' };
        }
        if (typeof event.position.x !== 'number' || typeof event.position.y !== 'number') {
          return { valid: false, error: 'Invalid position coordinates' };
        }
        break;
  
      case INTERACTION_TYPES.COLORFILL:
        if (!event.shapeId || !event.elementId || !event.color) {
          return { valid: false, error: 'Missing shapeId, elementId, or color for colorfill interaction' };
        }
        if (!isValidColor(event.color)) {
          return { valid: false, error: 'Invalid color format' };
        }
        break;
  
      case INTERACTION_TYPES.AUDIO:
        if (!event.layerId || !event.action) {
          return { valid: false, error: 'Missing layerId or action for audio interaction' };
        }
        if (!['play', 'pause'].includes(event.action)) {
          return { valid: false, error: 'Invalid audio action' };
        }
        break;
  
      case INTERACTION_TYPES.MODEL3D:
        if (!event.objectId) {
          return { valid: false, error: 'Missing objectId for 3D model interaction' };
        }
        if (event.rotation && !isValidRotation(event.rotation)) {
          return { valid: false, error: 'Invalid rotation format' };
        }
        if (event.scale && (typeof event.scale !== 'number' || event.scale <= 0)) {
          return { valid: false, error: 'Invalid scale value' };
        }
        break;
    }
  
    return { valid: true };
  };
  
  // Helper validation functions
  const isValidColor = (color) => {
    return typeof color === 'string' && /^#[0-9A-F]{6}$/i.test(color);
  };
  
  const isValidRotation = (rotation) => {
    return rotation && 
           typeof rotation.x === 'number' && 
           typeof rotation.y === 'number' && 
           typeof rotation.z === 'number';
  };
  
  // Rate limiting utilities
  export const createRateLimiter = (maxRequests = 10, windowMs = 1000) => {
    const requests = new Map();
    
    return (userId) => {
      const now = Date.now();
      const userRequests = requests.get(userId) || [];
      
      // Remove old requests outside the window
      const validRequests = userRequests.filter(time => now - time < windowMs);
      
      if (validRequests.length >= maxRequests) {
        return false; // Rate limit exceeded
      }
      
      validRequests.push(now);
      requests.set(userId, validRequests);
      return true; // Request allowed
    };
  };
  
  // Message queue for offline handling
  export class MessageQueue {
    constructor(maxSize = 100) {
      this.queue = [];
      this.maxSize = maxSize;
    }
    
    add(message) {
      this.queue.push({
        ...message,
        queuedAt: Date.now()
      });
      
      // Keep queue size under limit
      if (this.queue.length > this.maxSize) {
        this.queue = this.queue.slice(-this.maxSize);
      }
    }
    
    getAll() {
      return [...this.queue];
    }
    
    clear() {
      this.queue = [];
    }
    
    removeOlderThan(ms) {
      const cutoff = Date.now() - ms;
      this.queue = this.queue.filter(msg => msg.queuedAt > cutoff);
    }
  }
  
  // Connection quality assessment
  export const assessConnectionQuality = (ping, jitter = 0, packetLoss = 0) => {
    let score = 100;
    
    // Ping impact
    if (ping > 500) score -= 50;
    else if (ping > 300) score -= 30;
    else if (ping > 150) score -= 15;
    else if (ping > 100) score -= 5;
    
    // Jitter impact
    if (jitter > 100) score -= 20;
    else if (jitter > 50) score -= 10;
    else if (jitter > 20) score -= 5;
    
    // Packet loss impact
    score -= packetLoss * 2;
    
    score = Math.max(0, Math.min(100, score));
    
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  };
  
  // Error codes
  export const ERROR_CODES = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    RATE_LIMITED: 'RATE_LIMITED',
    INVALID_DATA: 'INVALID_DATA',
    CONNECTION_FAILED: 'CONNECTION_FAILED',
    ACTIVITY_NOT_FOUND: 'ACTIVITY_NOT_FOUND',
    INTERACTION_DISABLED: 'INTERACTION_DISABLED'
  };
  
  // Error message creator
  export const createErrorMessage = (code, message, details = null) => {
    return {
      code,
      message,
      details,
      timestamp: Date.now()
    };
  };