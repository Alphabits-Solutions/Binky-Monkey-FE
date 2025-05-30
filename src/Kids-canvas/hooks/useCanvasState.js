import { useState, useCallback } from 'react';

export const useCanvasState = (apiBaseUrl) => {
  // Core data states
  const [pages, setPages] = useState([]);
  const [layers, setLayers] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // Interaction states
  const [interactionStates, setInteractionStates] = useState({
    drag: false,
    colorfill: false,
    audio: false,
    model3d: false,
    resize: false
  });
  
  // Canvas objects states
  const [canvasShapes, setCanvasShapes] = useState([]);
  const [canvas3DObjects, setCanvas3DObjects] = useState([]);
  
  // Color states
  const [selectedColors, setSelectedColors] = useState([]);
  const [activeColor, setActiveColor] = useState(null);
  
  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(100);

  // Fetch wrapper with error handling
  const fetchApi = useCallback(async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }, [apiBaseUrl]);

  // Load activity data
  const loadActivityData = useCallback(async (activityId) => {
    try {
      // Fetch pages for the activity
      const pagesResponse = await fetchApi(`/page?activityId=${activityId}`);
      const fetchedPages = Array.isArray(pagesResponse) ? pagesResponse : [];
      setPages(fetchedPages);

      if (fetchedPages.length > 0) {
        // Load layers for all pages
        const allLayers = [];
        const allShapes = [];
        const all3DObjects = [];
        let allColors = [];

        for (const page of fetchedPages) {
          const layersResponse = await fetchApi(`/layer?pageId=${page._id}`);
          const pageLayers = Array.isArray(layersResponse) ? layersResponse : [];
          
          // Process layers
          pageLayers.forEach(layer => {
            // Add processed layer
            const processedLayer = {
              ...layer,
              properties: {
                ...layer.properties,
                type: layer.properties.type || 
                      (layer.properties.imgUrl && layer.properties.imgUrl.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image")
              }
            };
            
            allLayers.push(processedLayer);

            // Handle colorfill layers (shapes)
            if (layer.action === "colorfill" && layer.properties.svgContent) {
              const shapeId = layer.shapeId || `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              
              allShapes.push({
                id: shapeId,
                svg: layer.properties.svgContent,
                x: layer.properties.positionOrigin?.x || 0,
                y: layer.properties.positionOrigin?.y || 0,
                fills: {} // Empty fills initially
              });

              // Collect colors from this layer
              if (layer.properties.color && Array.isArray(layer.properties.color)) {
                layer.properties.color.forEach(color => {
                  if (!allColors.includes(color) && allColors.length < 5) {
                    allColors.push(color);
                  }
                });
              }
            }

            // Handle 3D model layers
            if (layer.action === "model3d" && (layer.properties.modelUrl || layer.properties.imgUrl)) {
              const objectId = layer.objectId || `3d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              
              all3DObjects.push({
                id: objectId,
                modelUrl: layer.properties.modelUrl || layer.properties.imgUrl,
                x: layer.properties.positionOrigin?.x || 0,
                y: layer.properties.positionOrigin?.y || 0,
                rotation: layer.properties.rotation || { x: 0, y: 0, z: 0 },
                scale: layer.properties.scale || 1.0
              });
            }
          });
        }

        console.log('Loaded layers:', allLayers.length);
        setLayers(allLayers);
        setCanvasShapes(allShapes);
        setCanvas3DObjects(all3DObjects);
        setSelectedColors(allColors);
        setCurrentPageIndex(0);
      }
    } catch (error) {
      console.error('Failed to load activity data:', error);
      throw error;
    }
  }, [fetchApi]);

  // Sync with server state
  const syncWithServerState = useCallback((serverLayerStates) => {
    console.log('Syncing with server state:', serverLayerStates);
    
    setLayers(prevLayers => 
      prevLayers.map(layer => {
        const serverState = serverLayerStates[layer._id];
        if (serverState) {
          const updatedLayer = { ...layer };
          
          // Update position if changed
          if (serverState.positionOrigin) {
            updatedLayer.properties = {
              ...updatedLayer.properties,
              positionOrigin: serverState.positionOrigin
            };
          }
          
          // Update size if changed
          if (serverState.size) {
            updatedLayer.properties = {
              ...updatedLayer.properties,
              size: serverState.size
            };
          }
          
          // Update rotation if changed (for 3D objects)
          if (serverState.rotation) {
            updatedLayer.properties = {
              ...updatedLayer.properties,
              rotation: serverState.rotation
            };
          }
          
          return updatedLayer;
        }
        return layer;
      })
    );
    
    // Update 3D objects state
    setCanvas3DObjects(prevObjects => 
      prevObjects.map(obj => {
        const serverState = serverLayerStates[obj.id] || serverLayerStates[`3d-${obj.id}`];
        if (serverState && serverState.rotation) {
          return {
            ...obj,
            rotation: serverState.rotation
          };
        }
        return obj;
      })
    );
  }, []);

  // SIMPLIFIED: Update layer in real-time
  const updateLayerRealtime = useCallback((layerId, updates) => {
    console.log('🔄 updateLayerRealtime called:', { layerId, updates });
    
    setLayers(prevLayers => {
      const layerIndex = prevLayers.findIndex(layer => layer._id === layerId);
      
      if (layerIndex === -1) {
        console.warn('⚠️ Layer not found with ID:', layerId);
        return prevLayers;
      }
      
      const updatedLayers = prevLayers.map(layer => {
        if (layer._id === layerId) {
          let updatedLayer;
          
          // Handle rotation updates specially for 3D objects
          if (updates.rotation) {
            updatedLayer = { 
              ...layer, 
              properties: { 
                ...layer.properties, 
                rotation: updates.rotation
              }
            };
          } else {
            // Handle other updates (position, size, etc.)
            updatedLayer = { 
              ...layer, 
              properties: { 
                ...layer.properties, 
                ...updates 
              }
            };
          }
          
          console.log('✅ Updated layer properties:', updatedLayer.properties);
          return updatedLayer;
        }
        return layer;
      });
      
      console.log('🎯 Layer update completed');
      return updatedLayers;
    });
  }, []);

  // Update shape in real-time
  const updateShapeRealtime = useCallback((shapeId, elementId, color) => {
    setCanvasShapes(prevShapes => 
      prevShapes.map(shape => {
        if (shape.id === shapeId) {
          return {
            ...shape,
            fills: {
              ...shape.fills,
              [elementId]: color
            }
          };
        }
        return shape;
      })
    );
  }, []);

  // Update 3D object in real-time
  const update3DObjectRealtime = useCallback((objectId, updates) => {
    setCanvas3DObjects(prevObjects => 
      prevObjects.map(obj => 
        obj.id === objectId 
          ? { ...obj, ...updates }
          : obj
      )
    );
  }, []);

  // Simplified API functions for kids canvas
  const getPageLayers = useCallback((pageId) => {
    return layers.filter(layer => layer.pageId === pageId);
  }, [layers]);

  const getPageShapes = useCallback((pageId) => {
    const pageLayerIds = layers
      .filter(layer => layer.pageId === pageId && layer.action === "colorfill")
      .map(layer => layer.shapeId);
    
    return canvasShapes.filter(shape => pageLayerIds.includes(shape.id));
  }, [layers, canvasShapes]);

  const getPage3DObjects = useCallback((pageId) => {
    const pageObjectIds = layers
      .filter(layer => layer.pageId === pageId && layer.action === "model3d")
      .map(layer => layer.objectId);
    
    return canvas3DObjects.filter(obj => pageObjectIds.includes(obj.id));
  }, [layers, canvas3DObjects]);

  // Reset canvas state
  const resetCanvasState = useCallback(() => {
    setPages([]);
    setLayers([]);
    setCanvasShapes([]);
    setCanvas3DObjects([]);
    setSelectedColors([]);
    setActiveColor(null);
    setCurrentPageIndex(0);
    setZoomLevel(100);
  }, []);

  // Update interaction states
  const updateInteractionState = useCallback((interactionType, enabled) => {
    setInteractionStates(prev => ({
      ...prev,
      [interactionType]: enabled
    }));
  }, []);

  // SIMPLIFIED: Batch update for performance (without complex conflict resolution)
  const batchUpdateLayers = useCallback((updates) => {
    console.log('🔄 Batch updating layers:', updates);
    
    setLayers(prevLayers => {
      const updatedLayers = [...prevLayers];
      
      updates.forEach(({ layerId, updates: layerUpdates }) => {
        const index = updatedLayers.findIndex(layer => layer._id === layerId);
        if (index !== -1) {
          updatedLayers[index] = {
            ...updatedLayers[index],
            properties: {
              ...updatedLayers[index].properties,
              ...layerUpdates
            }
          };
          console.log('✅ Applied batch update for layer:', layerId);
        }
      });
      
      return updatedLayers;
    });
  }, []);

  // Get current page data
  const getCurrentPageData = useCallback(() => {
    const currentPage = pages[currentPageIndex];
    if (!currentPage) return null;

    return {
      page: currentPage,
      layers: getPageLayers(currentPage._id),
      shapes: getPageShapes(currentPage._id),
      objects3D: getPage3DObjects(currentPage._id)
    };
  }, [pages, currentPageIndex, getPageLayers, getPageShapes, getPage3DObjects]);

  // Navigation helpers
  const canGoNext = useCallback(() => {
    return currentPageIndex < pages.length - 1;
  }, [currentPageIndex, pages.length]);

  const canGoPrev = useCallback(() => {
    return currentPageIndex > 0;
  }, [currentPageIndex]);

  const goToPage = useCallback((index) => {
    if (index >= 0 && index < pages.length) {
      setCurrentPageIndex(index);
    }
  }, [pages.length]);

  // Sync helpers for real-time updates
  const syncWithRemoteState = useCallback((remoteState) => {
    // Sync layers
    if (remoteState.layers) {
      setLayers(remoteState.layers);
    }
    
    // Sync shapes
    if (remoteState.shapes) {
      setCanvasShapes(remoteState.shapes);
    }
    
    // Sync 3D objects
    if (remoteState.objects3D) {
      setCanvas3DObjects(remoteState.objects3D);
    }
    
    // Sync colors
    if (remoteState.colors) {
      setSelectedColors(remoteState.colors);
    }
    
    // Sync page
    if (remoteState.currentPageIndex !== undefined) {
      setCurrentPageIndex(remoteState.currentPageIndex);
    }
    
    // Sync zoom
    if (remoteState.zoomLevel !== undefined) {
      setZoomLevel(remoteState.zoomLevel);
    }
  }, []);

  return {
    // Data states
    pages,
    setPages,
    layers,
    setLayers,
    currentPageIndex,
    setCurrentPageIndex,
    
    // Interaction states
    interactionStates,
    setInteractionStates,
    updateInteractionState,
    
    // Canvas objects
    canvasShapes,
    setCanvasShapes,
    canvas3DObjects,
    setCanvas3DObjects,
    
    // Colors
    selectedColors,
    setSelectedColors,
    activeColor,
    setActiveColor,
    
    // Zoom
    zoomLevel,
    setZoomLevel,
    
    // API functions
    loadActivityData,
    
    // Real-time updates - SIMPLIFIED
    updateLayerRealtime,
    updateShapeRealtime,
    update3DObjectRealtime,
    batchUpdateLayers,
    
    // Server sync
    syncWithServerState,
    
    // Getters
    getPageLayers,
    getPageShapes,
    getPage3DObjects,
    getCurrentPageData,
    
    // Navigation
    canGoNext,
    canGoPrev,
    goToPage,
    
    // Utilities
    resetCanvasState,
    syncWithRemoteState
  };
};