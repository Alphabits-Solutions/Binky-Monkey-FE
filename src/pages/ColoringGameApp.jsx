// ColoringGameApp.jsx
import React, { useEffect, useContext } from 'react';
import ShapeLibrary from './ShapeLibrary';
import CanvasArea from './CanvasArea';
import ColorPalette from './ColorPalette';
import { PRESET_COLORS } from './constants';
import { AppContext } from '../context/AppContext';

const ColoringGameApp = () => {
  // Get values from context
  const { 
    canvasShapes, 
    setCanvasShapes,
    previewMode,
    setPreviewMode,
    isDraggingToolbar,
    setIsDraggingToolbar,
    toolbarDragStartRef,
    setToolbarPosition,
    movingShapeId,
    setMovingShapeId,
    mouseInitialPosRef,
    shapeInitialPosRef
  } = useContext(AppContext);

  // Handle document mouse move for toolbar dragging and shape moving
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Handle toolbar dragging
      if (isDraggingToolbar) {
        const deltaX = e.clientX - toolbarDragStartRef.current.x;
        const deltaY = e.clientY - toolbarDragStartRef.current.y;
        
        setToolbarPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        toolbarDragStartRef.current = { x: e.clientX, y: e.clientY };
      }
      
      // Handle shape moving
      if (movingShapeId !== null) {
        const deltaX = e.clientX - mouseInitialPosRef.current.x;
        const deltaY = e.clientY - mouseInitialPosRef.current.y;
        
        setCanvasShapes(shapes => shapes.map(shape => {
          if (shape.id === movingShapeId) {
            return {
              ...shape,
              x: shapeInitialPosRef.current.x + deltaX,
              y: shapeInitialPosRef.current.y + deltaY
            };
          }
          return shape;
        }));
      }
    };
    
    const handleMouseUp = () => {
      setIsDraggingToolbar(false);
      setMovingShapeId(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingToolbar, movingShapeId]);
  
  // Reset active color when preview mode changes
  useEffect(() => {
    if (!previewMode) {
      // Reset active color when leaving preview mode
    }
  }, [previewMode]);
  
  // Reset canvas
  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
      setCanvasShapes([]);
      setPreviewMode(false);
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br ">
      {/* Shape Library */}
      <ShapeLibrary />
      
      {/* Canvas Area */}
      <CanvasArea />
      
      {/* Color Palette */}
      <ColorPalette PRESET_COLORS={PRESET_COLORS} />
      
      {/* Reset Button */}
      {/* <button
        className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors"
        onClick={handleReset}
      >
        Reset Canvas
      </button> */}
    </div>
  );
};
  
export default ColoringGameApp;