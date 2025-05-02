import React, { useState, useRef, useEffect } from 'react';

// Shape definitions
const SHAPES = [
  {
    id: 'circle',
    name: 'Circle',
    svg: '<circle cx="50" cy="50" r="40" fill="white" stroke="black" stroke-width="2" />'
  },
  {
    id: 'rectangle',
    name: 'Rectangle',
    svg: '<rect x="10" y="10" width="80" height="50" fill="white" stroke="black" stroke-width="2" />'
  },
  {
    id: 'triangle',
    name: 'Triangle',
    svg: '<polygon points="50,10 90,90 10,90" fill="white" stroke="black" stroke-width="2" />'
  },
  {
    id: 'star',
    name: 'Star',
    svg: '<path d="M50,10 L61,35 L89,35 L67,53 L78,78 L50,63 L22,78 L33,53 L11,35 L39,35 Z" fill="white" stroke="black" stroke-width="2" />'
  },
  {
    id: 'heart',
    name: 'Heart',
    svg: '<path d="M50,80 C35,60 0,50 0,20 C0,0 25,0 40,15 C45,20 50,25 50,25 C50,25 55,20 60,15 C75,0 100,0 100,20 C100,50 65,60 50,80 Z" fill="white" stroke="black" stroke-width="2" />'
  },
  {
    id: 'flower',
    name: 'Flower',
    svg: '<g><circle cx="50" cy="50" r="20" fill="white" stroke="black" stroke-width="2"/><circle cx="30" cy="30" r="15" fill="white" stroke="black" stroke-width="2"/><circle cx="70" cy="30" r="15" fill="white" stroke="black" stroke-width="2"/><circle cx="30" cy="70" r="15" fill="white" stroke="black" stroke-width="2"/><circle cx="70" cy="70" r="15" fill="white" stroke="black" stroke-width="2"/></g>'
  }
];

// Predefined colors
const PRESET_COLORS = [
  { name: 'Red', value: '#FF5252' },
  { name: 'Blue', value: '#4285F4' },
  { name: 'Green', value: '#0F9D58' },
  { name: 'Yellow', value: '#FFEB3B' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Cyan', value: '#00BCD4' },
];

// Helper to create a unique ID for elements
const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

// Simple color wheel visualization
const ColorWheelVisual = ({ value, onChange }) => {
  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Main color input */}
      <input 
        type="color" 
        value={value}
        onChange={onChange}
        className="absolute inset-0 w-full h-full cursor-pointer z-10 opacity-100"
      />
      
      {/* Current color indicator ring */}
      <div 
        className="absolute inset-0 rounded-full border-4 shadow-lg pointer-events-none"
        style={{ borderColor: value }}
      />
    </div>
  );
};

// Main component
const ColoringGamePreview = () => {
  // State for canvas shapes
  const [canvasShapes, setCanvasShapes] = useState([]);
  // State for selected colors (max 5)
  const [selectedColors, setSelectedColors] = useState([]);
  // State for preview mode
  const [previewMode, setPreviewMode] = useState(false);
  // State for current active color
  const [activeColor, setActiveColor] = useState(null);
  // Ref for drag operation
  const draggedShapeRef = useRef(null);
  // State for toolbar position
  const [toolbarPosition, setToolbarPosition] = useState({ x: 20, y: 20 });
  // State for undo history
  const [history, setHistory] = useState([]);
  // State for isDraggingToolbar
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  // Ref for toolbar initial position during drag
  const toolbarDragStartRef = useRef({ x: 0, y: 0 });
  // Ref for canvas element
  const canvasRef = useRef(null);
  // State for custom color picker
  const [customColor, setCustomColor] = useState('#FF5252');
  // State for color picker visibility
  const [showColorPicker, setShowColorPicker] = useState(false);
  // State for shape moving
  const [movingShapeId, setMovingShapeId] = useState(null);
  // Ref for initial mouse position
  const mouseInitialPosRef = useRef({ x: 0, y: 0 });
  // Ref for initial shape position
  const shapeInitialPosRef = useRef({ x: 0, y: 0 });

  // Handle shape drag start
  const handleShapeDragStart = (shapeId, e) => {
    draggedShapeRef.current = shapeId;
  };

  // Handle shape drop on canvas
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (!draggedShapeRef.current) return;
    
    // Get canvas bounds
    const canvasBounds = canvasRef.current ? canvasRef.current.getBoundingClientRect() : null;
    if (!canvasBounds) return;
    
    // Calculate drop position relative to canvas
    const x = e.clientX - canvasBounds.left;
    const y = e.clientY - canvasBounds.top;
    
    // Find the shape definition
    const shapeInfo = SHAPES.find(shape => shape.id === draggedShapeRef.current);
    
    if (shapeInfo) {
      // Save current state to history
      setHistory([...history, [...canvasShapes]]);
      
      // Add shape to canvas
      const newShape = {
        id: generateId(),
        shapeId: shapeInfo.id,
        svg: shapeInfo.svg,
        x,
        y,
        fills: {} // Will store element id to color mapping
      };
      
      setCanvasShapes([...canvasShapes, newShape]);
    }
    
    draggedShapeRef.current = null;
  };

  // Handle canvas drag over
  const handleCanvasDragOver = (e) => {
    e.preventDefault(); // Allow drop
  };

  // Handle toggling color selection
  const handleColorSelect = (color) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else if (selectedColors.length < 5) {
      setSelectedColors([...selectedColors, color]);
    }
  };
  
  // Handle adding custom color
  const handleAddCustomColor = () => {
    if (selectedColors.length < 5) {
      setSelectedColors([...selectedColors, customColor]);
      setShowColorPicker(false);
    }
  };
  
  // Handle custom color change
  const handleCustomColorChange = (e) => {
    setCustomColor(e.target.value);
  };

  // Handle color selection from toolbar in preview mode
  const handleToolbarColorSelect = (color) => {
    if (previewMode) {
      setActiveColor(color);
    }
  };

  // Handle shape click to fill with active color
  const handleShapeClick = (e, canvasShapeId) => {
    if (!previewMode || !activeColor) return;
    
    // Find the target element that was clicked (the fillable part)
    const targetElement = e.target;
    if (!targetElement.getAttribute('fill')) return;
    
    // Save current state to history
    setHistory([...history, [...canvasShapes]]);
    
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
  
  // Function to apply fills to SVG elements based on shape.fills
  const applyFillsToSvgString = (svgString, fills) => {
    // Create a temporary DOM element to manipulate the SVG
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${svgString}</svg>`;
    const svgElement = tempDiv.firstChild;
    
    if (!svgElement) return svgString;
    
    // Apply fills to each element
    Object.entries(fills || {}).forEach(([selector, color]) => {
      let element;
      if (selector.includes('#')) {
        element = svgElement.querySelector(selector);
      } else {
        // If selector is a tag name, we need to be careful as there might be multiple
        element = svgElement.querySelector(selector);
      }
      
      if (element) {
        element.setAttribute('fill', color);
      }
    });
    
    // Return the inner contents (without the outer svg tag)
    return svgElement.innerHTML;
  };

  // Handle undo action
  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setCanvasShapes(previousState);
      setHistory(history.slice(0, -1));
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    if (canvasShapes.length > 0) {
      setHistory([...history, [...canvasShapes]]);
      setCanvasShapes([]);
    }
  };

  // Handle toolbar drag start
  const handleToolbarDragStart = (e) => {
    setIsDraggingToolbar(true);
    toolbarDragStartRef.current = {
      x: e.clientX - toolbarPosition.x,
      y: e.clientY - toolbarPosition.y
    };
  };

  // Handle toolbar drag
  const handleToolbarDrag = (e) => {
    if (isDraggingToolbar) {
      setToolbarPosition({
        x: e.clientX - toolbarDragStartRef.current.x,
        y: e.clientY - toolbarDragStartRef.current.y
      });
    }
  };

  // Handle toolbar drag end
  const handleToolbarDragEnd = () => {
    setIsDraggingToolbar(false);
  };

  // Delete a shape from canvas
  const handleDeleteShape = (shapeId) => {
    setHistory([...history, [...canvasShapes]]);
    setCanvasShapes(canvasShapes.filter(shape => shape.id !== shapeId));
  };

  // Start moving a shape
  const handleStartMoveShape = (e, shapeId) => {
    if (previewMode) return;
    
    e.stopPropagation();
    
    // Save current positions
    const shape = canvasShapes.find(s => s.id === shapeId);
    if (!shape) return;
    
    // Save history before moving
    setHistory([...history, [...canvasShapes]]);
    
    // Save initial positions
    mouseInitialPosRef.current = { x: e.clientX, y: e.clientY };
    shapeInitialPosRef.current = { x: shape.x, y: shape.y };
    
    // Set moving shape id
    setMovingShapeId(shapeId);
  };

  // Mouse move event for shape and toolbar dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Handle toolbar dragging
      if (isDraggingToolbar) {
        handleToolbarDrag(e);
      }
      
      // Handle shape moving
      if (movingShapeId && !previewMode) {
        // Calculate how far the mouse has moved
        const deltaX = e.clientX - mouseInitialPosRef.current.x;
        const deltaY = e.clientY - mouseInitialPosRef.current.y;
        
        // Update the shape position
        setCanvasShapes(shapes => 
          shapes.map(shape => 
            shape.id === movingShapeId
              ? { 
                  ...shape, 
                  x: shapeInitialPosRef.current.x + deltaX,
                  y: shapeInitialPosRef.current.y + deltaY
                }
              : shape
          )
        );
      }
    };

    const handleMouseUp = () => {
      if (isDraggingToolbar) {
        handleToolbarDragEnd();
      }
      
      if (movingShapeId) {
        setMovingShapeId(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingToolbar, movingShapeId, previewMode]);
  
  // Initialize with some sample data for preview
  useEffect(() => {
    // Add a few initial colors
    setSelectedColors(['#FF5252', '#4285F4', '#0F9D58']);
    
    // Add a few sample shapes to the canvas
    const sampleShapes = [
      {
        id: generateId(),
        shapeId: 'heart',
        svg: SHAPES.find(s => s.id === 'heart').svg,
        x: 150,
        y: 120,
        fills: {}
      },
      {
        id: generateId(),
        shapeId: 'star',
        svg: SHAPES.find(s => s.id === 'star').svg,
        x: 300,
        y: 180,
        fills: {}
      },
      {
        id: generateId(),
        shapeId: 'flower',
        svg: SHAPES.find(s => s.id === 'flower').svg,
        x: 200,
        y: 250,
        fills: {}
      }
    ];
    
    setCanvasShapes(sampleShapes);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      {/* Left Sidebar - Shape Library */}
      <div className="w-1/4 bg-gradient-to-b from-indigo-50 to-blue-50 p-4 shadow-lg overflow-y-auto rounded-l-lg">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Shape Library</h2>
                
        <div className="grid grid-cols-2 gap-4">
          {SHAPES.map((shape) => (
            <div
              key={shape.id}
              className="bg-white p-3 rounded-xl cursor-grab hover:shadow-lg transition-all transform hover:-translate-y-1 border border-gray-100"
              draggable
              onDragStart={(e) => handleShapeDragStart(shape.id, e)}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 100 100" 
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: shape.svg }}
                  />
                </div>
                <span className="mt-2 text-center font-medium text-indigo-700">{shape.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center - Canvas Area */}
      <div 
        ref={canvasRef}
        className="w-2/4 bg-white m-4 rounded-2xl shadow-xl overflow-hidden relative border border-indigo-100"
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
      >
        {/* Canvas controls */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 flex space-x-3 items-center shadow-md">
          <button 
            className={`bg-white text-indigo-700 px-4 py-2 rounded-lg font-medium shadow-md hover:bg-indigo-50 transition-colors ${history.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleUndo}
            disabled={history.length === 0}
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Undo
            </span>
          </button>
          <button 
            className="bg-white text-red-500 px-4 py-2 rounded-lg font-medium shadow-md hover:bg-red-50 transition-colors"
            onClick={handleClearAll}
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </span>
          </button>
          <div className="ml-auto">
            <label className="flex items-center cursor-pointer bg-white px-4 py-2 rounded-lg shadow-md">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={previewMode}
                  onChange={() => setPreviewMode(!previewMode)}
                />
                <div className="block bg-gray-300 w-14 h-7 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-all duration-300 ${previewMode ? 'transform translate-x-7 bg-green-500' : ''}`}></div>
              </div>
              <span className="ml-3 text-indigo-800 font-medium">
                {previewMode ? 'Coloring Mode' : 'Place Shapes'}
              </span>
            </label>
          </div>
        </div>

        {/* Canvas content */}
        <div className="h-full relative p-4" style={{ minHeight: "500px", background: "linear-gradient(to bottom right, #f0f4ff, #e6f0ff)" }}>
          {/* Canvas empty state */}
          {canvasShapes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">Drag shapes here to start coloring!</p>
              <p className="text-sm mt-2">{previewMode ? 'Switch back to Place Mode to move shapes around' : 'You can reposition shapes by dragging them'}</p>
            </div>
          )}
          
          {canvasShapes.map((shape) => {
            // Apply stored fills to the SVG
            const filledSvg = applyFillsToSvgString(shape.svg, shape.fills);
            
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    width="100"
                    height="100"
                    className={`drop-shadow-md transition-transform ${!previewMode ? 'hover:scale-105' : ''}`}
                    dangerouslySetInnerHTML={{ __html: filledSvg }}
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
          
          {/* Floating Color Toolbar (in preview mode) */}
          {previewMode && selectedColors.length > 0 && (
            <div 
              className="absolute bg-white rounded-xl shadow-xl p-3 cursor-move border border-indigo-100"
              style={{ 
                left: `${toolbarPosition.x}px`, 
                top: `${toolbarPosition.y}px`,
                zIndex: 1000
              }}
              onMouseDown={handleToolbarDragStart}
            >
              <div className="flex flex-col">
                <div className="text-xs font-bold text-indigo-600 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm9 6a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" clipRule="evenodd"></path>
                  </svg>
                  Your Colors
                </div>
                <div className="flex space-x-2 items-center">
                  {selectedColors.map((color) => (
                    <div 
                      key={color}
                      className={`w-10 h-10 rounded-full cursor-pointer shadow-md transition-all transform hover:scale-110 ${activeColor === color ? 'ring-4 ring-indigo-300 scale-110' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleToolbarColorSelect(color)}
                    />
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500 italic">
                  {activeColor ? 
                    <span>Click any shape to color it <span style={{color: activeColor}}>■</span></span> : 
                    "Select a color first"
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Color Picker */}
      <div className="w-1/4 bg-gradient-to-b from-indigo-50 to-blue-50 p-4 shadow-lg overflow-y-auto rounded-r-lg">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Color Magic</h2>
        <p className="text-gray-600 mb-4">Choose up to 5 colors for your palette:</p>
        
        {/* Selected Colors Display */}
        <div className="bg-white rounded-xl p-3 shadow-md mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Your Palette</h3>
          <div className="flex flex-wrap gap-2 min-h-16 items-center">
            {selectedColors.length > 0 ? (
              selectedColors.map((color, index) => (
                <div 
                  key={`${color}-${index}`}
                  className="relative group"
                >
                  <div 
                    className="w-10 h-10 rounded-full shadow-md border border-gray-200" 
                    style={{ backgroundColor: color }}
                  />
                  <button 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs shadow-md"
                    onClick={() => setSelectedColors(selectedColors.filter((_, i) => i !== index))}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic">No colors selected yet</p>
            )}
            {selectedColors.length < 5 && (
              <button
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                onClick={() => setShowColorPicker(true)}
              >
                +
              </button>
            )}
          </div>
        </div>
        
        {/* Color Wheel Picker */}
        {showColorPicker && (
          <div className="bg-white rounded-xl p-4 shadow-lg mb-6 relative">
            <button 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
              onClick={() => setShowColorPicker(false)}
            >
              ×
            </button>
            <h3 className="text-lg font-medium text-indigo-700 mb-3">Color Picker</h3>
            
            {/* Color Wheel */}
            <div className="flex flex-col items-center space-y-4">
              <ColorWheelVisual 
                value={customColor}
                onChange={handleCustomColorChange}
              />
              
              <div className="w-full flex items-center space-x-2">
                <div 
                  className="w-10 h-10 rounded-lg shadow border border-gray-200" 
                  style={{ backgroundColor: customColor }}
                />
                <input 
                  type="text"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              
              {/* Color presets for quick selection */}
              <div className="grid grid-cols-6 gap-2 w-full">
                {['#FF5252', '#4285F4', '#0F9D58', '#FFEB3B', '#9C27B0', '#FF9800', 
                  '#E91E63', '#00BCD4', '#3F51B5', '#8BC34A', '#FFC107', '#607D8B'].map(color => (
                  <div 
                    key={color}
                    className="w-6 h-6 rounded-md cursor-pointer border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => setCustomColor(color)}
                  />
                ))}
              </div>
              
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md w-full flex items-center justify-center"
                onClick={handleAddCustomColor}
                disabled={selectedColors.length >= 5}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add to Palette
              </button>
            </div>
          </div>
        )}
        
        {/* Quick Pick Colors */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Picks</h3>
          <div className="grid grid-cols-4 gap-3">
            {PRESET_COLORS.map((color) => (
              <div
                key={color.value}
                className={`p-1 rounded-lg cursor-pointer transition-all ${
                  selectedColors.includes(color.value) ? 'bg-gray-200 scale-110 shadow-md' : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => handleColorSelect(color.value)}
              >
                <div className="flex flex-col items-center">
                  <div 
                    className="w-10 h-10 rounded-full shadow-sm border border-gray-200" 
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="mt-1 text-center text-xs">{color.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Instructions</h3>
          <ol className="list-decimal ml-5 space-y-2 text-gray-700 text-sm">
            <li><strong>Place Mode:</strong> Drag shapes onto canvas and position them</li>
            <li><strong>Color Selection:</strong> Select up to 5 colors for your palette</li>
            <li><strong>Coloring Mode:</strong> Toggle the switch to start coloring</li>
            <li><strong>Painting:</strong> Select a color from your toolbar, then click on shape parts</li>
            <li><strong>Moving:</strong> Use Place Mode to reposition or delete shapes</li>
            <li><strong>Toolbar:</strong> Drag the color toolbar to any position on the canvas</li>
            <li><strong>Undo:</strong> Made a mistake? Use the undo button to go back</li>
            <li><strong>Save:</strong> Take a screenshot to save your masterpiece!</li>
          </ol>
        </div>
        
        {/* Footer */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">About</h3>
          <p className="text-xs text-gray-600">
            This coloring game is designed for creative play. Create beautiful compositions
            by combining shapes and colors. Perfect for all ages!
          </p>
          <div className="mt-3 text-xs text-indigo-600 font-medium">
            Made with ❤️ for creative minds
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColoringGamePreview;