// src/context/AppContext.js
import React, { createContext, useState, useRef } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Original state from your AppContext
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetPosition, setAssetPosition] = useState({ x: 50, y: 50 });
  const [assetSize, setAssetSize] = useState({ width: 100, height: 100 });

  // Canvas shapes state
  const [canvasShapes, setCanvasShapes] = useState([]);
  
  // Preview mode state
  const [previewMode, setPreviewMode] = useState(false);
  
  // Color palette state
  const [selectedColors, setSelectedColors] = useState([]);
  const [activeColor, setActiveColor] = useState(null);
  const [customColor, setCustomColor] = useState('#FF5252');
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Toolbar position state
  const [toolbarPosition, setToolbarPosition] = useState({ x: 20, y: 20 });
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  
  // Refs
  const canvasRef = useRef(null);
  const draggedShapeRef = useRef(null);
  const toolbarDragStartRef = useRef({ x: 0, y: 0 });
  const mouseInitialPosRef = useRef({ x: 0, y: 0 });
  const shapeInitialPosRef = useRef({ x: 0, y: 0 });
  
  // Shape moving state
  const [movingShapeId, setMovingShapeId] = useState(null);

  return (
    <AppContext.Provider
      value={{
        // Original context values
        selectedPage,
        setSelectedPage,
        selectedAction,
        setSelectedAction,
        selectedAsset,
        setSelectedAsset,
        assetPosition,
        setAssetPosition,
        assetSize,
        setAssetSize,
        selectedActivity,
        setSelectedActivity,
        
        // Canvas shapes
        canvasShapes,
        setCanvasShapes,
        
        // Preview mode
        previewMode,
        setPreviewMode,
        
        // Color palette
        selectedColors,
        setSelectedColors,
        activeColor,
        setActiveColor,
        customColor,
        setCustomColor,
        showColorPicker,
        setShowColorPicker,
        
        // Toolbar
        toolbarPosition,
        setToolbarPosition,
        isDraggingToolbar,
        setIsDraggingToolbar,
        
        // Refs
        canvasRef,
        draggedShapeRef,
        toolbarDragStartRef,
        mouseInitialPosRef,
        shapeInitialPosRef,
        
        // Moving shape
        movingShapeId,
        setMovingShapeId
      }}
    >
      {children}
    </AppContext.Provider>
  );
};