import { useContext, useEffect, useRef, useState } from "react";
import RightSidebar from "../components/RightSidebar";
import Sider from "../components/Sider";
import Pages from "../components/home/pages";
import Layers from "../components/home/layerList";
import Assets from "../components/home/assetFileList";
import { AppContext } from "../context/AppContext";
import "../assets/sass/homescreen.scss";

const GameComponent = () => {
  const {
    selectedPage,
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
    layerProperties,
    setLayerProperties,
  } = useContext(AppContext);

  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingAsset, setDraggingAsset] = useState(null);

  // Draw all layers and selected asset on canvas
  const drawLayers = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw all layers
    layers.forEach((layer) => {
      if (layer.properties.imgUrl) {
        if (layer.properties.type === "video") {
          const video = document.createElement("video");
          video.src = layer.properties.imgUrl;
          video.onloadeddata = () => {
            ctx.drawImage(
              video,
              layer.properties.positionOrigin.x,
              layer.properties.positionOrigin.y,
              parseInt(layer.properties.size[0]),
              parseInt(layer.properties.size[1])
            );
          };
        } else {
          const img = new Image();
          img.src = layer.properties.imgUrl;
          img.onload = () => {
            ctx.save();
            if (layer.action === "rotation" && layer.properties.rotationAngle) {
              ctx.translate(
                layer.properties.positionOrigin.x + parseInt(layer.properties.size[0]) / 2,
                layer.properties.positionOrigin.y + parseInt(layer.properties.size[1]) / 2
              );
              ctx.rotate((layer.properties.rotationAngle * Math.PI) / 180);
              ctx.translate(
                -(layer.properties.positionOrigin.x + parseInt(layer.properties.size[0]) / 2),
                -(layer.properties.positionOrigin.y + parseInt(layer.properties.size[1]) / 2)
              );
            }
            ctx.drawImage(
              img,
              layer.properties.positionOrigin.x,
              layer.properties.positionOrigin.y,
              parseInt(layer.properties.size[0]),
              parseInt(layer.properties.size[1])
            );
            ctx.restore();
          };
        }
      }
    });

    // Draw selected asset if no layer is created yet
    if (selectedAsset && !selectedLayer) {
      if (selectedAsset.type === "video") {
        const video = document.createElement("video");
        video.src = selectedAsset.src;
        video.onloadeddata = () => {
          ctx.drawImage(
            video,
            assetPosition.x,
            assetPosition.y,
            assetSize.width,
            assetSize.height
          );
        };
      } else {
        const img = new Image();
        img.src = selectedAsset.src;
        img.onload = () => {
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

    // Draw shadow asset if drag is selected and shadowPosition exists
    if (selectedAction === "drag" && shadowPosition && selectedAsset) {
      if (selectedAsset.type === "video") {
        const video = document.createElement("video");
        video.src = selectedAsset.src;
        video.onloadeddata = () => {
          ctx.globalAlpha = 0.5;
          ctx.drawImage(
            video,
            shadowPosition.x,
            shadowPosition.y,
            assetSize.width,
            assetSize.height
          );
          ctx.globalAlpha = 1.0;
        };
      } else {
        const img = new Image();
        img.src = selectedAsset.src;
        img.onload = () => {
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

  // Initialize shadow position when drag is selected
  useEffect(() => {
    if (
      selectedAction === "drag" &&
      selectedAsset &&
      !shadowPosition &&
      layerProperties.positionOrigin
    ) {
      setShadowPosition(layerProperties.positionDestination);
    } else if (selectedAction !== "drag") {
      setShadowPosition(null);
    }
  }, [selectedAction, selectedAsset, shadowPosition, layerProperties, setShadowPosition]);

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
  ]);

  const handleMouseDown = (e) => {
    if (selectedAction !== "drag" || !selectedAsset) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking any layer
    const clickedLayer = layers.find(
      (layer) =>
        x >= layer.properties.positionOrigin.x &&
        x <= layer.properties.positionOrigin.x + parseInt(layer.properties.size[0]) &&
        y >= layer.properties.positionOrigin.y &&
        y <= layer.properties.positionOrigin.y + parseInt(layer.properties.size[1])
    );

    if (clickedLayer) {
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
  };

  const handleMouseMove = (e) => {
    if (!isDragging || selectedAction !== "drag") return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingAsset(null);
  };

  return (
    <div className="asset-manager" style={{ display: "flex" }}>
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
        <canvas
          ref={canvasRef}
          id="asset-canvas"
          width={800}
          height={600}
          style={{ border: "1px solid #ccc", background: "#fff" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
      <RightSidebar />
    </div>
  );
};

export default GameComponent;