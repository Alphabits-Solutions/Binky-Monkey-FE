import React, { useEffect, useState, useRef, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { message } from "antd";

const ShapeEditor = () => {
  const {
    selectedAsset,
    selectedAction,
    assetPosition,
    setAssetPosition,
    assetSize,
    setAssetSize
  } = useContext(AppContext);
  
  const [shapes, setShapes] = useState([]);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [fillColor, setFillColor] = useState("#861E00");
  const [recentColors, setRecentColors] = useState(["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"]);
  
  const canvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  
  // Unique ID generator for shapes
  const generateId = () => `shape_${Math.random().toString(36).substr(2, 9)}`;
  
  useEffect(() => {
    // Initialize canvas with grid
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    drawGrid(ctx);
  }, []);
  
  useEffect(() => {
    // Add shape when a new asset is selected (from drag or click)
    if (selectedAsset && selectedAsset.type === "svg") {
      // Check if we need to add a new shape
      const shapeExists = shapes.some(s => s.assetId === selectedAsset.id);
      
      if (!shapeExists) {
        // Create a new shape based on the selected asset
        const newShape = {
          id: generateId(),
          assetId: selectedAsset.id,
          src: selectedAsset.src,
          name: selectedAsset.name,
          position: { x: 100, y: 100 },
          size: { width: 100, height: 100 },
          rotation: 0,
          fillColor: fillColor,
          zIndex: shapes.length
        };
        
        setShapes([...shapes, newShape]);
        setSelectedShapeId(newShape.id);
        
        // Set context values for sidebar controls
        setAssetPosition(newShape.position);
        setAssetSize(newShape.size);
      }
    }
  }, [selectedAsset]);
  
  useEffect(() => {
    // Redraw all shapes when the shapes array changes
    if (shapes.length > 0) {
      renderShapes();
    }
  }, [shapes, selectedShapeId]);
  
  useEffect(() => {
    // Update shape position when position changes from sidebar
    if (selectedShapeId) {
      updateShapeProperty(selectedShapeId, "position", assetPosition);
    }
  }, [assetPosition]);
  
  useEffect(() => {
    // Update shape size when size changes from sidebar
    if (selectedShapeId) {
      updateShapeProperty(selectedShapeId, "size", assetSize);
    }
  }, [assetSize]);
  
  const drawGrid = (ctx) => {
    const { width, height } = ctx.canvas;
    const gridSize = 20;
    
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#EEEEEE";
    ctx.lineWidth = 0.5;
    
    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };
  
  const renderShapes = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Clear canvas and redraw grid
    drawGrid(ctx);
    
    // Sort shapes by z-index
    const sortedShapes = [...shapes].sort((a, b) => a.zIndex - b.zIndex);
    
    // Draw each shape
    sortedShapes.forEach(shape => {
      // Create a new image element for the SVG
      const img = new Image();
      img.src = shape.src;
      
      img.onload = () => {
        ctx.save();
        
        // Set transform for this shape
        ctx.translate(shape.position.x + shape.size.width / 2, shape.position.y + shape.size.height / 2);
        ctx.rotate((shape.rotation * Math.PI) / 180);
        
        // Draw shape with specified fill color
        if (shape.fillColor) {
          // For SVGs, we need to create a colored version temporarily
          // This is a simplified approach - for production, consider using SVG DOM manipulation
          ctx.fillStyle = shape.fillColor;
          ctx.fillRect(-shape.size.width / 2, -shape.size.height / 2, shape.size.width, shape.size.height);
        }
        
        // Draw the SVG
        ctx.drawImage(
          img, 
          -shape.size.width / 2, 
          -shape.size.height / 2,
          shape.size.width,
          shape.size.height
        );
        
        // Draw selection border if this shape is selected
        if (shape.id === selectedShapeId) {
          ctx.strokeStyle = "#0099FF";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            -shape.size.width / 2 - 2,
            -shape.size.height / 2 - 2,
            shape.size.width + 4,
            shape.size.height + 4
          );
          
          // Draw resize handles
          ctx.fillStyle = "#0099FF";
          const handleSize = 8;
          
          // Corner handles
          ctx.fillRect(-shape.size.width / 2 - handleSize / 2, -shape.size.height / 2 - handleSize / 2, handleSize, handleSize);
          ctx.fillRect(shape.size.width / 2 - handleSize / 2, -shape.size.height / 2 - handleSize / 2, handleSize, handleSize);
          ctx.fillRect(-shape.size.width / 2 - handleSize / 2, shape.size.height / 2 - handleSize / 2, handleSize, handleSize);
          ctx.fillRect(shape.size.width / 2 - handleSize / 2, shape.size.height / 2 - handleSize / 2, handleSize, handleSize);
        }
        
        ctx.restore();
      };
    });
  };
  
  const updateShapeProperty = (shapeId, property, value) => {
    setShapes(shapes.map(shape => 
      shape.id === shapeId 
        ? { ...shape, [property]: value }
        : shape
    ));
  };
  
  const findShapeAtPosition = (x, y) => {
    // Search in reverse order (top to bottom in terms of z-index)
    const sortedShapes = [...shapes].sort((a, b) => b.zIndex - a.zIndex);
    
    for (const shape of sortedShapes) {
      // Simple bounding box check
      if (
        x >= shape.position.x &&
        x <= shape.position.x + shape.size.width &&
        y >= shape.position.y &&
        y <= shape.position.y + shape.size.height
      ) {
        return shape;
      }
    }
    
    return null;
  };
  
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const shape = findShapeAtPosition(x, y);
    
    if (shape) {
      setSelectedShapeId(shape.id);
      setAssetPosition(shape.position);
      setAssetSize(shape.size);
      
      if (selectedAction === "drag") {
        isDraggingRef.current = true;
        startPosRef.current = {
          x: x - shape.position.x,
          y: y - shape.position.y
        };
      } else if (selectedAction === "colorfill") {
        // Apply selected fill color to shape
        const newFillColor = fillColor;
        updateShapeProperty(shape.id, "fillColor", newFillColor);
        
        // Add to recent colors if not already there
        if (!recentColors.includes(newFillColor)) {
          setRecentColors([newFillColor, ...recentColors.slice(0, 4)]);
        }
        
        message.success(`Color applied: ${newFillColor}`);
      }
    } else {
      setSelectedShapeId(null);
    }
  };
  
  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !selectedShapeId) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPosition = {
      x: x - startPosRef.current.x,
      y: y - startPosRef.current.y
    };
    
    // Update position in state and context
    setAssetPosition(newPosition);
  };
  
  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      
      if (data.type === "svg") {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create a new shape at the drop position
        const newShape = {
          id: generateId(),
          assetId: data.id,
          src: data.src,
          name: data.name,
          position: { x, y },
          size: { width: 100, height: 100 },
          rotation: 0,
          fillColor: fillColor,
          zIndex: shapes.length
        };
        
        setShapes([...shapes, newShape]);
        setSelectedShapeId(newShape.id);
        setAssetPosition(newShape.position);
        setAssetSize(newShape.size);
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const deleteSelectedShape = () => {
    if (selectedShapeId) {
      setShapes(shapes.filter(shape => shape.id !== selectedShapeId));
      setSelectedShapeId(null);
    }
  };
  
  const bringToFront = () => {
    if (selectedShapeId) {
      setShapes(shapes.map(shape => ({
        ...shape,
        zIndex: shape.id === selectedShapeId ? shapes.length : shape.zIndex
      })));
    }
  };
  
  const sendToBack = () => {
    if (selectedShapeId) {
      setShapes(shapes.map((shape, index) => ({
        ...shape,
        zIndex: shape.id === selectedShapeId ? 0 : shape.zIndex + 1
      })));
    }
  };
  
  return (
    <div className="shape-editor">
      <div className="canvas-controls">
        <button onClick={deleteSelectedShape} disabled={!selectedShapeId}>
          Delete Shape
        </button>
        <button onClick={bringToFront} disabled={!selectedShapeId}>
          Bring to Front
        </button>
        <button onClick={sendToBack} disabled={!selectedShapeId}>
          Send to Back
        </button>
      </div>
      
      <div 
        className="canvas-container" 
        onDrop={handleDrop} 
        onDragOver={handleDragOver}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      
      <div className="recent-colors">
        <h4>Recent Colors</h4>
        <div className="color-swatches">
          {recentColors.map((color, index) => (
            <div 
              key={index}
              className="color-swatch"
              style={{ backgroundColor: color }}
              onClick={() => setFillColor(color)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShapeEditor;