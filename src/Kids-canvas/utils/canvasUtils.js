// Canvas utility functions for kids canvas

// Safely check if a string is valid SVG
export const isValidSvg = (svgString) => {
    if (!svgString || typeof svgString !== 'string') {
      return false;
    }
    
    // Basic check for SVG tag
    if (!svgString.trim().startsWith('<svg') && !svgString.includes('<svg')) {
      return false;
    }
    
    // Check if it's parseable as XML
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');
      return !doc.querySelector('parsererror');
    } catch (error) {
      console.error('SVG validation error:', error);
      return false;
    }
  };
  
  // Create a fallback SVG when input is invalid
  export const createFallbackSvg = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" fill="#f0f0f0" />
      <text x="50" y="50" font-size="12" text-anchor="middle" fill="#666" dominant-baseline="middle">SVG</text>
    </svg>`;
  };
  
  // Safely apply fills to SVG string with extensive error handling
  export const applyFillsToSvgString = (svgString, fills) => {
    // Check if input is valid
    if (!svgString || typeof svgString !== 'string') {
      console.warn('Invalid SVG input, using fallback');
      return createFallbackSvg();
    }
    
    // If no fills or empty fills object, just return the SVG
    if (!fills || Object.keys(fills).length === 0) {
      return svgString;
    }
    
    try {
      // If the SVG string doesn't start with <svg, wrap it
      let processedSvg = svgString;
      if (!processedSvg.trim().startsWith('<svg')) {
        processedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${processedSvg}</svg>`;
      }
      
      // Create a temporary DOM element to parse SVG
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(processedSvg, 'image/svg+xml');
      
      // Check for parsing errors
      const parserError = svgDoc.querySelector('parsererror');
      if (parserError) {
        console.error('SVG parsing error:', parserError.textContent);
        return createFallbackSvg();
      }
      
      // Get the SVG element
      const svgElement = svgDoc.documentElement;
      if (!svgElement || svgElement.tagName !== 'svg') {
        console.warn('No SVG element found in parsed document');
        return createFallbackSvg();
      }
      
      // Apply fills to elements
      Object.entries(fills).forEach(([selector, color]) => {
        let elements = [];
        
        try {
          // Try to find by ID first
          if (selector.startsWith('#')) {
            const idSelector = selector.substring(1);
            const element = svgDoc.getElementById(idSelector);
            if (element) elements = [element];
          } else {
            // Try by ID without the # prefix
            const element = svgDoc.getElementById(selector);
            if (element) {
              elements = [element];
            } else {
              // Try by tag name
              elements = svgDoc.getElementsByTagName(selector);
            }
          }
        } catch (e) {
          console.warn(`Error selecting elements with selector ${selector}:`, e);
        }
        
        // Apply fill color to all matching elements
        Array.from(elements).forEach(el => {
          try {
            el.setAttribute('fill', color);
          } catch (e) {
            console.warn(`Error applying fill to element:`, e);
          }
        });
      });
      
      // Get the updated SVG content
      const serializer = new XMLSerializer();
      return serializer.serializeToString(svgElement);
    } catch (error) {
      console.error('Error applying fills to SVG:', error);
      return createFallbackSvg();
    }
  };
  
  // Enhanced function to improve SVG visibility
  export const enhanceSvgVisibility = (svgString) => {
    // Validate input
    if (!isValidSvg(svgString)) {
      console.warn('Invalid SVG for enhancement, using fallback');
      return createFallbackSvg();
    }
  
    try {
      // If the SVG string doesn't start with <svg, wrap it
      let processedSvg = svgString;
      if (!processedSvg.trim().startsWith('<svg')) {
        processedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${processedSvg}</svg>`;
      }
      
      // Parse the SVG
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(processedSvg, 'image/svg+xml');
      
      // Check for parsing errors
      const parserError = svgDoc.querySelector('parsererror');
      if (parserError) {
        console.error('SVG parsing error in enhanceSvgVisibility:', parserError.textContent);
        return createFallbackSvg();
      }
      
      const svg = svgDoc.documentElement;
      
      // Ensure it has a viewBox
      if (!svg.hasAttribute('viewBox')) {
        // Try to determine dimensions from width/height
        const width = svg.getAttribute('width') || 100;
        const height = svg.getAttribute('height') || 100;
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }
      
      // Ensure width and height
      if (!svg.hasAttribute('width')) {
        svg.setAttribute('width', '100');
      }
      
      if (!svg.hasAttribute('height')) {
        svg.setAttribute('height', '100');
      }
      
      // Find all shape elements
      const elements = svg.querySelectorAll('path, rect, circle, ellipse, line, polyline, polygon');
      
      // If no elements, add a background rectangle
      if (elements.length === 0) {
        const rect = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', '#f0f0f0');
        svg.insertBefore(rect, svg.firstChild);
      } else {
        // Check if elements have visible fills
        let hasVisibleFill = false;
        elements.forEach(el => {
          const fill = el.getAttribute('fill');
          if (fill && fill !== 'none') {
            hasVisibleFill = true;
          }
        });
        
        // Add fills if needed
        if (!hasVisibleFill) {
          elements.forEach(el => {
            if (!el.getAttribute('fill') || el.getAttribute('fill') === 'none') {
              // Use a different fill color for each element type to make them distinguishable
              const elementType = el.tagName.toLowerCase();
              let fillColor = '#333333';
              
              switch(elementType) {
                case 'path': fillColor = '#4285F4'; break;      // Blue
                case 'rect': fillColor = '#0F9D58'; break;      // Green
                case 'circle': fillColor = '#DB4437'; break;    // Red
                case 'ellipse': fillColor = '#F4B400'; break;   // Yellow
                case 'polygon': fillColor = '#9C27B0'; break;   // Purple
                case 'polyline': fillColor = '#FF9800'; break;  // Orange
                case 'line': fillColor = '#00BCD4'; break;      // Cyan
              }
              
              el.setAttribute('fill', fillColor);
            }
          });
        }
      }
      
      // Convert back to string
      const serializer = new XMLSerializer();
      return serializer.serializeToString(svg);
    } catch (error) {
      console.error('Error enhancing SVG visibility:', error);
      return createFallbackSvg();
    }
  };
  
  // Position utilities
  export const isPositionNear = (pos1, pos2, tolerance = 30) => {
    return Math.abs(pos1.x - pos2.x) <= tolerance && Math.abs(pos1.y - pos2.y) <= tolerance;
  };
  
  export const clampPosition = (position, bounds) => {
    return {
      x: Math.max(0, Math.min(bounds.width, position.x)),
      y: Math.max(0, Math.min(bounds.height, position.y))
    };
  };
  
  // Animation utilities
  export const createVibrationEffect = (element, duration = 500) => {
    if (!element) return;
    
    const keyframes = [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(0)' }
    ];
    
    const options = {
      duration,
      easing: 'ease-in-out',
      iterations: 3
    };
    
    element.animate(keyframes, options);
  };
  
  // Color utilities
  export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  export const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  
  // Canvas drawing utilities
  export const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };
  
  // Debounce utility for performance
  export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  // Throttle utility for real-time updates
  export const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };
  
  // Deep clone utility
  export const deepClone = (obj) => {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
      const clonedObj = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  };
  
  // Generate unique ID
  export const generateId = () => {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };