import { useContext, useEffect, useRef, useState } from "react";
import RightSidebar from "../components/RightSidebar";
import Sider from "../components/Sider";
import Pages from "../components/home/pages";
import Layers from "../components/home/layerList";
import Assets from "../components/home/assetFileList";
import ShapeLibrary from "../components/home/ShapeLibrary";
import { AppContext } from "../context/AppContext";
import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "../assets/sass/homescreen.scss";
import { enhanceSvgVisibility, applyFillsToSvgString, createFallbackSvg, isValidSvg } from "./utils";

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
    shapeInitialPosRef
  } = useContext(AppContext);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingAsset, setDraggingAsset] = useState(null);
  const [previewPositions, setPreviewPositions] = useState([]);
  const [vibratingLayer, setVibratingLayer] = useState(null);
  
  // Cache for images to prevent flickering
  const imageCache = useRef({});

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
  }, [movingShapeId, mouseInitialPosRef, shapeInitialPosRef, setCanvasShapes, setMovingShapeId]);

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

  // Toggle preview mode
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

  // Handle canvas drop for shapes (color fill)
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
      
      // Add shape to canvas if it's color fill action
      if (selectedAction === "colorfill") {
        const newShape = {
          id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          shapeId: shapeSource,
          svg: svgContent,
          x,
          y,
          fills: {} // Will store element id to color mapping
        };
        
        setCanvasShapes(prevShapes => [...prevShapes, newShape]);
      }
    } catch (error) {
      console.error('Error adding shape to canvas:', error);
    } finally {
      draggedShapeRef.current = null;
    }
  };

  // Draw all layers on canvas
  const drawLayers = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw all layers
    layers.forEach((layer, index) => {
      if (layer.properties.imgUrl) {
        // Determine current position based on mode
        const currentPosition = getPreviewPosition(layer, index);
        
        const layerType = layer.properties.type || 
                         (layer.properties.imgUrl && layer.properties.imgUrl.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image");
        
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

  // Handle shape click (for color fill)
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

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (previewMode) {
      // In preview mode, check if clicking any draggable layer
      let foundLayer = false;
      
      layers.forEach((layer, index) => {
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
        setDragStart({ x: x - shadowPosition.x, y: y - shadowPosition.y });
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
          <Assets />
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
              <Button type="primary">Save</Button>
            )}
          </div>
        </div>
        <div style={{ position: "relative", width: "800px" }}>
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
          <canvas
            ref={canvasRef}
            id="asset-canvas"
            width={800}
            height={600}
            style={{ 
              border: "1px solid #ccc", 
              background: "#fff",
              cursor: isDragging ? "grabbing" : (previewMode ? "grab" : "default")
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDrop={handleCanvasDrop}
            onDragOver={(e) => e.preventDefault()}
          />
          
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
                  style={{
                    position: 'absolute',
                    left: `${shape.x}px`,
                    top: `${shape.y}px`,
                    pointerEvents: previewMode ? 'auto' : 'all', // Enable pointer events in preview mode
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
          {previewMode && selectedColors.length > 0 && selectedAction === "colorfill" && (
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
      {!previewMode && <RightSidebar />}
    </div>
  );
};

export default GameComponent;

