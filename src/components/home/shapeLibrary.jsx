// src/components/home/shapeLibrary.jsx
import React, { useContext, useEffect, useState, useRef } from "react";
import { getAllObjects, uploadObject, deleteObject } from "../../services/api";
import { AppContext } from "../../context/AppContext.jsx";
import { SHAPES } from '../../constants';

const ShapeLibrary = () => {
  const { setSelectedAsset, setLayerProperties, selectedPage, draggedShapeRef } = useContext(AppContext);
  const [shapes, setShapes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchShapes();
  }, [refresh]);

  const fetchShapes = async () => {
    try {
      setLoading(true);
      // First add predefined shapes
      let allShapes = [...SHAPES];
      
      // Then fetch from API
      const response = await getAllObjects();
      
      if (response && response.success && Array.isArray(response.files)) {
        // Filter only SVG files
        const apiShapes = response.files
          .filter(file => 
            file && 
            file.fileName && 
            typeof file.fileName === 'string' && 
            file.fileName.toLowerCase().endsWith('.svg')
          )
          .map(file => ({
            _id: file._id,
            fileName: file.fileName.replace('.svg', ''),
            filePath: file.filePath,
            type: "svg"
          }));
        
        // Add API shapes to our shapes array
        allShapes = [...allShapes, ...apiShapes];
      }
      
      setShapes(allShapes);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch shapes", error);
      setError("Failed to load shapes. Please try again.");
      // Still show predefined shapes
      setShapes(SHAPES);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShapeClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file is SVG
    if (file.type !== 'image/svg+xml') {
      setError('Please upload a valid SVG file');
      return;
    }

    setUploading(true);
    try {
      const response = await uploadObject(file);
      if (response.success) {
        setRefresh(!refresh);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload shape.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (shapeId) => {
    if (!window.confirm("Are you sure you want to delete this shape?")) return;

    try {
      await deleteObject(shapeId);
      setShapes((prevShapes) => prevShapes.filter((shape) => shape._id !== shapeId));
      setError(null);
      setRefresh(!refresh);
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete shape.");
    }
  };

  const handleShapeDragStart = (shape, e) => {
    if (!selectedPage) {
      alert("Please select a page before selecting a shape.");
      return;
    }
    
    // Store the shape reference for when it's dropped
    if (shape.svg) {
      // For predefined shapes with SVG content
      let svgContent = shape.svg;
      if (!svgContent.includes('<svg')) {
        svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${svgContent}</svg>`;
      }
      draggedShapeRef.current = svgContent;
    } else {
      // For shapes from API with URL
      draggedShapeRef.current = shape.filePath;
    }
  };

  if (loading) return <p>Loading shapes...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="file-list-section">
      <div className="file-list">
        <div className="add-media" onClick={handleAddShapeClick}>
          {uploading ? "Uploading..." : "+ Add Shape"}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept=".svg"
        />
        <div className="grid">
          {shapes.map((shape) => (
            <div
              key={shape._id || shape.id}
              className="file-card"
              style={{ position: "relative" }}
              draggable
              onDragStart={(e) => handleShapeDragStart(shape, e)}
            >
              {/* SVG Preview */}
              {shape.svg ? (
                // For predefined shapes
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: shape.svg.includes('<svg') 
                      ? shape.svg 
                      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${shape.svg}</svg>` 
                  }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                // For API shapes
                <img
                  src={shape.filePath}
                  alt={shape.fileName || "Uploaded shape"}
                  style={{ width: "100%", height: "100%" }}
                />
              )}
              <p>{shape.name || shape.fileName}</p>
              {shape._id && (
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(shape._id);
                  }}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "5px 5px",
                    cursor: "pointer",
                    fontSize: "8px",
                    display: "none",
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShapeLibrary;