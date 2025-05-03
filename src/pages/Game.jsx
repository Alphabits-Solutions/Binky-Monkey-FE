import { useContext, useEffect, useRef, useState } from "react";
import RightSidebar from "../components/RightSidebar";
import Sider from "../components/Sider";
import Pages from "../components/home/pages";
import Layers from "../components/home/layerList";
import Assets from "../components/home/assetFileList";
import { AppContext } from "../context/AppContext";
import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { getAllPages, getAllLayers } from "../services/api";
import "../assets/sass/homescreen.scss";

const GameComponent = () => {
  const {
    selectedActivity,
    selectedPage,
    setSelectedPage,
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
    layerProperties,
    setLayerProperties,
    selectedSlideId,
    setSelectedSlideId,
  } = useContext(AppContext);

  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingAsset, setDraggingAsset] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewPositions, setPreviewPositions] = useState([]);
  const [vibratingLayer, setVibratingLayer] = useState(null);
  
  // New states for enhanced preview mode
  const [allPages, setAllPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageLayersMap, setPageLayersMap] = useState({});
  
  // Cache for images to prevent flickering
  const imageCache = useRef({});

  // Fetch all pages for the activity
  const fetchAllPages = async () => {
    if (!selectedActivity) return;
    
    try {
      const pages = await getAllPages(selectedActivity);
      setAllPages(Array.isArray(pages) ? pages : []);
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    }
  };

  // Load layers for a specific page
  const loadLayersForPage = async (pageId) => {
    if (!pageId) return null;
    
    try {
      const result = await getAllLayers(pageId);
      const processedLayers = (Array.isArray(result) ? result : []).map((layer) => ({
        ...layer,
        saved: true,
        properties: {
          ...layer.properties,
          type: layer.properties.type || (layer.properties.imgUrl.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image"),
        },
      }));
      
      return processedLayers;
    } catch (error) {
      console.error(`Failed to load layers for page ${pageId}:`, error);
      return [];
    }
  };

  // Load layers for all pages (for preview mode)
  const loadAllPagesLayers = async () => {
    if (allPages.length === 0) return;
    
    const layersMap = {};
    
    for (const page of allPages) {
      const pageLayers = await loadLayersForPage(page._id);
      if (pageLayers) {
        layersMap[page._id] = pageLayers;
      }
    }
    
    setPageLayersMap(layersMap);
  };

  // Initialize current page index based on selected page
  useEffect(() => {
    if (previewMode && allPages.length > 0 && selectedPage) {
      const index = allPages.findIndex(page => page._id === selectedPage);
      if (index !== -1) {
        setCurrentPageIndex(index);
      }
    }
  }, [previewMode, allPages, selectedPage]);

  // Fetch all pages when activity changes or preview mode is entered
  useEffect(() => {
    if (selectedActivity) {
      fetchAllPages();
    }
  }, [selectedActivity]);

  // Load all pages' layers when entering preview mode
  useEffect(() => {
    if (previewMode && allPages.length > 0) {
      loadAllPagesLayers();
    }
  }, [previewMode, allPages]);

  // Preload images to prevent flickering
  const preloadImages = () => {
    // Preload current page layers
    const currentLayers = previewMode && allPages[currentPageIndex] 
      ? pageLayersMap[allPages[currentPageIndex]._id] || []
      : layers;
    
    currentLayers.forEach(layer => {
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

  // Toggle preview mode
  const togglePreviewMode = () => {
    const newPreviewMode = !previewMode;
    setPreviewMode(newPreviewMode);
    
    if (newPreviewMode) {
      // Initialize preview positions for all layers when entering preview mode
      const initialPositions = layers.map((layer, index) => ({
        index: index,
        position: { ...layer.properties.positionOrigin },
      }));
      setPreviewPositions(initialPositions);
    } else {
      // When exiting preview mode, ensure we reset to the currently viewed page
      if (allPages[currentPageIndex]) {
        setSelectedPage(allPages[currentPageIndex]._id);
        setSelectedSlideId(allPages[currentPageIndex]._id);
        // Load the layers for the current page back into the main state
        if (pageLayersMap[allPages[currentPageIndex]._id]) {
          setLayers(pageLayersMap[allPages[currentPageIndex]._id]);
        }
      }
    }
  };

  // Go to next page in preview mode
  const goToNextPage = () => {
    if (currentPageIndex < allPages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      // Reset preview positions for the new page
      const newPageLayers = pageLayersMap[allPages[currentPageIndex + 1]._id] || [];
      const initialPositions = newPageLayers.map((layer, index) => ({
        index: index,
        position: { ...layer.properties.positionOrigin },
      }));
      setPreviewPositions(initialPositions);
      setVibratingLayer(null);
    }
  };

  // Go to previous page in preview mode
  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      // Reset preview positions for the new page
      const newPageLayers = pageLayersMap[allPages[currentPageIndex - 1]._id] || [];
      const initialPositions = newPageLayers.map((layer, index) => ({
        index: index,
        position: { ...layer.properties.positionOrigin },
      }));
      setPreviewPositions(initialPositions);
      setVibratingLayer(null);
    }
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

  // Draw all layers on canvas
  const drawLayers = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Get the current layers based on mode and page
    const currentLayers = previewMode && allPages[currentPageIndex] 
      ? pageLayersMap[allPages[currentPageIndex]._id] || []
      : layers;

    // Draw all layers
    currentLayers.forEach((layer, index) => {
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
            
            ctx.restore();
          }
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
  }, [layers, selectedAsset, currentPageIndex, pageLayersMap]);

  // Redraw canvas when dependencies change
  useEffect(() => {
    if ((selectedPage || (previewMode && allPages.length > 0)) && canvasRef.current) {
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
    vibratingLayer,
    currentPageIndex,
    pageLayersMap,
    allPages
  ]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Get the current layers based on mode and page
    const currentLayers = previewMode && allPages[currentPageIndex] 
      ? pageLayersMap[allPages[currentPageIndex]._id] || []
      : layers;

    if (previewMode) {
      // In preview mode, check if clicking any draggable layer
      let foundLayer = false;
      
      currentLayers.forEach((layer, index) => {
        if (layer.action === "drag") {
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
    } else if (selectedAction === "drag") {
      // Edit mode - original logic
      const clickedLayer = layers.findIndex(
        (layer) =>
          x >= layer.properties.positionOrigin.x &&
          x <= layer.properties.positionOrigin.x + parseInt(layer.properties.size[0]) &&
          y >= layer.properties.positionOrigin.y &&
          y <= layer.properties.positionOrigin.y + parseInt(layer.properties.size[1])
      );

      if (clickedLayer !== -1) {
        setIsDragging(true);
        setDragStart({
          x: x - layers[clickedLayer].properties.positionOrigin.x,
          y: y - layers[clickedLayer].properties.positionOrigin.y,
        });
        setDraggingAsset("original");
        setSelectedLayer(layers[clickedLayer]);
        setAssetPosition(layers[clickedLayer].properties.positionOrigin);
        setAssetSize({
          width: parseInt(layers[clickedLayer].properties.size[0]),
          height: parseInt(layers[clickedLayer].properties.size[1]),
        });
        setLayerProperties({
          ...layers[clickedLayer].properties,
          rotationAngle: layers[clickedLayer].properties.rotationAngle || 0,
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
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (previewMode) {
      // Preview mode drag logic
      if (typeof draggingAsset === 'number') {
        const currentLayers = allPages[currentPageIndex] 
          ? pageLayersMap[allPages[currentPageIndex]._id] || []
          : [];
        
        const layer = currentLayers[draggingAsset];
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
      const currentLayers = allPages[currentPageIndex] 
        ? pageLayersMap[allPages[currentPageIndex]._id] || []
        : [];
      
      const layer = currentLayers[draggingAsset];
      
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

  // Get current page title for preview mode
  const getCurrentPageTitle = () => {
    if (previewMode && allPages[currentPageIndex]) {
      return allPages[currentPageIndex].title;
    }
    return pageName;
  };

  return (
    <div className="asset-manager" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Preview mode layout - full screen with no sidebars */}
      {previewMode ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px" }}>
          <div style={{
            display: "flex", 
            width: "100%", 
            alignItems: "center", 
            justifyContent: "space-between", 
            marginBottom: "20px"
          }}>
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>
              Preview: {getCurrentPageTitle()} ({currentPageIndex + 1}/{allPages.length})
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Button 
                type="primary" 
                onClick={togglePreviewMode}
              >
                Exit Preview
              </Button>
            </div>
          </div>
          <div style={{ 
            flex: 1, 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            background: "#F9F6F2",
            position: "relative"
          }}>
            {/* Previous button on left side of canvas */}
            <Button
              type="primary"
              shape="circle"
              icon={<LeftOutlined />}
              onClick={goToPreviousPage}
              disabled={currentPageIndex === 0}
              style={{
                position: "absolute",
                left: 450,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: 60,
                height: 60,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background:"#7e2807",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            />
            
            <canvas
              ref={canvasRef}
              id="asset-canvas"
              width={800}
              height={600}
              style={{ 
                border: "1px solid #ccc", 
                background: "#fff",
                cursor: isDragging ? "grabbing" : "grab"
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            
            {/* Next button on right side of canvas */}
            <Button
              type="primary"
              shape="circle"
              icon={<RightOutlined />}
              onClick={goToNextPage}
              disabled={currentPageIndex >= allPages.length - 1}
              style={{
                position: "absolute",
                right: 450,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: 60,
                height: 60,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background:"#7e2807",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            />
          </div>
        </div>
      ) : (
        /* Normal edit mode layout with sidebars */
        <div style={{ display: "flex", flex: 1 }}>
          <Sider />
          {selectedTab === "1" && (
            <div style={{ width: 300, overflowY: "auto" }}>
              <Pages />
            </div>
          )}
          {selectedTab === "2" && (
            <div style={{ width: 300, overflowY: "auto" }}>
              <Layers />
            </div>
          )}
          {selectedTab === "3" && (
            <div style={{ width: 300, overflowY: "auto" }}>
              <Assets />
            </div>
          )}
          <div style={{ flex: 1, padding: "20px" }}>
            <div style={{
              display: "inline-flex", 
              width: "100%", 
              alignItems: "center", 
              justifyContent: "space-between", 
              marginBottom: "20px"
            }}>
              <div>
                {pageName}
              </div>
              <div style={{ display: "inline-flex", gap: "10px" }}>
                <Button 
                  type="primary" 
                  onClick={togglePreviewMode}
                  disabled={!selectedPage}
                >
                  Preview
                </Button>
                <Button type="primary">Save</Button>
              </div>
            </div>
            <canvas
              ref={canvasRef}
              id="asset-canvas"
              width={800}
              height={600}
              style={{ 
                border: "1px solid #ccc", 
                background: "#fff",
                cursor: isDragging ? "grabbing" : "default"
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
          <RightSidebar />
        </div>
      )}
    </div>
  );
};

export default GameComponent;