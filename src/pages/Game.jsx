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
  } = useContext(AppContext);

  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingAsset, setDraggingAsset] = useState(null);

  // Draw assets on canvas
  const drawAsset = (ctx, img) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw original asset
    ctx.drawImage(
      img,
      assetPosition.x,
      assetPosition.y,
      assetSize.width,
      assetSize.height
    );

    // Draw shadow asset if drag is selected and shadowPosition exists
    if (selectedAction === "drag" && shadowPosition) {
      ctx.globalAlpha = 0.5; // Semi-transparent shadow
      ctx.drawImage(
        img,
        shadowPosition.x,
        shadowPosition.y,
        assetSize.width,
        assetSize.height
      );
      ctx.globalAlpha = 1.0; // Reset opacity
    }
  };

  // Initialize shadow position when drag is selected
  useEffect(() => {
    if (
      selectedAction === "drag" &&
      selectedAsset &&
      !shadowPosition &&
      assetPosition
    ) {
      setShadowPosition({
        x: assetPosition.x + 50,
        y: assetPosition.y + 50,
      });
    }
  }, [selectedAction, selectedAsset, shadowPosition, assetPosition, setShadowPosition]);

  // Redraw canvas when dependencies change
  useEffect(() => {
    if (
      selectedPage &&
      selectedAsset &&
      selectedAsset.type === "image" &&
      canvasRef.current
    ) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.src = selectedAsset.src;
      img.onload = () => {
        drawAsset(ctx, img);
      };
    }
  }, [selectedPage, selectedAsset, assetPosition, shadowPosition, assetSize, selectedAction]);

  const handleMouseDown = (e) => {
    if (selectedAction !== "drag" || !selectedAsset) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking original asset
    if (
      x >= assetPosition.x &&
      x <= assetPosition.x + assetSize.width &&
      y >= assetPosition.y &&
      y <= assetPosition.y + assetSize.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - assetPosition.x, y: y - assetPosition.y });
      setDraggingAsset("original");
    }
    // Check if clicking shadow asset
    else if (
      shadowPosition &&
      x >= shadowPosition.x &&
      x <= shadowPosition.x + assetSize.width &&
      y >= shadowPosition.y &&
      y <= shadowPosition.y + assetSize.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - shadowPosition.x, y: y - shadowPosition.y });
      setDraggingAsset("shadow");
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || selectedAction !== "drag") return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggingAsset === "original") {
      setAssetPosition({
        x: x - dragStart.x,
        y: y - dragStart.y,
      });
    } else if (draggingAsset === "shadow") {
      setShadowPosition({
        x: x - dragStart.x,
        y: y - dragStart.y,
      });
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
          height={650}
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