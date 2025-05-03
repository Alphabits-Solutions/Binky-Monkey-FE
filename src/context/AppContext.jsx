// src/context/AppContext.js
import React, { createContext, useState, useRef, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Page and activity state
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageName, setPageName] = useState("");
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('1');
  
  // Action and asset state
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetPosition, setAssetPosition] = useState({ x: 50, y: 50 });
  const [assetSize, setAssetSize] = useState({ width: 100, height: 100 });
  const [shadowPosition, setShadowPosition] = useState(null);

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
  
  // Layers state
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [layerProperties, setLayerProperties] = useState({
    color: [],
    size: ["100px", "100px"],
    positionOrigin: { x: 0, y: 0 },
    positionDestination: { x: 50, y: 50 },
    bearer: 0,
    imgUrl: "",
    audioUrl: "",
    rotationAngle: 0,
  });
  
  // Refs
  const canvasRef = useRef(null);
  const draggedShapeRef = useRef(null);
  const toolbarDragStartRef = useRef({ x: 0, y: 0 });
  const mouseInitialPosRef = useRef({ x: 0, y: 0 });
  const shapeInitialPosRef = useRef({ x: 0, y: 0 });
  
  // Shape moving state
  const [movingShapeId, setMovingShapeId] = useState(null);
  const [lastDroppedShape, setLastDroppedShape] = useState(null);

  return (
    <AppContext.Provider
      value={{
        // Page and activity state
        selectedActivity,
        setSelectedActivity,
        selectedPage,
        setSelectedPage,
        pageName,
        setPageName,
        selectedSlideId, 
        setSelectedSlideId,
        selectedTab,
        setSelectedTab,
        
        // Action and asset state
        selectedAction,
        setSelectedAction,
        selectedAsset,
        setSelectedAsset,
        assetPosition,
        setAssetPosition,
        assetSize,
        setAssetSize,
        shadowPosition,
        setShadowPosition,
        
        // Canvas shapes
        canvasShapes,
        setCanvasShapes,
        lastDroppedShape,
        setLastDroppedShape,
        
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
        
        // Layers
        layers,
        setLayers,
        selectedLayer,
        setSelectedLayer,
        layerProperties,
        setLayerProperties,
        
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