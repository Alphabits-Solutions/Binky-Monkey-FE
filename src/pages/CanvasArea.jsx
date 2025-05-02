// CanvasArea.jsx
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { enhanceSvgVisibility, applyFillsToSvgString, createFallbackSvg, isValidSvg } from './utils';

// Utility function to check if object is a File-like or Blob-like object
const isFileOrBlob = (obj) => {
  return obj && typeof obj === 'object' && 
    ((obj instanceof File) || 
     (obj instanceof Blob) || 
     (obj.type && obj.size !== undefined) || 
     (obj.name && obj.size !== undefined));
};

const CanvasArea = () => {
  // Add state for debugging
  const [showDebug, setShowDebug] = useState(false);
  
  // Get values from context
  const {
    canvasRef,
    canvasShapes,
    setCanvasShapes,
    previewMode,
    setPreviewMode,
    draggedShapeRef,
    toolbarPosition,
    selectedColors,
    activeColor,
    setActiveColor,
    toolbarDragStartRef,
    setIsDraggingToolbar,
    movingShapeId,
    setMovingShapeId,
    mouseInitialPosRef,
    shapeInitialPosRef
  } = useContext(AppContext);

  // Handle shape drop on canvas
  const handleCanvasDrop = async (e) => {
    e.preventDefault();
    if (!draggedShapeRef.current) return;
    
    // Get canvas bounds
    const canvasBounds = canvasRef.current ? canvasRef.current.getBoundingClientRect() : null;
    if (!canvasBounds) return;
    
    // Calculate drop position relative to canvas
    const x = e.clientX - canvasBounds.left;
    const y = e.clientY - canvasBounds.top;
    
    try {
      // Get the shape data from drag event
      const shapeSource = draggedShapeRef.current;
      
      // Fetch the SVG content from the URL if it's a URL, or use the SVG string directly
      let svgContent = createFallbackSvg();
      
      try {
        // Handle File or Blob objects (from local uploads)
        if (isFileOrBlob(shapeSource)) {
          console.log('Processing uploaded SVG file:', shapeSource.name || 'unnamed');
          
          // Read the file content
          const reader = new FileReader();
          svgContent = await new Promise((resolve, reject) => {
            reader.onload = (e) => {
              const content = e.target.result;
              if (isValidSvg(content)) {
                console.log('Successfully read SVG file content');
                resolve(content);
              } else {
                console.warn('Invalid SVG file content, using fallback');
                resolve(createFallbackSvg());
              }
            };
            reader.onerror = () => {
              console.error('Error reading SVG file');
              reject(new Error('Failed to read SVG file'));
            };
            reader.readAsText(shapeSource);
          });
        }
        // Handle string-based sources
        else if (typeof shapeSource === 'string') {
          if (shapeSource.startsWith('<svg')) {
            // It's already an SVG string
            svgContent = shapeSource;
            console.log('Received SVG content directly');
          } else {
            // It's a URL, fetch the content
            const response = await fetch(shapeSource);
            if (response.ok) {
              const text = await response.text();
              
              // Validate the SVG content
              if (isValidSvg(text)) {
                svgContent = text;
                console.log('Fetched valid SVG content');
              } else {
                console.warn('Fetched invalid SVG content, using fallback');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing SVG content:', error);
      }
      
      // Enhance SVG visibility using our utility function
      svgContent = enhanceSvgVisibility(svgContent);
      
      // Ensure SVG has namespace if not present
      if (!svgContent.includes('xmlns')) {
        svgContent = svgContent.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      
      // Log the SVG content for debugging
      console.log('Enhanced SVG content (truncated):', svgContent.substring(0, 100) + '...');
      
      // Add shape to canvas
      const newShape = {
        id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        shapeId: shapeSource,
        svg: svgContent,
        x,
        y,
        fills: {} // Will store element id to color mapping
      };
      
      setCanvasShapes(prevShapes => [...prevShapes, newShape]);
    } catch (error) {
      console.error('Error adding shape to canvas:', error);
    } finally {
      draggedShapeRef.current = null;
    }
  };

  // Handle canvas drag over
  const handleCanvasDragOver = (e) => {
    e.preventDefault(); // Allow drop
  };

  // Handle toolbar drag start
  const handleToolbarDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Store initial positions
    toolbarDragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDraggingToolbar(true);
  };

  // Handle shape click to fill with active color
  const handleShapeClick = (e, canvasShapeId) => {
    if (!previewMode || !activeColor) return;
    
    // Find the target element that was clicked (the fillable part)
    const targetElement = e.target;
    if (!targetElement.getAttribute('fill')) return;
    
    // Update the fill color of the clicked shape part
    setCanvasShapes(canvasShapes.map(shape => {
      if (shape.id === canvasShapeId) {
        // Create a new fills object with the updated color
        const newFills = {
          ...shape.fills,
          [targetElement.id || targetElement.tagName]: activeColor
        };
        return { ...shape, fills: newFills };
      }
      return shape;
    }));
  };

  // Delete a shape from canvas
  const handleDeleteShape = (shapeId) => {
    setCanvasShapes(canvasShapes.filter(shape => shape.id !== shapeId));
  };

  // Start moving a shape
  const handleStartMoveShape = (e, shapeId) => {
    if (previewMode) return;
    
    e.stopPropagation();
    
    // Save current positions
    const shape = canvasShapes.find(s => s.id === shapeId);
    if (!shape) return;
    
    // Save initial positions
    mouseInitialPosRef.current = { x: e.clientX, y: e.clientY };
    shapeInitialPosRef.current = { x: shape.x, y: shape.y };
    
    // Set moving shape id
    setMovingShapeId(shapeId);
  };

  // Handle toolbar color selection
  const handleToolbarColorSelect = (color) => {
    if (previewMode) {
      setActiveColor(color);
    }
  };

  return (
    <div className="flex flex-col space-y-4 mx-4 flex-1" style={{paddingLeft:30}}>
      {/* Preview Toggle Button - Moved to the left side */}
      <div className="flex justify-start p-7" style={{margin:"10px 0px"}}>
        <div style={{padding:10}} className="bg-white rounded-md gap-3.5 shadow-md px-4 py-2 flex items-center space-x-3 border border-gray-100">
          <span className="text-gray-700 font-medium">Preview:</span>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={previewMode}
                onChange={() => setPreviewMode(!previewMode)}
              />
              <div className={`block ${previewMode ? ' bg-indigo-400' : 'bg-gray-200'}  w-14 h-7 rounded-full `}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-all duration-300 ${previewMode ? 'transform translate-x-7 bg-indigo-600' : ''}`}></div>
            </div>
            <span className="ml-3 text-gray-700">
              {/* {previewMode ? 'Coloring Mode' : 'Place Shapes'} */}
            </span>
          </label>
        </div>
      </div>

      {/* Canvas container - Now plain white */}
      <div 
        ref={canvasRef}
        className="w-5xl bg-white overflow-hidden border border-gray-200"
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
      >
        {/* Canvas content */}
        <div className="relative p-6" style={{ minHeight: "500px" }}>
          {/* Canvas empty state */}
          {/* {canvasShapes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">Drag shapes here to start coloring!</p>
              <p className="text-sm mt-2">{previewMode ? 'Switch back to Place Mode to move shapes around' : 'You can reposition shapes by dragging them'}</p>
            </div>
          )} */}
          
          {canvasShapes.map((shape) => {
            // Apply stored fills to the SVG and ensure visibility
            let filledSvg;
            try {
              filledSvg = applyFillsToSvgString(shape.svg, shape.fills);
              // Double-check visibility
              filledSvg = enhanceSvgVisibility(filledSvg);
            } catch (error) {
              console.error('Error processing SVG for render:', error);
              filledSvg = createFallbackSvg();
            }
            
            return (
              <div
                key={shape.id}
                className={`absolute ${!previewMode ? 'cursor-move' : 'cursor-pointer'}`}
                style={{
                  left: `${shape.x}px`,
                  top: `${shape.y}px`
                }}
                onClick={(e) => previewMode && handleShapeClick(e, shape.id)}
                onMouseDown={(e) => handleStartMoveShape(e, shape.id)}
              >
                <div className="relative group">
                  {/* Directly include the SVG content */}
                  <div 
                    dangerouslySetInnerHTML={{ __html: filledSvg }}
                    className={`filter drop-shadow-sm transition-transform ${!previewMode ? 'hover:scale-105' : ''}`}
                    style={{ 
                      border: '1px solid rgba(0,0,0,0.1)', 
                      background: 'rgba(255,255,255,0.8)', 
                      borderRadius: '4px',
                      width: '100px',
                      height: '100px' 
                    }}
                  />
                  {!previewMode && (
                    <button 
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteShape(shape.id);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Debug Button */}
          {/* <button 
            className="absolute top-2 right-2 bg-gray-200 text-xs px-2 py-1 rounded z-50"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button> */}

          {/* Debug Overlays */}
          {showDebug && canvasShapes.map((shape) => (
            <div
              key={`debug-${shape.id}`}
              className="absolute border-2 border-red-500 bg-red-100 bg-opacity-20 flex items-center justify-center"
              style={{
                left: `${shape.x}px`,
                top: `${shape.y}px`,
                width: '100px',
                height: '100px',
                zIndex: 1000,
                pointerEvents: 'none'
              }}
            >
              <div className="text-xs bg-white p-1 rounded text-red-500">
                Shape ID: {shape.id.substring(0, 8)}...
              </div>
            </div>
          ))}
          
          {/* Simplified Floating Color Toolbar (in preview mode) */}
          {previewMode && selectedColors.length > 0 && (
            <div 
              className="absolute bg-auto p-5 rounded-md cursor-move border border-gray-400"
              style={{ 
                left: `${toolbarPosition.x}px`, 
                top: `${toolbarPosition.y}px`,
                zIndex: 1000,
                padding:8,
              }}
              onMouseDown={handleToolbarDragStart}
            >
              <div className="flex flex-col">
                <div className="flex space-x-2 items-center gap-2">
                  {selectedColors.map((color) => (
                    <div 
                      key={color}
                      className={`w-8 h-8 rounded-full cursor-pointer ${activeColor === color ? 'ring-2 ring-black' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleToolbarColorSelect(color)}
                    />
                  ))}
                </div>
                {!activeColor && (
                  <div className="mt-1 text-xs text-gray-500">
                    Select a color
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CanvasArea;