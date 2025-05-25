// src/context/AppContext.jsx
import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { getAllPages, getAllLayers } from "../services/api";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Original states from existing AppContext
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageName, setPageName] = useState("");
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetPosition, setAssetPosition] = useState({ x: 50, y: 50 });
  const [assetSize, setAssetSize] = useState({ width: 100, height: 100 });
  const [selectedTab, setSelectedTab] = useState('1');
  const [shadowPosition, setShadowPosition] = useState(null);
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
  const [slides, setSlides] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(-1);

  // States for color fill game
  const [canvasShapes, setCanvasShapes] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [activeColor, setActiveColor] = useState(null);
  const [customColor, setCustomColor] = useState('#FF5252');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 20, y: 20 });
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  const [fillColor, setFillColor] = useState("#861E00");
  const [strokeColor, setStrokeColor] = useState("#FFFFFF");
  
  // 3D object properties
  const [modelRotation, setModelRotation] = useState({ x: 0, y: 0, z: 0 });
  const [modelScale, setModelScale] = useState(1.0);
  const [modelViewers, setModelViewers] = useState({});
  const [canvas3DObjects, setCanvas3DObjects] = useState([]);
  
  // Refs
  const canvasRef = useRef(null);
  const draggedShapeRef = useRef(null);
  const draggedModelRef = useRef(null);
  const toolbarDragStartRef = useRef({ x: 0, y: 0 });
  const mouseInitialPosRef = useRef({ x: 0, y: 0 });
  const shapeInitialPosRef = useRef({ x: 0, y: 0 });
  
  // Shape moving state
  const [movingShapeId, setMovingShapeId] = useState(null);
  const [moving3DObjectId, setMoving3DObjectId] = useState(null);

  useEffect(() => {
    // Load activities and set the selected one from localStorage or URL params
    const savedActivityId = localStorage.getItem('selectedActivityId');
    if (savedActivityId && !selectedActivity) {
      setSelectedActivity(savedActivityId);
    }
  }, []);

  const loadPages = useCallback(async () => {
    if (!selectedActivity) return;
    localStorage.setItem('selectedActivityId', selectedActivity);
    try {
      const result = await getAllPages(selectedActivity);
      const fetchedSlides = Array.isArray(result) ? result : [];
      setSlides(fetchedSlides);
      if (selectedSlideId) {
        const index = fetchedSlides.findIndex(slide => slide._id === selectedSlideId);
        setCurrentPageIndex(index !== -1 ? index : 0);
      } else if (fetchedSlides.length > 0) {
        setCurrentPageIndex(0);
        setSelectedPage(fetchedSlides[0]._id);
        setSelectedSlideId(fetchedSlides[0]._id);
        setPageName(fetchedSlides[0].title);
      }
    } catch (error) {
      console.error("Failed to load pages:", error);
      setSlides([]);
    }
  }, [selectedActivity, selectedSlideId]);
  

  const loadLayers = useCallback(async (pageId) => {
    if (!pageId) {
      console.log("No pageId, clearing layers");
      setLayers([]);
      setCanvasShapes([]); // Also clear canvas shapes
      setCanvas3DObjects([]); // Clear 3D objects
      setSelectedColors([]); // Clear colors
      return;
    }
    try {
      console.log("Fetching layers for pageId:", pageId);
      const result = await getAllLayers(pageId);
      console.log("API response:", result);
      
      // Initialize new canvas shapes array for this page
      let newCanvasShapes = [];
      let new3DObjects = [];
      let allColors = []; // Collect colors from all shape layers
      
      const apiLayers = (Array.isArray(result) ? result : []).map((layer) => {

        if (layer.action === "colorfill" && layer.properties.color && Array.isArray(layer.properties.color)) {
          // Add colors from this layer to the combined palette
          layer.properties.color.forEach(color => {
            if (!allColors.includes(color) && allColors.length < 5) {
              allColors.push(color);
            }
          });
        }

        // Handle 3D model layers
        if (layer.action === "model3d" && (layer.properties.modelUrl || layer.properties.imgUrl)) {
          const objectId = layer.objectId || `3d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          new3DObjects.push({
            id: objectId,
            modelUrl: layer.properties.modelUrl || layer.properties.imgUrl, // Fallback to imgUrl
            x: layer.properties.positionOrigin.x,
            y: layer.properties.positionOrigin.y,
            rotation: layer.properties.rotation || { x: 0, y: 0, z: 0 },
            scale: layer.properties.scale || 2.0
          });
          
          return {
            ...layer,
            saved: true,
            objectId: objectId,
            properties: {
              ...layer.properties,
              modelUrl: layer.properties.modelUrl || layer.properties.imgUrl, // Ensure modelUrl is set
              rotation: layer.properties.rotation || { x: 0, y: 0, z: 0 },
              scale: layer.properties.scale || 1.0,
              type: "model3d"
            }
          };
        }
        // Handle colorfill layers
        else if (layer.action === "colorfill" && layer.properties.svgContent) {
          // Generate shape ID if not exists
          const shapeId = layer.shapeId || `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Create a new canvas shape for this layer
          newCanvasShapes.push({
            id: shapeId,
            svg: layer.properties.svgContent,
            x: layer.properties.positionOrigin.x,
            y: layer.properties.positionOrigin.y,
            fills: {} // Empty fills when loading - will only be filled in preview mode
          });
          
          // Return the processed layer
          return {
            ...layer,
            saved: true,
            shapeId: shapeId,
            properties: {
              ...layer.properties,
              type: "svg"
            }
          };
        }
        
        // Handle other layer types
        return {
          ...layer,
          saved: true,
          properties: {
            ...layer.properties,
            type: layer.properties.type || (layer.properties.imgUrl && layer.properties.imgUrl.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image"),
          },
        };
      });
      
     // FIXED: Set combined colors from all shape layers
    console.log("Setting combined colors from shape layers:", allColors);
    setSelectedColors(allColors);

      // Set the new canvas shapes and 3D objects
      setCanvasShapes(newCanvasShapes);
      setCanvas3DObjects(new3DObjects);
      setLayers(apiLayers);
      
      console.log("Processed layers:", apiLayers);
      setLayers(apiLayers);
    } catch (error) {
      console.error("Failed to load layers:", error);
      setLayers([]);
      setSelectedColors([]);
    }
  }, [setLayers, setCanvasShapes, setCanvas3DObjects,setSelectedColors]);

  const switchPage = useCallback((direction) => {
    let newIndex;
    if (direction === "next" && currentPageIndex < slides.length - 1) {
      newIndex = currentPageIndex + 1;
    } else if (direction === "prev" && currentPageIndex > 0) {
      newIndex = currentPageIndex - 1;
    } else {
      return;
    }
    setCurrentPageIndex(newIndex);
    const newSlide = slides[newIndex];
    setSelectedPage(newSlide._id);
    setSelectedSlideId(newSlide._id);
    setPageName(newSlide.title);
  }, [currentPageIndex, slides]);

  useEffect(() => {
    if (selectedActivity) {
      loadPages();
    }
  }, [selectedActivity, loadPages]);

  useEffect(() => {
    if (selectedSlideId) {
      loadLayers(selectedSlideId);
    }
  }, [selectedSlideId, loadLayers]);

  return (
    <AppContext.Provider
      value={{
        // Original context values
        selectedTab,
        setSelectedTab,
        selectedPage,
        setSelectedPage,
        pageName,
        setPageName,
        selectedAction,
        setSelectedAction,
        selectedAsset,
        setSelectedAsset,
        assetPosition,
        setAssetPosition,
        shadowPosition,
        setShadowPosition,
        assetSize,
        setAssetSize,
        selectedActivity,
        setSelectedActivity,
        selectedSlideId, 
        setSelectedSlideId,
        layers,
        setLayers,
        selectedLayer,
        setSelectedLayer,
        layerProperties,
        setLayerProperties,
        slides,
        setSlides,
        currentPageIndex,
        setCurrentPageIndex,
        switchPage,
        
        // Color fill game context values
        canvasShapes,
        setCanvasShapes,
        previewMode,
        setPreviewMode,
        selectedColors,
        setSelectedColors,
        activeColor,
        setActiveColor,
        customColor,
        setCustomColor,
        showColorPicker,
        setShowColorPicker,
        toolbarPosition,
        setToolbarPosition,
        isDraggingToolbar,
        setIsDraggingToolbar,
        fillColor,
        setFillColor,
        strokeColor,
        setStrokeColor,
        
        // 3D model context values
        modelRotation,
        setModelRotation,
        modelScale,
        setModelScale,
        modelViewers,
        setModelViewers,
        canvas3DObjects,
        setCanvas3DObjects,
        
        // Refs
        canvasRef,
        draggedShapeRef,
        draggedModelRef,
        toolbarDragStartRef,
        mouseInitialPosRef,
        shapeInitialPosRef,
        
        // Moving state
        movingShapeId,
        setMovingShapeId,
        moving3DObjectId,
        setMoving3DObjectId
      }}
    >
      {children}
    </AppContext.Provider>
  );
};