// // utils.js
// // Helper functions for the coloring game

// // Function to apply fills to SVG elements based on shape.fills
// // export const applyFillsToSvgString = (svgString, fills) => {
// //     // Create a temporary DOM element to manipulate the SVG
// //     const tempDiv = document.createElement('div');
// //     tempDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${svgString}</svg>`;
// //     const svgElement = tempDiv.firstChild;
    
// //     if (!svgElement) return svgString;
    
// //     // Apply fills to each element
// //     Object.entries(fills || {}).forEach(([selector, color]) => {
// //       let element;
// //       if (selector.includes('#')) {
// //         element = svgElement.querySelector(selector);
// //       } else {
// //         // If selector is a tag name, we need to be careful as there might be multiple
// //         element = svgElement.querySelector(selector);
// //       }
      
// //       if (element) {
// //         element.setAttribute('fill', color);
// //       }
// //     });
    
// //     // Return the inner contents (without the outer svg tag)
// //     return svgElement.innerHTML;
// //   };

// // utils.js - Add these utility functions to your existing utils file

// // Fetch SVG content from a URL
// export const fetchSvgContent = async (url) => {
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error(`Failed to fetch SVG: ${response.status}`);
//     }
//     return await response.text();
//   } catch (error) {
//     console.error('Error fetching SVG content:', error);
//     // Return a simple fallback SVG
//     return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f0f0f0" /><text x="50" y="50" font-size="12" text-anchor="middle" fill="#666">SVG</text></svg>';
//   }
// };

// // Generate a unique ID
// export const generateId = () => {
//   return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
// };

// // Apply fill colors to SVG elements
// // export const applyFillsToSvgString = (svgString, fills) => {
// //   if (!svgString) return svgString;
  
// //   try {
// //     // Create a temporary DOM element to parse SVG
// //     const parser = new DOMParser();
// //     const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    
// //     // Check for parsing errors
// //     const parserError = svgDoc.querySelector('parsererror');
// //     if (parserError) {
// //       console.error('SVG parsing error:', parserError);
// //       return svgString;
// //     }
    
// //     // Apply fills to elements
// //     Object.entries(fills).forEach(([selector, color]) => {
// //       let elements;
      
// //       // Try to find by ID first
// //       elements = svgDoc.querySelectorAll(`#${selector}`);
      
// //       // If no elements found, try by tag name
// //       if (elements.length === 0) {
// //         elements = svgDoc.getElementsByTagName(selector);
// //       }
      
// //       // Apply fill color to all matching elements
// //       Array.from(elements).forEach(el => {
// //         el.setAttribute('fill', color);
// //       });
// //     });
    
// //     // Get the updated SVG content
// //     const serializer = new XMLSerializer();
// //     return serializer.serializeToString(svgDoc.documentElement);
// //   } catch (error) {
// //     console.error('Error applying fills to SVG:', error);
// //     return svgString;
// //   }
// // };

// // Add this to your utils.js file

// // Function to enhance SVG visibility
// // export const enhanceSvgVisibility = (svgString) => {
// //   if (!svgString || typeof svgString !== 'string') {
// //     console.error('Invalid SVG input:', svgString);
// //     return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#e0e0e0" /></svg>';
// //   }

// //   try {
// //     // If the SVG doesn't have a viewBox, add one
// //     if (!svgString.includes('viewBox')) {
// //       svgString = svgString.replace('<svg', '<svg viewBox="0 0 100 100"');
// //     }

// //     // Add width and height if missing
// //     if (!svgString.includes('width=')) {
// //       svgString = svgString.replace('<svg', '<svg width="100"');
// //     }
// //     if (!svgString.includes('height=')) {
// //       svgString = svgString.replace('<svg', '<svg height="100"');
// //     }

// //     // Make sure elements have fill attributes
// //     // First check if common shape elements exist without fill
// //     const hasElements = /<(rect|circle|path|polygon|ellipse)([^>]*)>/i.test(svgString);
// //     const hasFills = /fill=["'][^"']*["']/i.test(svgString);

// //     if (hasElements && !hasFills) {
// //       // Add fill attributes to common SVG elements
// //       svgString = svgString.replace(/<(rect|circle|path|polygon|ellipse)([^>]*)>/gi, (match, tag, attrs) => {
// //         if (!attrs.includes('fill=')) {
// //           return `<${tag}${attrs} fill="#333">`;
// //         }
// //         return match;
// //       });
// //     }

// //     // If SVG has "stroke" but no stroke color/width, add default values
// //     if (svgString.includes('stroke') && !svgString.includes('stroke=')) {
// //       svgString = svgString.replace('<svg', '<svg stroke="#000" stroke-width="1"');
// //     }

// //     // Add a background rectangle to ensure there's something visible
// //     if (!svgString.includes('<rect')) {
// //       const rectElement = '<rect width="100%" height="100%" fill="none" stroke="none"/>';
// //       svgString = svgString.replace('<svg', `<svg style="background: rgba(240,240,240,0.1);"`);
// //       // Insert rect after the opening svg tag
// //       const svgTagEnd = svgString.indexOf('>', svgString.indexOf('<svg')) + 1;
// //       svgString = svgString.substring(0, svgTagEnd) + rectElement + svgString.substring(svgTagEnd);
// //     }

// //     return svgString;
// //   } catch (error) {
// //     console.error('Error enhancing SVG visibility:', error);
// //     return svgString; // Return original if there's an error
// //   }
// // };

// // Improved SVG utility functions - add these to your utils.js file

// // Safely check if a string is valid SVG
// export const isValidSvg = (svgString) => {
//   if (!svgString || typeof svgString !== 'string') {
//     return false;
//   }
  
//   // Basic check for SVG tag
//   if (!svgString.trim().startsWith('<svg') && !svgString.includes('<svg')) {
//     return false;
//   }
  
//   // Check if it's parseable as XML
//   try {
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(svgString, 'image/svg+xml');
//     return !doc.querySelector('parsererror');
//   } catch (error) {
//     console.error('SVG validation error:', error);
//     return false;
//   }
// };

// // Create a fallback SVG when input is invalid
// export const createFallbackSvg = () => {
//   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
//     <rect width="100" height="100" fill="#f0f0f0" />
//     <text x="50" y="50" font-size="12" text-anchor="middle" fill="#666" dominant-baseline="middle">SVG</text>
//   </svg>`;
// };

// // Safely apply fills to SVG string with extensive error handling
// export const applyFillsToSvgString = (svgString, fills) => {
//   // Check if input is valid
//   if (!svgString || typeof svgString !== 'string') {
//     console.warn('Invalid SVG input, using fallback');
//     return createFallbackSvg();
//   }
  
//   // Basic check for SVG tag
//   if (!svgString.includes('<svg')) {
//     console.warn('Input does not contain SVG tag, using fallback');
//     return createFallbackSvg();
//   }
  
//   // If no fills or empty fills object, just return the SVG
//   if (!fills || Object.keys(fills).length === 0) {
//     return svgString;
//   }
  
//   try {
//     // Create a temporary DOM element to parse SVG
//     const parser = new DOMParser();
//     const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    
//     // Check for parsing errors
//     const parserError = svgDoc.querySelector('parsererror');
//     if (parserError) {
//       console.error('SVG parsing error:', parserError.textContent);
//       return createFallbackSvg();
//     }
    
//     // Get the SVG element
//     const svgElement = svgDoc.documentElement;
//     if (!svgElement || svgElement.tagName !== 'svg') {
//       console.warn('No SVG element found in parsed document');
//       return createFallbackSvg();
//     }
    
//     // Apply fills to elements
//     Object.entries(fills).forEach(([selector, color]) => {
//       let elements = [];
      
//       try {
//         // Try to find by ID first
//         if (selector.startsWith('#')) {
//           const idSelector = selector.substring(1);
//           const element = svgDoc.getElementById(idSelector);
//           if (element) elements = [element];
//         } else {
//           // Try by ID without the # prefix
//           const element = svgDoc.getElementById(selector);
//           if (element) {
//             elements = [element];
//           } else {
//             // Try by tag name
//             elements = svgDoc.getElementsByTagName(selector);
//           }
//         }
//       } catch (e) {
//         console.warn(`Error selecting elements with selector ${selector}:`, e);
//       }
      
//       // Apply fill color to all matching elements
//       Array.from(elements).forEach(el => {
//         try {
//           el.setAttribute('fill', color);
//         } catch (e) {
//           console.warn(`Error applying fill to element:`, e);
//         }
//       });
//     });
    
//     // Get the updated SVG content
//     const serializer = new XMLSerializer();
//     return serializer.serializeToString(svgElement);
//   } catch (error) {
//     console.error('Error applying fills to SVG:', error);
//     return createFallbackSvg();
//   }
// };

// // Enhanced function to improve SVG visibility
// export const enhanceSvgVisibility = (svgString) => {
//   // Validate input
//   if (!isValidSvg(svgString)) {
//     console.warn('Invalid SVG for enhancement, using fallback');
//     return createFallbackSvg();
//   }

//   try {
//     // Parse the SVG
//     const parser = new DOMParser();
//     const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    
//     // Check for parsing errors
//     const parserError = svgDoc.querySelector('parsererror');
//     if (parserError) {
//       console.error('SVG parsing error in enhanceSvgVisibility:', parserError.textContent);
//       return createFallbackSvg();
//     }
    
//     const svg = svgDoc.documentElement;
    
//     // Ensure it has a viewBox
//     if (!svg.hasAttribute('viewBox')) {
//       // Try to determine dimensions from width/height
//       const width = svg.getAttribute('width') || 100;
//       const height = svg.getAttribute('height') || 100;
//       svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
//     }
    
//     // Ensure width and height
//     if (!svg.hasAttribute('width')) {
//       svg.setAttribute('width', '100');
//     }
    
//     if (!svg.hasAttribute('height')) {
//       svg.setAttribute('height', '100');
//     }
    
//     // Find all shape elements
//     const elements = svg.querySelectorAll('path, rect, circle, ellipse, line, polyline, polygon');
    
//     // If no elements, add a background rectangle
//     if (elements.length === 0) {
//       const rect = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
//       rect.setAttribute('width', '100%');
//       rect.setAttribute('height', '100%');
//       rect.setAttribute('fill', '#f0f0f0');
//       svg.insertBefore(rect, svg.firstChild);
//     } else {
//       // Check if elements have visible fills
//       let hasVisibleFill = false;
//       elements.forEach(el => {
//         const fill = el.getAttribute('fill');
//         if (fill && fill !== 'none') {
//           hasVisibleFill = true;
//         }
//       });
      
//       // Add fills if needed
//       if (!hasVisibleFill) {
//         elements.forEach(el => {
//           if (!el.getAttribute('fill') || el.getAttribute('fill') === 'none') {
//             el.setAttribute('fill', '#333333');
//           }
//         });
//       }
//     }
    
//     // Convert back to string
//     const serializer = new XMLSerializer();
//     return serializer.serializeToString(svg);
//   } catch (error) {
//     console.error('Error enhancing SVG visibility:', error);
//     return createFallbackSvg();
//   }
// };

// utils.js - Fixed SVG handling

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