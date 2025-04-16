import React, { useContext, useEffect, useRef, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import RightSidebar from "../components/RightSidebar";
import Slide from "../components/home/pages/pages";
import { AppContext } from "../context/AppContext";
import "../assets/sass/homescreen.scss";

const HomeDashboard = () => {
  const { activityId } = useParams();
  const {
    selectedPage,
    selectedAsset,
    selectedAction,
    assetPosition,
    setAssetPosition,
    assetSize,
  } = useContext(AppContext);
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const drawAsset = (ctx, img) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, assetPosition.x, assetPosition.y, assetSize.width, assetSize.height);
  };

  useEffect(() => {
    if (selectedPage && selectedAsset && selectedAsset.type === "image" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.src = selectedAsset.src;
      img.onload = () => {
        drawAsset(ctx, img);
      };
    }
  }, [selectedPage, selectedAsset, assetPosition, assetSize]);

  const handleMouseDown = (e) => {
    if (selectedAction !== "drag" || !selectedAsset) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
      x >= assetPosition.x &&
      x <= assetPosition.x + assetSize.width &&
      y >= assetPosition.y &&
      y <= assetPosition.y + assetSize.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - assetPosition.x, y: y - assetPosition.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || selectedAction !== "drag") return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setAssetPosition({
      x: x - dragStart.x,
      y: y - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="asset-manager">
      <div style={{ minWidth: "250px" }}>
        <Slide />
      </div>
      {selectedPage && (
        <div style={{ position: "relative", width: 1100, height: 800 }}>
          <canvas
            ref={canvasRef}
            id="asset-canvas"
            width={1100}
            height={800}
            style={{ border: "1px solid #ccc", background: "#fff" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          ></canvas>
          {selectedAsset && selectedAsset.type === "video" && (
            <video
              controls
              src={selectedAsset.src}
              style={{
                position: "absolute",
                left: `${assetPosition.x}px`,
                top: `${assetPosition.y}px`,
                width: `${assetSize.width}px`,
                height: `${assetSize.height}px`,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />
          )}
        </div>
      )}
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <RightSidebar />
    </div>
  );
};

export default HomeDashboard;