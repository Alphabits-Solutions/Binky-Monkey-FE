import { useContext, useEffect, useRef, useState } from "react";
import RightSidebar from "../components/RightSidebar";
import Sider from "../components/Sider";
import Pages from "../components/home/pages";
import Layers from "../components/home/layerList";
import Assets from "../components/home/assetFileList";
import ShapeLibrary from "../components/home/ShapeLibrary";
import { AppContext } from "../context/AppContext";
import { Button,message } from "antd";
import { LeftOutlined, MinusOutlined, PlusOutlined, RightOutlined, SaveOutlined, SoundOutlined } from "@ant-design/icons";
import "../assets/sass/homescreen.scss";
import { enhanceSvgVisibility, applyFillsToSvgString, createFallbackSvg, isValidSvg } from "./utils";
// Import the ModelViewer class from threeDUtils
import { ModelViewer } from "../components/threeDUtils";
// Import createLayer API function
import { createLayer,updateLayer } from "../services/api";
import AudioList from "../components/home/audioList";

// Utility function to check if object is a File-like or Blob-like object
const isFileOrBlob = (obj) => {
  return obj && typeof obj === 'object' && 
    ((obj instanceof File) || 
     (obj instanceof Blob) || 
     (obj.type && obj.size !== undefined) || 
     (obj.name && obj.size !== undefined));
};

const GameComponent = () => {
  const {
    selectedPage,
    pageName,
    selectedAsset,
    selectedAction,
    assetPosition,
    setAssetPosition,
    shadowPosition,
    setShadowPosition,
    assetSize,
    selectedTab,
    layers,
    setLayers,
    selectedLayer,
    setSelectedLayer,
    layerProperties,
    setLayerProperties,
    slides,
    currentPageIndex,
    switchPage,
    // Color fill related context
    previewMode,
    setPreviewMode,
    canvasShapes,
    setCanvasShapes,
    canvasRef,
    draggedShapeRef,
    toolbarPosition,
    setToolbarPosition,
    isDraggingToolbar,
    setIsDraggingToolbar,
    toolbarDragStartRef,
    selectedColors,
    activeColor,
    setActiveColor,
    movingShapeId,
    setMovingShapeId,
    mouseInitialPosRef,
    shapeInitialPosRef,
    // 3D model related context
    modelRotation,
    setModelRotation,
    modelScale,
    setModelScale,
    modelViewers,
    setModelViewers,
    canvas3DObjects,
    setCanvas3DObjects,
    draggedModelRef,
    moving3DObjectId,
    setMoving3DObjectId,
    setSelectedAction,
    setAssetSize
  } = useContext(AppContext);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingAsset, setDraggingAsset] = useState(null);
  const [previewPositions, setPreviewPositions] = useState([]);
  const [vibratingLayer, setVibratingLayer] = useState(null);
  const [canvasZoom, setCanvasZoom] = useState(100); // Initial zoom at 100%

  const [isResizing, setIsResizing] = useState(false);
const [resizingObjectId, setResizingObjectId] = useState(null);
const [resizeHandle, setResizeHandle] = useState(null);
const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });

// Add a state to track currently playing audio
const [currentAudio, setCurrentAudio] = useState(null);
const [isHoveringAudioLayer, setIsHoveringAudioLayer] = useState(false);
const [playingAudioLayerId, setPlayingAudioLayerId] = useState(null);
const audioRef = useRef(null);

const [resizingLayerId, setResizingLayerId] = useState(null);
const [resizingHandle, setResizingHandle] = useState(null);
const [initialLayerSize, setInitialLayerSize] = useState({ width: 0, height: 0 });

const handleStartResize = (e, objectId, handle) => {
  e.preventDefault();
  e.stopPropagation();
  
  // Find the object
  const object = canvas3DObjects.find(obj => obj.id === objectId);
  if (!object) return;
  
  // Find the layer
  const layer = layers.find(l => l.objectId === objectId);
  if (!layer) return;
  
  // Set resize state
  setIsResizing(true);
  setResizingObjectId(objectId);
  setResizeHandle(handle);
  
  // Store initial values
  setInitialSize({
    width: parseInt(layer.properties.size[0]),
    height: parseInt(layer.properties.size[1])
  });
  setInitialMousePos({
    x: e.clientX,
    y: e.clientY
  });
  
  // Set this object as selected
  handleSelect3DObject(objectId);

  // Mark the layer as unsaved
  setLayers(prevLayers => 
    prevLayers.map(l => 
      l.objectId === objectId 
        ? { ...l, saved: false }
        : l
    )
  );
};


// Add this effect to handle resize operations
useEffect(() => {
  if (!isResizing || !resizingObjectId || !resizeHandle) return;
  
  const handleMouseMove = (e) => {
    // Calculate change in position
    const deltaX = e.clientX - initialMousePos.x;
    const deltaY = e.clientY - initialMousePos.y;
    
    // Calculate new size based on which handle is being dragged
    let newWidth = initialSize.width;
    let newHeight = initialSize.height;
    let newX = null;
    let newY = null;
    
    switch (resizeHandle) {
      case 'top-left':
        newWidth = Math.max(50, initialSize.width - deltaX);
        newHeight = Math.max(50, initialSize.height - deltaY);
        newX = initialMousePos.x + initialSize.width - newWidth;
        newY = initialMousePos.y + initialSize.height - newHeight;
        break;
      case 'top-right':
        newWidth = Math.max(50, initialSize.width + deltaX);
        newHeight = Math.max(50, initialSize.height - deltaY);
        newY = initialMousePos.y + initialSize.height - newHeight;
        break;
      case 'bottom-left':
        newWidth = Math.max(50, initialSize.width - deltaX);
        newHeight = Math.max(50, initialSize.height + deltaY);
        newX = initialMousePos.x + initialSize.width - newWidth;
        break;
      case 'bottom-right':
        newWidth = Math.max(50, initialSize.width + deltaX);
        newHeight = Math.max(50, initialSize.height + deltaY);
        break;
      default:
        break;
    }
    
    // Update size in assetSize state
    setAssetSize({
      width: newWidth,
      height: newHeight
    });
    
    // Update layerProperties
    setLayerProperties(prev => ({
      ...prev,
      size: [`${newWidth}px`, `${newHeight}px`]
    }));
    
    // Update the layer and model position if needed
    if (newX !== null || newY !== null) {
      const object = canvas3DObjects.find(obj => obj.id === resizingObjectId);
      if (object) {
        const updatedX = newX !== null ? newX : object.x;
        const updatedY = newY !== null ? newY : object.y;
        
        // Update object position
        setCanvas3DObjects(objects => 
          objects.map(obj => 
            obj.id === resizingObjectId
              ? { ...obj, x: updatedX, y: updatedY }
              : obj
          )
        );
        
        // Update position in layers
        setLayers(prevLayers => 
          prevLayers.map(layer => 
            layer.objectId === resizingObjectId
              ? { 
                ...layer, 
                properties: {
                  ...layer.properties,
                  positionOrigin: { x: updatedX, y: updatedY },
                  size: [`${newWidth}px`, `${newHeight}px`]
                }
              }
              : layer
          )
        );
        
        // Update assetPosition
        setAssetPosition({ x: updatedX, y: updatedY });
      }
    } else {
      // Just update the size in layers
      setLayers(prevLayers => 
        prevLayers.map(layer => 
          layer.objectId === resizingObjectId
            ? { 
                ...layer, 
                saved: false,
                properties: {
                  ...layer.properties,
                  size: [`${newWidth}px`, `${newHeight}px`]
                }
              }
            : layer
        )
      );
    }
  };
  
  const handleMouseUp = () => {
    setIsResizing(false);
    setResizingObjectId(null);
    setResizeHandle(null);
  };
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
}, [
  isResizing, 
  resizingObjectId, 
  resizeHandle, 
  initialSize, 
  initialMousePos, 
  setAssetSize, 
  setLayerProperties, 
  canvas3DObjects, 
  setCanvas3DObjects,
  setLayers,
  setAssetPosition
]);
// Add this effect to track property changes and mark layers as unsaved
useEffect(() => {
  if (selectedLayer && (selectedAction === "model3d" || selectedAction === "drag" || selectedAction === "resize" || selectedAction === "rotation")) {
    // Mark the selected layer as unsaved when properties change
    setLayers(prevLayers => 
      prevLayers.map(layer => 
        layer._id === selectedLayer._id 
          ? { ...layer, saved: false }
          : layer
      )
    );
  }
}, [assetPosition, assetSize, shadowPosition, modelRotation, modelScale, layerProperties]);

  // Add this function to your Game.jsx component
  const handleSaveAllLayers = async () => {
    try {
      // Filter out the unsaved layers
      const unsavedLayers = layers.filter(layer => !layer.saved);
      
      if (unsavedLayers.length === 0) {
        // If there are no unsaved layers, show message and return
        message.info("No changes to save.");
        return;
      }
      
      // Show loading indicator
      // message.loading({ content: "Saving changes...", key: "saveLayer" });
      
      // Create promises for all save operations
      const savePromises = unsavedLayers.map(async (layer) => {
        try {
          let payload;
          
          if (layer.action === "colorfill") {
            // Colorfill payload remains the same
            payload = {
              name: layer.name,
              action: layer.action,
              properties: {
                color: layer.properties.color,
                size: layer.properties.size,
                positionOrigin: layer.properties.positionOrigin,
                positionDestination: layer.properties.positionOrigin,
                svgContent: layer.properties.svgContent,
                type: "svg"
              },
              pageId: layer.pageId,
              shapeId: layer.shapeId
            };
          } else if (layer.action === "model3d") {
            // For 3D models, find the latest data from canvas3DObjects
            const updatedObject = canvas3DObjects.find(obj => obj.id === layer.objectId);
            
            // Log to debug
            console.log("Object from canvas3DObjects:", updatedObject);
            
            // Enhanced payload for 3D models with the LATEST values
            payload = {
              name: layer.name,
              action: layer.action,
              properties: {
                modelUrl: layer.properties.modelUrl,
                size: layer.properties.size,
                positionOrigin: updatedObject ? 
                  { x: updatedObject.x, y: updatedObject.y } : 
                  layer.properties.positionOrigin,
                positionDestination: layer.properties.positionDestination || 
                  (updatedObject ? { x: updatedObject.x, y: updatedObject.y } : layer.properties.positionOrigin),
                type: "model3d",
                // Use the latest values from canvas3DObjects if available
                rotation: updatedObject ? updatedObject.rotation : layer.properties.rotation || { x: 0, y: 0, z: 0 },
                scale: updatedObject ? updatedObject.scale : layer.properties.scale || 1.0
              },
              pageId: layer.pageId,
              objectId: layer.objectId
            };
            
            // Log the payload to verify scale and rotation values
            console.log("3D model save payload:", payload.properties.rotation, payload.properties.scale);
          } else {
            // Standard payload for other layer types
            payload = {
              name: layer.name,
              action: layer.action,
              properties: {
                color: layer.properties.color,
                size: layer.properties.size,
                positionOrigin: layer.properties.positionOrigin,
                positionDestination: layer.properties.positionDestination,
                bearer: layer.properties.bearer,
                imgUrl: layer.properties.imgUrl,
                audioUrl: layer.properties.audioUrl,
                type: layer.properties.type,
                rotationAngle: layer.properties.rotationAngle
              },
              pageId: layer.pageId,
            };
          }
          
          // For new layers (without ID)
          if (!layer._id) {
            const savedLayer = await createLayer(payload);
            return { ...savedLayer, saved: true, shapeId: layer.shapeId, objectId: layer.objectId };
          } else {
            // Update existing layer
            const updatedLayer = await updateLayer(layer._id, payload);
            return { ...updatedLayer, saved: true, shapeId: layer.shapeId, objectId: layer.objectId };
          }
        } catch (error) {
          console.error(`Error saving layer ${layer.name}:`, error);
          // Return the original layer (marked as unsaved) if saving fails
          return layer;
        }
      });
      
      // Wait for all save operations to complete
      const savedResults = await Promise.all(savePromises);
      
      // Update layers state with saved results
      setLayers(prevLayers => 
        prevLayers.map(layer => {
          const savedLayer = savedResults.find(result => 
            (result._id && result._id === layer._id) || 
            (layer.shapeId && result.shapeId === layer.shapeId) ||
            (layer.objectId && result.objectId === layer.objectId)
          );
          
          return savedLayer || layer;
        })
      );
      
      // Show success message
      message.success({ content: "All changes saved successfully!", key: "saveLayer", duration: 2 });
      
    } catch (error) {
      console.error("Error saving layers:", error);
      // message.error({ content: "Failed to save changes. Please try again.", key: "saveLayer" });
    }
  };

// Function to start resizing a layer
const handleStartLayerResize = (e, layerId) => {
  e.stopPropagation();
  e.preventDefault();
  
  if (previewMode) return;
  
  // Find the layer
  const layer = layers.find(l => l._id === layerId);
  if (!layer) return;
  
  // Set resizing state
  setResizingLayerId(layerId);
  setResizingHandle('bottom-right');
  
  // Store initial values
  setInitialLayerSize({
    width: parseInt(layer.properties.size[0]),
    height: parseInt(layer.properties.size[1])
  });
  
  // Store mouse position
  mouseInitialPosRef.current = { 
    x: e.clientX, 
    y: e.clientY 
  };
  
  // Also store the initial position of the layer
  shapeInitialPosRef.current = { 
    x: layer.properties.positionOrigin.x, 
    y: layer.properties.positionOrigin.y 
  };
  
  // Mark the layer as unsaved
  setLayers(prevLayers => 
    prevLayers.map(l => 
      l._id === layerId 
        ? { ...l, saved: false }
        : l
    )
  );
};

// Add an effect to handle layer resizing
useEffect(() => {
  if (!resizingLayerId || !resizingHandle) return;
  
  const handleMouseMove = (e) => {
    // Calculate change in position
    const deltaX = e.clientX - mouseInitialPosRef.current.x;
    const deltaY = e.clientY - mouseInitialPosRef.current.y;
    
    // Find the layer
    const layer = layers.find(l => l._id === resizingLayerId);
    if (!layer) return;
    
    // Calculate new size
    const newWidth = Math.max(50, initialLayerSize.width + deltaX);
    const newHeight = Math.max(50, initialLayerSize.height + deltaY);
    
    // Update size in assetSize state if this is the selected layer
    if (selectedLayer && selectedLayer._id === resizingLayerId) {
      setAssetSize({
        width: newWidth,
        height: newHeight
      });
    }
    
    // Update layer properties
    setLayers(prevLayers => 
      prevLayers.map(l => 
        l._id === resizingLayerId 
          ? { 
              ...l, 
              saved: false,
              properties: {
                ...l.properties,
                size: [`${newWidth}px`, `${newHeight}px`]
              }
            }
          : l
      )
    );
    
    // Request redraw
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      drawLayers(ctx);
    }
  };
  
  const handleMouseUp = () => {
    setResizingLayerId(null);
    setResizingHandle(null);
  };
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
}, [resizingLayerId, resizingHandle, initialLayerSize, layers, selectedLayer]);

  // Add mousemove handler to detect hovering over audio layers
const handleCanvasMouseMove = (e) => {
  if (previewMode) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Apply zoom adjustment for mouse coordinates
    const zoomFactor = canvasZoom / 100;
    const x = (e.clientX - rect.left) / zoomFactor;
    const y = (e.clientY - rect.top) / zoomFactor;
    
    // Check if hovering over any audio-enabled layer
    let hovering = false;
    layers.forEach((layer, index) => {
      if (layer.action === "audio" && layer.pageId === selectedPage && layer.properties.audioUrl) {
        const position = getPreviewPosition(layer, index);
        
        if (
          x >= position.x &&
          x <= position.x + parseInt(layer.properties.size[0]) &&
          y >= position.y &&
          y <= position.y + parseInt(layer.properties.size[1])
        ) {
          hovering = true;
        }
      }
    });
    
    setIsHoveringAudioLayer(hovering);
  }
  
  // Call the existing mouse move handler
  if (handleMouseMove) {
    handleMouseMove(e);
  }
};

  // Add cleanup for audio on component unmount
useEffect(() => {
  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
}, []);

  // Handle click on images in preview mode
const handlePreviewClick = (e, layer) => {
  if (!previewMode) return;
  
  // If layer has audio action and audioUrl
  if (layer.action === "audio" && layer.properties.audioUrl) {
    console.log("Audio layer clicked", layer);
    
    // If this audio is already playing, pause it
    if (playingAudioLayerId === layer._id && audioRef.current) {
      if (!audioRef.current.paused) {
        // If currently playing, pause it
        audioRef.current.pause();
        setPlayingAudioLayerId(null);
        console.log("Pausing audio");
      } else {
        // If paused, play it again
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          message.error("Failed to play audio");
        });
        setPlayingAudioLayerId(layer._id);
        console.log("Resuming audio");
      }
    } else {
      // Stop previous audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Create new audio element
      const audio = new Audio(layer.properties.audioUrl);
      audioRef.current = audio;
      
      // Add ended event to reset state when audio finishes
      audio.addEventListener('ended', () => {
        setPlayingAudioLayerId(null);
      });
      
      // Play the audio
      audio.play()
        .then(() => {
          setPlayingAudioLayerId(layer._id);
          console.log("Started playing new audio", layer.properties.audioUrl);
        })
        .catch(err => {
          console.error("Error playing audio:", err);
          message.error("Failed to play audio");
        });
    }
  }
};
// Add this effect to handle resize of model viewers
useEffect(() => {
  // Update model viewers when container sizes change
  canvas3DObjects.forEach(object => {
    const viewer = modelViewers[object.id];
    const container = modelContainersRef.current[object.id];
    
    if (viewer && container) {
      // Call a resize method on the viewer to adjust renderer
      if (typeof viewer.handleResize === 'function') {
        viewer.handleResize();
      }
    }
  });
}, [assetSize, canvas3DObjects, modelViewers]);
  
  // Reference for 3D model containers
  const modelContainersRef = useRef({});
  
  // Cache for images to prevent flickering
  const imageCache = useRef({});

  const handleSelect3DObject = (objectId) => {
    // Find the corresponding layer
    const layer = layers.find(layer => layer.objectId === objectId);
    if (!layer) return;
    
    // Get the corresponding 3D object
    const object = canvas3DObjects.find(obj => obj.id === objectId);
    if (!object) return;
    
    // Set selected layer
    setSelectedLayer(layer);
    
    // Set action to model3d
    setSelectedAction("model3d");
    
    // Set position
    setAssetPosition(layer.properties.positionOrigin);
    
    // Set size
    setAssetSize({
      width: parseInt(layer.properties.size[0]),
      height: parseInt(layer.properties.size[1]),
    });
    
    // Set rotation and scale
    setModelRotation(object.rotation || { x: 0, y: 0, z: 0 });
    setModelScale(object.scale || 1.0);
    
    // Set layer properties
    setLayerProperties({
      ...layer.properties,
      rotation: object.rotation || { x: 0, y: 0, z: 0 },
      scale: object.scale || 1.0,
    });
  };

  // Add these functions to handle zooming
const handleZoomIn = () => {
  // Increase zoom by 10%, capped at 200%
  setCanvasZoom(prevZoom => Math.min(prevZoom + 10, 200));
};

const handleZoomOut = () => {
  // Decrease zoom by 10%, with a minimum of 100%
  setCanvasZoom(prevZoom => Math.max(prevZoom - 10, 100));
};

const handleZoomReset = () => {
  // Reset to 100%
  setCanvasZoom(100);
};
  // Initialize model viewers when 3D objects change
  useEffect(() => {
    // Cleanup existing model viewers that are no longer needed
    Object.entries(modelViewers).forEach(([id, viewer]) => {
      const objectExists = canvas3DObjects.some(obj => obj.id === id);
      if (!objectExists) {
        viewer.dispose();
        setModelViewers(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      }
    });
    
    // Create model viewers for new 3D objects
    canvas3DObjects.forEach(object => {
      // Skip if viewer already exists
      if (modelViewers[object.id]) return;
      
      // Skip if container doesn't exist yet
      const container = modelContainersRef.current[object.id];
      if (!container) return;
      
      // Create new viewer
      const viewer = new ModelViewer(container);
      
      // Load the model
      viewer.loadModel(object.modelUrl)
        .then(() => {
          // Set position, rotation, and scale
          if (object.scale) {
            viewer.setModelScale(object.scale);
          }
          if (object.rotation) {
            viewer.setModelRotation(
              object.rotation.x,
              object.rotation.y, 
              object.rotation.z
            );
          }
        })
        .catch(error => {
          console.error(`Error loading model ${object.id}:`, error);
        });
      
      // Save the viewer
      setModelViewers(prev => ({
        ...prev,
        [object.id]: viewer
      }));
    });
  }, [canvas3DObjects, modelViewers, setModelViewers]);

  // Update model viewers when object properties change
  useEffect(() => {
    if (selectedAction === "model3d" && selectedLayer) {
      const object = canvas3DObjects.find(obj => obj.id === selectedLayer.objectId);
      const viewer = object ? modelViewers[object.id] : null;
      
      if (viewer) {
        // Update model properties
        viewer.setModelRotation(
          modelRotation.x,
          modelRotation.y,
          modelRotation.z
        );
        viewer.setModelScale(modelScale);
      }
    }
  }, [
    selectedAction,
    selectedLayer,
    modelRotation,
    modelScale,
    canvas3DObjects,
    modelViewers
  ]);

  // Track canvas mouse move for toolbar drag
  useEffect(() => {
    if (isDraggingToolbar) {
      const handleMouseMove = (e) => {
        const deltaX = e.clientX - toolbarDragStartRef.current.x;
        const deltaY = e.clientY - toolbarDragStartRef.current.y;
        
        setToolbarPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        toolbarDragStartRef.current = { x: e.clientX, y: e.clientY };
      };
      
      const handleMouseUp = () => {
        setIsDraggingToolbar(false);
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingToolbar, toolbarDragStartRef, setToolbarPosition, setIsDraggingToolbar]);

  // Track moving shapes
  useEffect(() => {
    if (movingShapeId) {
      const handleMouseMove = (e) => {
        const deltaX = e.clientX - mouseInitialPosRef.current.x;
        const deltaY = e.clientY - mouseInitialPosRef.current.y;
        
        const newX = shapeInitialPosRef.current.x + deltaX;
        const newY = shapeInitialPosRef.current.y + deltaY;
        
        setCanvasShapes(shapes => 
          shapes.map(shape => 
            shape.id === movingShapeId 
              ? { ...shape, x: newX, y: newY }
              : shape
          )
        );
        
        // Also update the corresponding layer position
        setLayers(prevLayers => 
          prevLayers.map(layer => 
            layer.shapeId === movingShapeId 
              ? { 
                  ...layer, 
                  properties: {
                    ...layer.properties,
                    positionOrigin: { x: newX, y: newY }
                  }
                }
              : layer
          )
        );
      };
      
      const handleMouseUp = () => {
        setMovingShapeId(null);
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [movingShapeId, mouseInitialPosRef, shapeInitialPosRef, setCanvasShapes, setLayers, setMovingShapeId]);

  // Track moving 3D objects
  useEffect(() => {
    if (moving3DObjectId) {
      const handleMouseMove = (e) => {
        const deltaX = e.clientX - mouseInitialPosRef.current.x;
        const deltaY = e.clientY - mouseInitialPosRef.current.y;
        
        const newX = shapeInitialPosRef.current.x + deltaX;
        const newY = shapeInitialPosRef.current.y + deltaY;
        
        setCanvas3DObjects(objects => 
          objects.map(obj => 
            obj.id === moving3DObjectId 
              ? { ...obj, x: newX, y: newY }
              : obj
          )
        );
        
        // Also update the corresponding layer position
        setLayers(prevLayers => 
          prevLayers.map(layer => 
            layer.objectId === moving3DObjectId 
              ? { 
                  ...layer, 
                  properties: {
                    ...layer.properties,
                    positionOrigin: { x: newX, y: newY }
                  }
                }
              : layer
          )
        );
      };
      
      const handleMouseUp = () => {
        setMoving3DObjectId(null);
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [moving3DObjectId, mouseInitialPosRef, shapeInitialPosRef, setCanvas3DObjects, setLayers, setMoving3DObjectId]);

  // Preload images to prevent flickering
  const preloadImages = () => {
    layers.forEach(layer => {
      if (layer.properties.imgUrl && !imageCache.current[layer.properties.imgUrl]) {
        const img = new Image();
        img.src = layer.properties.imgUrl;
        img.onload = () => {
          imageCache.current[layer.properties.imgUrl] = img;
        };
      }
    });
    
    if (selectedAsset && selectedAsset.src && !imageCache.current[selectedAsset.src]) {
      const img = new Image();
      img.src = selectedAsset.src;
      img.onload = () => {
        imageCache.current[selectedAsset.src] = img;
      };
    }
  };

  // Toggle preview mode - Clear fills when exiting preview mode
const togglePreviewMode = () => {
  const newPreviewMode = !previewMode;
  setPreviewMode(newPreviewMode);
  
  if (newPreviewMode) {
    // Initialize preview positions when entering preview mode
    const initialPositions = layers.map((layer, index) => ({
      index: index,
      position: { ...layer.properties.positionOrigin },
    }));
    setPreviewPositions(initialPositions);
  } else {
    // ADDED: Clear all fill colors when exiting preview mode
    setCanvasShapes(prevShapes => 
      prevShapes.map(shape => ({
        ...shape, 
        fills: {} // Reset fills to empty
      }))
    );
    
    // Stop any playing audio when exiting preview mode
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingAudioLayerId(null);
    }
  }
};

  // Handle navigation to previous page
  const handlePreviousPage = () => {
    switchPage("prev");
  };

  // Handle navigation to next page
  const handleNextPage = () => {
    switchPage("next");
  };

  // Apply vibration effect
  const applyVibration = (layerIndex) => {
    setVibratingLayer(layerIndex);
    
    let vibrationCount = 0;
    const originalPositions = [...previewPositions];
    
    const vibrate = () => {
      if (vibrationCount >= 10) {
        setVibratingLayer(null);
        setPreviewPositions(originalPositions);
        return;
      }
      
      const offsetX = Math.random() * 10 - 5;
      const offsetY = Math.random() * 10 - 5;
      
      setPreviewPositions(prev => {
        const newPositions = [...prev];
        if (newPositions[layerIndex]) {
          newPositions[layerIndex] = {
            ...newPositions[layerIndex],
            position: {
              x: originalPositions[layerIndex].position.x + offsetX,
              y: originalPositions[layerIndex].position.y + offsetY
            }
          };
        }
        return newPositions;
      });
      
      vibrationCount++;
      setTimeout(vibrate, 50);
    };
    
    vibrate();
  };

  // Check if position is near destination
  const isNearDestination = (position, destination) => {
    const tolerance = 30; // Pixels of tolerance
    return (
      Math.abs(position.x - destination.x) <= tolerance &&
      Math.abs(position.y - destination.y) <= tolerance
    );
  };

  // Get current position for a layer in preview mode
  const getPreviewPosition = (layer, index) => {
    if (previewMode && previewPositions[index]) {
      return previewPositions[index].position;
    }
    return layer.properties.positionOrigin;
  };

  // Handle canvas drop for shapes, images, and 3D models
  const handleCanvasDrop = async (e) => {
    e.preventDefault();
    
    // Get canvas bounds
    const canvasBounds = canvasRef.current ? canvasRef.current.getBoundingClientRect() : null;
    if (!canvasBounds) return;
    
    // Calculate drop position relative to canvas
    // const x = e.clientX - canvasBounds.left;
    // const y = e.clientY - canvasBounds.top;

     // Apply zoom adjustment for drop coordinates
  const zoomFactor = canvasZoom / 100;
  const x = (e.clientX - canvasBounds.left) / zoomFactor;
  const y = (e.clientY - canvasBounds.top) / zoomFactor;
    
    // Handle shape drop
    if (draggedShapeRef.current) {
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
        
        // Add shape to canvas if it's color fill action
        if (selectedAction === "colorfill") {
          // Generate a unique ID for the shape
          const shapeId = `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Create the shape object
          const shapeObj = {
            id: shapeId,
            shapeId: shapeSource,
            svg: svgContent,
            x,
            y,
            fills: {} // Will store element id to color mapping
          };
          
          // Add the shape to canvasShapes
          setCanvasShapes(prevShapes => [...prevShapes, shapeObj]);
          
          // Create a corresponding layer for tracking
          const newLayer = {
            name: `Shape ${layers.length + 1}`,
            action: "colorfill",
            properties: {
              color: selectedColors, // Store the color palette
              size: ["100px", "100px"],
              positionOrigin: { x, y },
              imgUrl: "",
              type: "svg",
              svgContent: svgContent, // Store the SVG content
            },
            pageId: selectedPage,
            saved: false,
            shapeId: shapeId // Reference to the shape in canvasShapes
          };
          
          // Add the layer
          setLayers(prevLayers => [...prevLayers, newLayer]);
          
          // Save the layer to the database
          try {
            const payload = {
              name: newLayer.name,
              action: newLayer.action,
              properties: {
                color: selectedColors,
                size: newLayer.properties.size,
                positionOrigin: newLayer.properties.positionOrigin,
                positionDestination: newLayer.properties.positionOrigin, // Set default destination
                // Add SVG content field
                svgContent: svgContent,
                type: "svg"
              },
              pageId: selectedPage,
              shapeId: shapeId // Add shapeId at the root level
            };
            
            const savedLayer = await createLayer(payload);
            // Update the layer in state with the database ID
            setLayers(prevLayers => 
              prevLayers.map(l => 
                l.shapeId === shapeId 
                  ? { ...savedLayer, saved: true, shapeId: shapeId } 
                  : l
              )
            );
          } catch (error) {
            console.error("Error saving layer:", error);
          }
        }
      } catch (error) {
        console.error('Error adding shape to canvas:', error);
      } finally {
        draggedShapeRef.current = null;
      }
    }
    // Handle 3D model drop
    else if (draggedModelRef.current) {
      try {
        // Get the model URL from drag event
        const modelUrl = draggedModelRef.current;
        
        // Generate a unique ID for the 3D object
        const objectId = `3d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
         // Default scale for new models
    const defaultScale = 2.0; // Use a larger default scale for better visibility
    
    // Create the 3D object
    const objectData = {
      id: objectId,
      modelUrl,
      x,
      y,
      rotation: { x: 0, y: 0, z: 0 },
      scale: defaultScale
    };
        
        // Add the 3D object to canvas
        setCanvas3DObjects(prevObjects => [...prevObjects, objectData]);
        
        // Create a corresponding layer for tracking
    const newLayer = {
      name: `3D Model ${layers.length + 1}`,
      action: "model3d",
      properties: {
        modelUrl,
        size: ["250px", "250px"], // Increased default size
        positionOrigin: { x, y },
        positionDestination: { x, y }, // Add default destination
        rotation: { x: 0, y: 0, z: 0 },
        scale: defaultScale, // Set the default scale
        type: "model3d"
      },
      pageId: selectedPage,
      saved: false,
      objectId: objectId // Reference to the 3D object
    };
        
        // Add the layer
        setLayers(prevLayers => [...prevLayers, newLayer]);
        
         // Set the scale in model state for consistency
    setModelScale(defaultScale);
    
        // Save the layer to the database
        try {
          const payload = {
            name: newLayer.name,
            action: newLayer.action,
            properties: {
              modelUrl,
              size: newLayer.properties.size,
              positionOrigin: newLayer.properties.positionOrigin,
              positionDestination: newLayer.properties.positionOrigin,
              rotation: newLayer.properties.rotation,
              scale: defaultScale, // Include scale in the payload
              type: "model3d"
            },
            pageId: selectedPage,
            objectId: objectId
          };
          
          const savedLayer = await createLayer(payload);
          // Update the layer in state with the database ID
          setLayers(prevLayers => 
            prevLayers.map(l => 
              l.objectId === objectId 
                ? { ...savedLayer, saved: true, objectId: objectId } 
                : l
            )
          );
        } catch (error) {
          console.error("Error saving 3D model layer:", error);
        }
      } catch (error) {
        console.error('Error adding 3D model to canvas:', error);
      } finally {
        draggedModelRef.current = null;
      }
    }
  };

  // Handle shape click (for color fill)
  const handleShapeClick = (e, canvasShapeId) => {
    if (!previewMode || !activeColor) return;
    
    // Find the target element that was clicked (the fillable part)
    const targetElement = e.target;
    if (!targetElement.getAttribute('fill')) return;
    
    const elementId = targetElement.id || targetElement.tagName;
    
    // Update ONLY the canvasShapes fill colors - NOT the layer
    setCanvasShapes(canvasShapes.map(shape => {
      if (shape.id === canvasShapeId) {
        // Create a new fills object with the updated color
        const newFills = {
          ...shape.fills,
          [elementId]: activeColor
        };
        return { ...shape, fills: newFills };
      }
      return shape;
    }));
  };

  // Delete a shape from canvas
  const handleDeleteShape = (shapeId) => {
    setCanvasShapes(canvasShapes.filter(shape => shape.id !== shapeId));
    
    // Also remove the corresponding layer
    setLayers(layers.filter(layer => layer.shapeId !== shapeId));
  };

  // Delete a 3D object from canvas
  const handleDelete3DObject = (objectId) => {
    // Remove from canvas3DObjects
    setCanvas3DObjects(canvas3DObjects.filter(obj => obj.id !== objectId));
    
    // Dispose of the model viewer
    if (modelViewers[objectId]) {
      modelViewers[objectId].dispose();
      setModelViewers(prev => {
        const updated = { ...prev };
        delete updated[objectId];
        return updated;
      });
    }
    
    // Remove the corresponding layer
    setLayers(layers.filter(layer => layer.objectId !== objectId));
  };

  // Start moving a 3D object
  const handleStart3DObjectMove = (e, objectId) => {
    if (previewMode) return;
    
    e.stopPropagation();
    
    // Save current positions
    const object = canvas3DObjects.find(obj => obj.id === objectId);
    if (!object) return;
    
    // Save initial positions
    mouseInitialPosRef.current = { x: e.clientX, y: e.clientY };
    shapeInitialPosRef.current = { x: object.x, y: object.y };
    
    // Set moving object id
    setMoving3DObjectId(objectId);

    // Mark the corresponding layer as unsaved
  setLayers(prevLayers => 
    prevLayers.map(layer => 
      layer.objectId === objectId 
        ? { ...layer, saved: false }
        : layer
    )
  );  
  };

  // Draw all layers on canvas
  const drawLayers = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw all layers
    layers.forEach((layer, index) => {
      // Skip layers that aren't for this page
      if (layer.pageId !== selectedPage) return;
      
      // Skip 3D layers as they are rendered separately
      if (layer.properties.type === "model3d") return;
      
      if (layer.properties.imgUrl) {
        // Determine current position based on mode
        const currentPosition = getPreviewPosition(layer, index);
        
        const layerType = layer.properties.type || 
                         (layer.properties.imgUrl.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image");
        
        if (layerType === "video") {
          // Video handling
          const video = document.createElement("video");
          video.src = layer.properties.imgUrl;
          video.onloadeddata = () => {
            ctx.drawImage(
              video,
              currentPosition.x,
              currentPosition.y,
              parseInt(layer.properties.size[0]),
              parseInt(layer.properties.size[1])
            );
            
            // Show destination in both edit mode and preview mode
            if (layer.action === "drag" && layer.properties.positionDestination) {
              ctx.globalAlpha = 0.5;
              ctx.drawImage(
                video,
                layer.properties.positionDestination.x,
                layer.properties.positionDestination.y,
                parseInt(layer.properties.size[0]),
                parseInt(layer.properties.size[1])
              );
              ctx.globalAlpha = 1.0;
            }
          };
        } else {
          // Image handling with cached images to prevent flickering
          let img;
          if (imageCache.current[layer.properties.imgUrl]) {
            img = imageCache.current[layer.properties.imgUrl];
            drawImage();
          } else {
            img = new Image();
            img.src = layer.properties.imgUrl;
            img.onload = () => {
              imageCache.current[layer.properties.imgUrl] = img;
              drawImage();
            };
          }
          
          function drawImage() {
            ctx.save();
            
            // Handle rotation if needed
            if (layer.action === "rotation" && layer.properties.rotationAngle) {
              ctx.translate(
                currentPosition.x + parseInt(layer.properties.size[0]) / 2,
                currentPosition.y + parseInt(layer.properties.size[1]) / 2
              );
              ctx.rotate((layer.properties.rotationAngle * Math.PI) / 180);
              ctx.translate(
                -(currentPosition.x + parseInt(layer.properties.size[0]) / 2),
                -(currentPosition.y + parseInt(layer.properties.size[1]) / 2)
              );
            }
            
            // Draw the image at current position
            ctx.drawImage(
              img,
              currentPosition.x,
              currentPosition.y,
              parseInt(layer.properties.size[0]),
              parseInt(layer.properties.size[1])
            );
            
            // Show destination in both edit mode and preview mode with same appearance
            if (layer.action === "drag" && layer.properties.positionDestination) {
              ctx.globalAlpha = 0.5;
              ctx.drawImage(
                img,
                layer.properties.positionDestination.x,
                layer.properties.positionDestination.y,
                parseInt(layer.properties.size[0]),
                parseInt(layer.properties.size[1])
              );
              ctx.globalAlpha = 1.0;
            }

            if (!previewMode) {
              const handleSize = 8;
              const handleX = currentPosition.x + parseInt(layer.properties.size[0]);
              const handleY = currentPosition.y + parseInt(layer.properties.size[1]);
              
              // Draw the handle
              ctx.fillStyle = '#1890ff';
              ctx.fillRect(handleX - handleSize/2, handleY - handleSize/2, handleSize, handleSize);
              
              // Add a white border
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 1;
              ctx.strokeRect(handleX - handleSize/2, handleY - handleSize/2, handleSize, handleSize);
            }
            
            ctx.restore();
          }
        }

        // Add a special style for images with audio in preview mode
        if (previewMode && layer.action === "audio" && layer.properties.audioUrl) {
          ctx.save();
          
          // Determine position for indicator
          const indicatorX = currentPosition.x + parseInt(layer.properties.size[0]) - 15;
          const indicatorY = currentPosition.y + 15;
          
          // Draw a subtle audio indicator background
          ctx.beginPath();
          ctx.arc(indicatorX, indicatorY, 10, 0, 2 * Math.PI);
          
          // Different colors for playing vs. not playing
          const isPlaying = playingAudioLayerId === layer._id;
          ctx.fillStyle = isPlaying 
            ? "rgba(255, 0, 0, 0.7)"   // Red when playing
            : "rgba(0, 123, 255, 0.7)"; // Blue when not playing
          ctx.fill();
          
          // Draw audio icon
          ctx.fillStyle = "white";
          ctx.font = "bold 10px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          // Different icon for playing vs. not playing
          const icon = isPlaying ? "❚❚" : "♫";
          ctx.fillText(icon, indicatorX, indicatorY);
          
          // Add a subtle hover effect for better UX
          ctx.globalAlpha = 0.3;
          ctx.strokeStyle = "white";
          ctx.lineWidth = 1;
          ctx.stroke();
          
          ctx.restore();
        }
      }
    });

    // Only in edit mode, draw selected asset if not part of a layer yet
    if (!previewMode && selectedAsset && !selectedLayer) {
      let img;
      if (imageCache.current[selectedAsset.src]) {
        img = imageCache.current[selectedAsset.src];
        ctx.drawImage(
          img,
          assetPosition.x,
          assetPosition.y,
          assetSize.width,
          assetSize.height
        );
      } else {
        img = new Image();
        img.src = selectedAsset.src;
        img.onload = () => {
          imageCache.current[selectedAsset.src] = img;
          ctx.drawImage(
            img,
            assetPosition.x,
            assetPosition.y,
            assetSize.width,
            assetSize.height
          );
        };
      }
    }

    // Shadow position in edit mode only
    if (!previewMode && selectedAction === "drag" && shadowPosition && selectedAsset) {
      let img;
      if (imageCache.current[selectedAsset.src]) {
        img = imageCache.current[selectedAsset.src];
        ctx.globalAlpha = 0.5;
        ctx.drawImage(
          img,
          shadowPosition.x,
          shadowPosition.y,
          assetSize.width,
          assetSize.height
        );
        ctx.globalAlpha = 1.0;
      } else {
        img = new Image();
        img.src = selectedAsset.src;
        img.onload = () => {
          imageCache.current[selectedAsset.src] = img;
          ctx.globalAlpha = 0.5;
          ctx.drawImage(
            img,
            shadowPosition.x,
            shadowPosition.y,
            assetSize.width,
            assetSize.height
          );
          ctx.globalAlpha = 1.0;
        };
      }
    }
  };

  // Initialize shadow position in edit mode
  useEffect(() => {
    if (
      selectedAction === "drag" &&
      selectedAsset &&
      !shadowPosition &&
      !previewMode
    ) {
      setShadowPosition({ x: assetPosition.x + 50, y: assetPosition.y + 50 });
    } else if (selectedAction !== "drag") {
      setShadowPosition(null);
    }
  }, [selectedAction, selectedAsset, shadowPosition, setShadowPosition, assetPosition, previewMode]);

  // Preload images when layers or selected asset changes
  useEffect(() => {
    preloadImages();
  }, [layers, selectedAsset]);

  // Redraw canvas when dependencies change
  useEffect(() => {
    if (selectedPage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      drawLayers(ctx);
    }
  }, [
    selectedPage,
    selectedAsset,
    layers,
    assetPosition,
    shadowPosition,
    assetSize,
    selectedAction,
    layerProperties,
    previewMode,
    previewPositions,
    vibratingLayer
  ]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const zoomFactor = canvasZoom / 100;
    const x = (e.clientX - rect.left) / zoomFactor;
    const y = (e.clientY - rect.top) / zoomFactor;
  
    if (previewMode) {
      // Check if clicking any audio-enabled layer first
      for (let index = 0; index < layers.length; index++) {
        const layer = layers[index];
        if (layer.action === "audio" && layer.pageId === selectedPage && layer.properties.audioUrl) {
          const position = getPreviewPosition(layer, index);
          
          if (
            x >= position.x &&
            x <= position.x + parseInt(layer.properties.size[0]) &&
            y >= position.y &&
            y <= position.y + parseInt(layer.properties.size[1])
          ) {
            // Handle audio playback
            handlePreviewClick(e, layer);
            return; // Return early to prevent other interactions
          }
        }
      }
      
      // If not clicking an audio layer, check for draggable layers
      let foundLayer = false;
      layers.forEach((layer, index) => {
        if (layer.action === "drag" && layer.pageId === selectedPage) {
          const position = getPreviewPosition(layer, index);
          
          if (
            x >= position.x &&
            x <= position.x + parseInt(layer.properties.size[0]) &&
            y >= position.y &&
            y <= position.y + parseInt(layer.properties.size[1])
          ) {
            setIsDragging(true);
            setDragStart({
              x: x - position.x,
              y: y - position.y,
            });
            setDraggingAsset(index);
            foundLayer = true;
          }
        }
      });
      
      if (!foundLayer) {
        setIsDragging(false);
        setDraggingAsset(null);
      }
    } else {
      // Edit mode logic - handle all layer types including audio
      const clickedLayerIndex = layers.findIndex(
        (layer) =>
          layer.pageId === selectedPage &&
          layer.properties.type !== "model3d" && // Skip 3D models
          x >= layer.properties.positionOrigin.x &&
          x <= layer.properties.positionOrigin.x + parseInt(layer.properties.size[0]) &&
          y >= layer.properties.positionOrigin.y &&
          y <= layer.properties.positionOrigin.y + parseInt(layer.properties.size[1])
      );
  
      if (clickedLayerIndex !== -1) {
        const clickedLayer = layers[clickedLayerIndex];
        
        setIsDragging(true);
        setDragStart({
          x: x - clickedLayer.properties.positionOrigin.x,
          y: y - clickedLayer.properties.positionOrigin.y,
        });
        setDraggingAsset("original");
        setSelectedLayer(clickedLayer);
        setAssetPosition(clickedLayer.properties.positionOrigin);
        setAssetSize({
          width: parseInt(clickedLayer.properties.size[0]),
          height: parseInt(clickedLayer.properties.size[1]),
        });
        
        // Update selected action based on layer action
        setSelectedAction(clickedLayer.action);
        
        setLayerProperties({
          ...clickedLayer.properties,
          rotationAngle: clickedLayer.properties.rotationAngle || 0,
        });
      } else if (
        shadowPosition &&
        x >= shadowPosition.x &&
        x <= shadowPosition.x + assetSize.width &&
        y >= shadowPosition.y &&
        y <= shadowPosition.y + assetSize.height
      ) {
        setIsDragging(true);
        setDragStart({ x: x - shadowPosition.x, y: y - shadowPosition.y });
        setDraggingAsset("shadow");
      } else if (
        selectedAsset &&
        x >= assetPosition.x &&
        x <= assetPosition.x + assetSize.width &&
        y >= assetPosition.y &&
        y <= assetPosition.y + assetSize.height
      ) {
        setIsDragging(true);
        setDragStart({ x: x - assetPosition.x, y: y - assetPosition.y });
        setDraggingAsset("original");
      }
    }

    if (!previewMode) {
      const handleSize = 8;
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        if (layer.pageId !== selectedPage || layer.properties.type === "model3d") continue;
        
        const position = layer.properties.positionOrigin;
        const handleX = position.x + parseInt(layer.properties.size[0]);
        const handleY = position.y + parseInt(layer.properties.size[1]);
        
        // Check if clicking on resize handle
        if (
          Math.abs(x - handleX) <= handleSize &&
          Math.abs(y - handleY) <= handleSize
        ) {
          handleStartLayerResize(e, layer._id);
          return; // Exit early to prevent other handlers
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // const x = e.clientX - rect.left;
    // const y = e.clientY - rect.top;
     // Apply zoom adjustment for mouse coordinates
  const zoomFactor = canvasZoom / 100;
  const x = (e.clientX - rect.left) / zoomFactor;
  const y = (e.clientY - rect.top) / zoomFactor;

    if (previewMode) {
      // Preview mode drag logic
      if (typeof draggingAsset === 'number') {
        const layer = layers[draggingAsset];
        if (!layer) return;
        
        const newPosition = {
          x: x - dragStart.x,
          y: y - dragStart.y,
        };
        
        // Keep the dragged object within canvas bounds
        newPosition.x = Math.max(0, Math.min(canvas.width - parseInt(layer.properties.size[0]), newPosition.x));
        newPosition.y = Math.max(0, Math.min(canvas.height - parseInt(layer.properties.size[1]), newPosition.y));
        
        setPreviewPositions(prev => {
          const newPositions = [...prev];
          if (newPositions[draggingAsset]) {
            newPositions[draggingAsset] = {
              ...newPositions[draggingAsset],
              position: newPosition
            };
          }
          return newPositions;
        });
      }
    } else {
      // Edit mode drag logic
      if (draggingAsset === "original") {
        const newPosition = {
          x: x - dragStart.x,
          y: y - dragStart.y,
        };
        setAssetPosition(newPosition);
        setLayerProperties((prev) => ({
          ...prev,
          positionOrigin: newPosition,
        }));
      } else if (draggingAsset === "shadow") {
        const newPosition = {
          x: x - dragStart.x,
          y: y - dragStart.y,
        };
        setShadowPosition(newPosition);
        setLayerProperties((prev) => ({
          ...prev,
          positionDestination: newPosition,
        }));
      }
    }
    
    // Immediately request an animation frame to update the canvas
    requestAnimationFrame(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        drawLayers(ctx);
      }
    });
  };

  const handleMouseUp = () => {
    if (previewMode && isDragging && typeof draggingAsset === 'number') {
      const layer = layers[draggingAsset];
      
      if (layer && layer.action === "drag" && layer.properties.positionDestination) {
        const currentPosition = previewPositions[draggingAsset].position;
        
        if (!isNearDestination(currentPosition, layer.properties.positionDestination)) {
          // Not in destination - apply vibration
          applyVibration(draggingAsset);
        } else {
          // Successfully dropped at destination
          console.log("Successfully dropped at destination!");
          
          // Optionally snap to exact destination
          setPreviewPositions(prev => {
            const newPositions = [...prev];
            newPositions[draggingAsset] = {
              ...newPositions[draggingAsset],
              position: { ...layer.properties.positionDestination }
            };
            return newPositions;
          });
        }
      }
    }
    
    setIsDragging(false);
    setDraggingAsset(null);
  };

  // Start moving a shape (for color fill shapes)
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
    <div className="asset-manager" style={{ display: "flex" }}>
      <Sider />
      {!previewMode && selectedTab === "1" && (
        <div style={{ width: 300, overflowY: "auto" }}>
          <Pages />
        </div>
      )}
      {!previewMode && selectedTab === "2" && (
        <div style={{ width: 300, overflowY: "auto" }}>
          <Layers />
        </div>
      )}
      {!previewMode && selectedTab === "3" && (
        <div style={{ width: 300, overflowY: "auto" }}>
          <Assets/>
        </div>
      )}
      {!previewMode && selectedTab === "4" && (
        <div style={{ width: 300, overflowY: "auto" }}>
          <AudioList/>
        </div>
      )}
      {!previewMode && selectedTab === "5" && (
        <div style={{ width: 300, overflowY: "auto" }}>
          <ShapeLibrary />
        </div>
      )}
      <div style={{ 
        flex: 1, 
        padding: "20px", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center" 
      }}>
        <div style={{
          display: "inline-flex", 
          width: "100%", 
          maxWidth: "800px", 
          alignItems: "center", 
          justifyContent: "space-between", 
          marginBottom: "20px"
        }}>
          <div>{pageName}</div>
          <div style={{ display: "inline-flex", gap: "10px" }}>
            <Button
              type={previewMode ? "primary" : "default"} 
              onClick={togglePreviewMode}
            >
              {previewMode ? "Exit Preview" : "Preview"}
            </Button>
            {!previewMode && (
  <Button 
    type="primary" 
    onClick={handleSaveAllLayers}
    danger={layers.some(layer => !layer.saved)} // Make it red when there are unsaved changes
    icon={layers.some(layer => !layer.saved) ? <SaveOutlined /> : null}
  >
    {layers.some(layer => !layer.saved) ? "Save Changes" : "Save"}
  </Button>
)}
          </div>
        </div>
        <div style={{ 
    position: "relative", 
    width: "800px", 
    height: "600px", 
    overflow: canvasZoom === 100 ? "hidden": "auto",
    border: "1px solid #ccc"
  }}>
          {previewMode && slides.length > 1 && (
            <>
              <Button
                shape="circle"
                icon={<LeftOutlined />}
                onClick={handlePreviousPage}
                disabled={currentPageIndex === 0}
                style={{
                  position: "absolute",
                  left: "-50px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "#8B4513",
                  borderColor: "#8B4513",
                  color: "#fff",
                  zIndex: 10,
                }}
              />
              <Button
                shape="circle"
                icon={<RightOutlined />}
                onClick={handleNextPage}
                disabled={currentPageIndex === slides.length - 1}
                style={{
                  position: "absolute",
                  right: "-50px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "#8B4513",
                  borderColor: "#8B4513",
                  color: "#fff",
                  zIndex: 10,
                }}
              />
            </>
          )}
           <div style={{
      transform: `scale(${canvasZoom / 100})`,
      transformOrigin: "top left",
      width: 800 * (100 / canvasZoom), // Adjust width to maintain visual size
      height: 600 * (100 / canvasZoom), // Adjust height to maintain visual size
      position: "relative"
    }}>
          <canvas
            ref={canvasRef}
            id="asset-canvas"
            width={800}
            height={600}
            style={{ 
              border: "1px solid #ccc", 
              background: "#fff",
              cursor: previewMode && isHoveringAudioLayer ? "pointer" : 
              (isDragging ? "grabbing" : (previewMode ? "grab" : "default"))
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDrop={handleCanvasDrop}
            onDragOver={(e) => e.preventDefault()}
          />
          
          {/* 3D Models Overlay */}
          <div 
  className="models-overlay"
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '800px',
    height: '600px',
    pointerEvents: 'none',
    zIndex: 5
  }}
>
  {canvas3DObjects
    .filter(object => {
      // Find the corresponding layer for this object
      const layerExists = layers.some(layer => 
        layer.objectId === object.id && 
        layer.pageId === selectedPage
      );
      return layerExists;
    })
    .map((object) => {
      // Find corresponding layer
      const layer = layers.find(l => l.objectId === object.id);
      const width = layer ? parseInt(layer.properties.size[0]) : 150;
      const height = layer ? parseInt(layer.properties.size[1]) : 150;
      
      return (
        <div
          key={object.id}
          style={{
            position: 'absolute',
            left: `${object.x}px`,
            top: `${object.y}px`,
            width: `${width}px`,
            height: `${height}px`,
            pointerEvents: 'all',
            cursor: previewMode ? 'default' : 'move',
            border: previewMode ? 'none' : '1px solid rgba(0,0,0,0.1)',
            borderRadius: previewMode ? '0' : '4px',
            background: previewMode ? 'transparent' : 'rgba(255,255,255,0.7)',
            boxShadow: previewMode ? 'none' : '0 2px 5px rgba(0,0,0,0.1)',
            overflow: 'visible'
          }}
          ref={el => {
            if (el) modelContainersRef.current[object.id] = el;
          }}
          onClick={() => !previewMode && handleSelect3DObject(object.id)}
          onMouseDown={(e) => !previewMode && handleStart3DObjectMove(e, object.id)}
        >
          {!previewMode && (
            <>
              {/* Delete button */}
              {/* <button 
                className="delete-model-btn"
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#ff4d4f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  zIndex: 10
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete3DObject(object.id);
                }}
              >
                ×
              </button> */}
              
              {/* Resize handles - all four corners */}
              {/* Top-left resize handle */}
              {/* <div
                className="resize-handle top-left"
                style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '-4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#1890ff',
                  border: '1px solid white',
                  borderRadius: '50%',
                  cursor: 'nwse-resize',
                  zIndex: 10
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleStartResize(e, object.id, 'top-left');
                }}
              /> */}
              
              {/* Top-right resize handle */}
              {/* <div
                className="resize-handle top-right"
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#1890ff',
                  border: '1px solid white',
                  borderRadius: '50%',
                  cursor: 'nesw-resize',
                  zIndex: 10
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleStartResize(e, object.id, 'top-right');
                }}
              /> */}
              
              {/* Bottom-left resize handle */}
              {/* <div
                className="resize-handle bottom-left"
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  left: '-4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#1890ff',
                  border: '1px solid white',
                  borderRadius: '50%',
                  cursor: 'nesw-resize',
                  zIndex: 10
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleStartResize(e, object.id, 'bottom-left');
                }}
              /> */}
              
              {/* Bottom-right resize handle */}
              <div
                className="resize-handle bottom-right"
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#1890ff',
                  border: '1px solid white',
                  borderRadius: '50%',
                  cursor: 'nwse-resize',
                  zIndex: 10
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleStartResize(e, object.id, 'bottom-right');
                }}
              />
            </>
          )}
        </div>
      );
    })}
</div>
          
          {/* Color fill shapes overlay */}
          <div 
            className="shapes-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '800px',
              height: '600px',
              pointerEvents: 'none'
            }}
          >
            {canvasShapes
              .filter(shape => {
                // Find the corresponding layer for this shape
                const layerExists = layers.some(layer => 
                  layer.shapeId === shape.id && 
                  layer.pageId === selectedPage
                );
                return layerExists;
              })
              .map((shape) => {
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
                    style={{
                      position: 'absolute',
                      left: `${shape.x}px`,
                      top: `${shape.y}px`,
                      pointerEvents: previewMode ? 'auto' : 'all',
                      cursor: previewMode ? 'pointer' : 'move'
                    }}
                    onClick={(e) => previewMode && handleShapeClick(e, shape.id)}
                    onMouseDown={(e) => !previewMode && handleStartMoveShape(e, shape.id)}
                  >
                    <div className="svg-container">
                      {/* Directly include the SVG content */}
                      <div 
                        dangerouslySetInnerHTML={{ __html: filledSvg }}
                        style={{ 
                          filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))',
                          transition: 'transform 0.2s',
                          transform: !previewMode ? 'scale(1.0)' : 'scale(1.0)',
                          border: '1px solid rgba(0,0,0,0.1)', 
                          background: 'rgba(255,255,255,0.8)', 
                          borderRadius: '4px',
                          width: '100px',
                          height: '100px' 
                        }}
                      />
                      {!previewMode && (
                        <button 
                          className="delete-shape-btn"
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: '#ff4d4f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '14px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            zIndex: 10
                          }}
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
          </div>
          
          {/* Floating Color Toolbar (in preview mode) */}
          {previewMode && 
            selectedColors.length > 0 && 
            // Only show when there are colorfill layers on the current page
            layers.some(layer => layer.action === "colorfill" && layer.pageId === selectedPage) && (
            <div 
              className="floating-toolbar"
              style={{ 
                position: 'absolute',
                left: `${toolbarPosition.x}px`, 
                top: `${toolbarPosition.y}px`,
                zIndex: 1000,
                padding: '8px 12px',
                background: 'white',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '1px solid #ddd',
                cursor: 'move'
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Store initial positions
                toolbarDragStartRef.current = { x: e.clientX, y: e.clientY };
                setIsDraggingToolbar(true);
              }}
            >
              <div className="toolbar-colors" style={{ display: 'flex', gap: '8px' }}>
                {selectedColors.map((color) => (
                  <div 
                    key={color}
                    className={`toolbar-color ${activeColor === color ? 'active' : ''}`}
                    style={{ 
                      width: '30px', 
                      height: '30px', 
                      borderRadius: '50%', 
                      backgroundColor: color,
                      border: activeColor === color ? '2px solid #000' : '1px solid #e0e0e0',
                      cursor: 'pointer',
                      boxShadow: activeColor === color ? '0 0 5px rgba(0,0,0,0.3)' : 'none',
                      transform: activeColor === color ? 'scale(1.1)' : 'scale(1)'
                    }}
                    onClick={() => handleToolbarColorSelect(color)}
                  />
                ))}
              </div>
              {!activeColor && (
                <div className="toolbar-hint" style={{ fontSize: '12px', color: '#999', marginTop: '5px', textAlign: 'center' }}>
                  Select a color
                </div>
              )}
            </div>
          )}
        </div>
        </div>
               {/* Zoom control buttons at the bottom */}
               <div className="zoom-controls">
  <Button 
    icon={<MinusOutlined />} 
    onClick={handleZoomOut}
    disabled={canvasZoom <= 100}
  />
  <div className="zoom-value">
    {canvasZoom}%
  </div>
  <Button 
    icon={<PlusOutlined />} 
    onClick={handleZoomIn}
    disabled={canvasZoom >= 200}
  />
  <Button 
    onClick={handleZoomReset}
    disabled={canvasZoom === 100}
  >
    Reset
  </Button>
  {/* {previewMode && (
  <div style={{ 
    // position: 'fixed', 
    // bottom: '20px', 
    // right: '20px',
    // zIndex: 1000,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: '8px',
    borderRadius: '50%',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  }}>
    <Button 
      type={playingAudioLayerId ? "primary" : "default"}
      shape="circle"
      icon={<SoundOutlined />} 
      onClick={() => {
        if (audioRef.current && playingAudioLayerId) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setPlayingAudioLayerId(null);
        }
      }}
      disabled={!playingAudioLayerId}
      title={playingAudioLayerId ? "Stop Audio" : "No Audio Playing"}
    />
  </div>
)} */}
</div>

      </div>

      {!previewMode && <RightSidebar />}
    </div>
  );
};

export default GameComponent;