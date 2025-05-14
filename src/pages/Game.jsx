import { useContext, useEffect, useRef, useState } from "react";
import RightSidebar from "../components/RightSidebar";
import Sider from "../components/Sider";
import Pages from "../components/home/pages";
import Layers from "../components/home/layerList";
import Assets from "../components/home/assetFileList";
import { AppContext } from "../context/AppContext";
import { Button, message } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { createLayer } from "../services/api";
import "../assets/sass/homescreen.scss";

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
    setAssetSize,
    selectedTab,
    layers,
    setLayers,
    selectedLayer,
    layerProperties,
    setLayerProperties,
    slides,
    currentPageIndex,
    switchPage,
  } = useContext(AppContext);

  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingAsset, setDraggingAsset] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewPositions, setPreviewPositions] = useState([]);
  const [vibratingLayer, setVibratingLayer] = useState(null);
  const [resizingHandle, setResizingHandle] = useState(null);

  const imageCache = useRef({});

  const preloadImages = () => {
    layers.forEach((layer) => {
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

  const togglePreviewMode = () => {
    const newPreviewMode = !previewMode;
    setPreviewMode(newPreviewMode);

    if (newPreviewMode) {
      const initialPositions = layers.map((layer, index) => ({
        index: index,
        position: { ...layer.properties.positionOrigin },
      }));
      setPreviewPositions(initialPositions);
    }
  };

  const handlePreviousPage = () => {
    switchPage("prev");
  };

  const handleNextPage = () => {
    switchPage("next");
  };

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

      setPreviewPositions((prev) => {
        const newPositions = [...prev];
        if (newPositions[layerIndex]) {
          newPositions[layerIndex] = {
            ...newPositions[layerIndex],
            position: {
              x: originalPositions[layerIndex].position.x + offsetX,
              y: originalPositions[layerIndex].position.y + offsetY,
            },
          };
        }
        return newPositions;
      });

      vibrationCount++;
      setTimeout(vibrate, 50);
    };

    vibrate();
  };

  const isNearDestination = (position, destination) => {
    const tolerance = 30;
    return (
      Math.abs(position.x - destination.x) <= tolerance &&
      Math.abs(position.y - destination.y) <= tolerance
    );
  };

  const getPreviewPosition = (layer, index) => {
    if (previewMode && previewPositions[index]) {
      return previewPositions[index].position;
    }
    return layer.properties.positionOrigin;
  };

  const getResizeHandles = (x, y, width, height) => {
    const handleSize = 8;
    return [
      { id: "top-left", x: x - handleSize / 2, y: y - handleSize / 2, cursor: "nw-resize" },
      { id: "top-center", x: x + width / 2 - handleSize / 2, y: y - handleSize / 2, cursor: "n-resize" },
      { id: "top-right", x: x + width - handleSize / 2, y: y - handleSize / 2, cursor: "ne-resize" },
      { id: "middle-left", x: x - handleSize / 2, y: y + height / 2 - handleSize / 2, cursor: "w-resize" },
      { id: "middle-right", x: x + width - handleSize / 2, y: y + height / 2 - handleSize / 2, cursor: "e-resize" },
      { id: "bottom-left", x: x - handleSize / 2, y: y + height - handleSize / 2, cursor: "sw-resize" },
      { id: "bottom-center", x: x + width / 2 - handleSize / 2, y: y + height - handleSize / 2, cursor: "s-resize" },
      { id: "bottom-right", x: x + width - handleSize / 2, y: y + height - handleSize / 2, cursor: "se-resize" },
    ];
  };

  const handleSave = async () => {
    if (!selectedPage || !selectedAsset || !selectedAction) {
      message.error("Please select a page, asset, and action to save the layer.");
      return;
    }

    const unsavedLayer = layers.find(
      (layer) =>
        layer.properties.imgUrl === selectedAsset.src &&
        layer.action === selectedAction &&
        !layer.saved
    );

    if (!unsavedLayer) {
      message.warning("No unsaved layer to save.");
      return;
    }

    try {
      const payload = {
        name: unsavedLayer.name || "Untitled Layer",
        action: unsavedLayer.action,
        properties: {
          color: layerProperties.color || [],
          size: layerProperties.size || [`${assetSize.width}px`, `${assetSize.height}px`],
          positionOrigin: layerProperties.positionOrigin || assetPosition,
          positionDestination: layerProperties.positionDestination || shadowPosition || { x: assetPosition.x + 50, y: assetPosition.y + 50 },
          bearer: layerProperties.bearer || 0,
          imgUrl: layerProperties.imgUrl || selectedAsset.src,
          audioUrl: layerProperties.audioUrl || "",
          type: selectedAsset.type || "image",
          rotationAngle: layerProperties.rotationAngle || 0,
        },
        pageId: selectedPage,
      };

      const savedLayer = await createLayer(payload);
      setLayers((prev) =>
        prev.map((l) =>
          l.properties.imgUrl === unsavedLayer.properties.imgUrl && l.action === unsavedLayer.action
            ? { ...savedLayer, saved: true }
            : l
        )
      );
      message.success("Layer saved successfully!");
    } catch (error) {
      console.error("Error saving layer:", error);
      message.error(error.message || "Failed to save layer. Please try again.");
    }
  };

  const drawLayers = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    layers.forEach((layer, index) => {
      if (layer.properties.imgUrl) {
        const currentPosition = getPreviewPosition(layer, index);
        const layerType =
          layer.properties.type ||
          (layer.properties.imgUrl.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image");

        if (layerType === "video") {
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

            ctx.drawImage(
              img,
              currentPosition.x,
              currentPosition.y,
              parseInt(layer.properties.size[0]),
              parseInt(layer.properties.size[1])
            );

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

      if (selectedAction === "resize") {
        const handles = getResizeHandles(
          assetPosition.x,
          assetPosition.y,
          assetSize.width,
          assetSize.height
        );
        handles.forEach((handle) => {
          ctx.fillStyle = "#1890ff";
          ctx.beginPath();
          ctx.arc(handle.x + 4, handle.y + 4, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    }

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

  useEffect(() => {
    preloadImages();
  }, [layers, selectedAsset]);

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
    vibratingLayer,
  ]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (previewMode) {
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
    } else if (selectedAction === "resize" && selectedAsset) {
      const handles = getResizeHandles(
        assetPosition.x,
        assetPosition.y,
        assetSize.width,
        assetSize.height
      );
      const clickedHandle = handles.find((handle) => {
        const handleX = handle.x + 4;
        const handleY = handle.y + 4;
        return (
          x >= handleX - 4 &&
          x <= handleX + 4 &&
          y >= handleY - 4 &&
          y <= handleY + 4
        );
      });

      if (clickedHandle) {
        setIsDragging(true);
        setResizingHandle(clickedHandle.id);
        setDragStart({ x, y });
      }
    } else if (selectedAction === "drag") {
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

    if (previewMode && typeof draggingAsset === "number") {
      const layer = layers[draggingAsset];
      if (!layer) return;

      const newPosition = {
        x: x - dragStart.x,
        y: y - dragStart.y,
      };

      newPosition.x = Math.max(0, Math.min(canvas.width - parseInt(layer.properties.size[0]), newPosition.x));
      newPosition.y = Math.max(0, Math.min(canvas.height - parseInt(layer.properties.size[1]), newPosition.y));

      setPreviewPositions((prev) => {
        const newPositions = [...prev];
        if (newPositions[draggingAsset]) {
          newPositions[draggingAsset] = {
            ...newPositions[draggingAsset],
            position: newPosition,
          };
        }
        return newPositions;
      });
    } else if (selectedAction === "resize" && resizingHandle && selectedAsset) {
      let newWidth = assetSize.width;
      let newHeight = assetSize.height;
      let newX = assetPosition.x;
      let newY = assetPosition.y;

      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;

      switch (resizingHandle) {
        case "top-left":
          newWidth = assetSize.width - deltaX;
          newHeight = assetSize.height - deltaY;
          newX = assetPosition.x + deltaX;
newY = assetPosition.y + deltaY;
          break;
        case "top-center":
          newHeight = assetSize.height - deltaY;
          newY = assetPosition.y + deltaY;
          break;
        case "top-right":
          newWidth = assetSize.width + deltaX;
          newHeight = assetSize.height - deltaY;
          newY = assetPosition.y + deltaY;
          break;
        case "middle-left":
          newWidth = assetSize.width - deltaX;
          newX = assetPosition.x + deltaX;
          break;
        case "middle-right":
          newWidth = assetSize.width + deltaX;
          break;
        case "bottom-left":
          newWidth = assetSize.width - deltaX;
          newHeight = assetSize.height + deltaY;
          newX = assetPosition.x + deltaX;
          break;
        case "bottom-center":
          newHeight = assetSize.height + deltaY;
          break;
        case "bottom-right":
          newWidth = assetSize.width + deltaX;
          newHeight = assetSize.height + deltaY;
          break;
        default:
          break;
      }

      newWidth = Math.max(20, Math.min(canvas.width - newX, newWidth));
      newHeight = Math.max(20, Math.min(canvas.height - newY, newHeight));
      newX = Math.max(0, Math.min(canvas.width - newWidth, newX));
      newY = Math.max(0, Math.min(canvas.height - newHeight, newY));

      setAssetSize({ width: newWidth, height: newHeight });
      setAssetPosition({ x: newX, y: newY });
      setLayerProperties((prev) => ({
        ...prev,
        size: [`${newWidth}px`, `${newHeight}px`],
        positionOrigin: { x: newX, y: newY },
      }));

      setDragStart({ x, y });
    } else if (selectedAction === "drag") {
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

    requestAnimationFrame(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        drawLayers(ctx);
      }
    });
  };

  const handleMouseUp = () => {
    if (previewMode && isDragging && typeof draggingAsset === "number") {
      const layer = layers[draggingAsset];

      if (layer && layer.action === "drag" && layer.properties.positionDestination) {
        const currentPosition = previewPositions[draggingAsset].position;

        if (!isNearDestination(currentPosition, layer.properties.positionDestination)) {
          applyVibration(draggingAsset);
        } else {
          console.log("Successfully dropped at destination!");
          setPreviewPositions((prev) => {
            const newPositions = [...prev];
            newPositions[draggingAsset] = {
              ...newPositions[draggingAsset],
              position: { ...layer.properties.positionDestination },
            };
            return newPositions;
          });
        }
      }
    }

    setIsDragging(false);
    setDraggingAsset(null);
    setResizingHandle(null);
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
      <div
        style={{
          flex: 1,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            width: "100%",
            maxWidth: "800px",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div>{pageName}</div>
          <div style={{ display: "inline-flex", gap: "10px" }}>
            <Button
              type={previewMode ? "primary" : "default"}
              onClick={togglePreviewMode}
            >
              {previewMode ? "Exit Preview" : "Preview"}
            </Button>
            {!previewMode && (
              <Button type="primary" onClick={handleSave}>
                Save
              </Button>
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
              cursor:
                isDragging && resizingHandle
                  ? getResizeHandles(assetPosition.x, assetPosition.y, assetSize.width, assetSize.height).find(
                      (h) => h.id === resizingHandle
                    )?.cursor || "default"
                  : isDragging
                  ? "grabbing"
                  : previewMode
                  ? "grab"
                  : "default",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>
      {!previewMode && <RightSidebar />}
    </div>
  );
};

export default GameComponent;