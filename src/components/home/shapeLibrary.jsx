// src/components/home/shapeLibrary.jsx
import React, { useContext, useEffect, useState, useRef } from "react";
import { getAllObjects, uploadObject, deleteObject } from "../../services/api";
import { AppContext } from "../../context/AppContext.jsx";
import { SHAPES } from '../../constants';
import { createModelThumbnail } from '../threeDUtils';

const ShapeLibrary = () => {
  const { setSelectedAsset, setLayerProperties, selectedPage, draggedShapeRef, draggedModelRef } = useContext(AppContext);
  const [shapes, setShapes] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState("shapes");
  const fileInputRef = useRef(null);
  const modelInputRef = useRef(null);

  useEffect(() => {
    fetchShapesAndModels();
  }, [refresh]);

  const fetchShapesAndModels = async () => {
    try {
      setLoading(true);
      // First add predefined shapes
      let allShapes = [...SHAPES];
      let allModels = [];
      
      // Then fetch from API
      const response = await getAllObjects();
      
      if (response && response.success && Array.isArray(response.files)) {
        // Filter SVG files for shapes
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
        
        // Filter gLTF/GLB files for 3D models
        const apiModels = response.files
          .filter(file => 
            file && 
            file.fileName && 
            typeof file.fileName === 'string' && 
            (file.fileName.toLowerCase().endsWith('.gltf') || 
             file.fileName.toLowerCase().endsWith('.glb'))
          )
          .map(file => ({
            _id: file._id,
            fileName: file.fileName,
            filePath: file.filePath,
            thumbnail: null, // Will be generated
            type: "model3d"
          }));
        
        // Generate thumbnails for 3D models
        for (const model of apiModels) {
          try {
            model.thumbnail = await createModelThumbnail(model.filePath);
          } catch (error) {
            console.error(`Failed to generate thumbnail for ${model.fileName}:`, error);
            // Use a placeholder instead
            model.thumbnail = '/placeholder.png';
          }
        }
        
        // Add API shapes and models to our arrays
        allShapes = [...allShapes, ...apiShapes];
        allModels = [...allModels, ...apiModels];
      }
      
      setShapes(allShapes);
      setModels(allModels);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch objects", error);
      setError("Failed to load objects. Please try again.");
      // Still show predefined shapes
      setShapes(SHAPES);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShapeClick = () => {
    fileInputRef.current.click();
  };

  const handleAddModelClick = () => {
    modelInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const isModelFile = file.name.toLowerCase().endsWith('.gltf') || 
                        file.name.toLowerCase().endsWith('.glb');
    const isSvgFile = file.type === 'image/svg+xml';
    
    if (!isModelFile && !isSvgFile) {
      setError('Please upload a valid SVG, GLTF, or GLB file');
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
      setError(`Failed to upload ${isModelFile ? '3D model' : 'shape'}.`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (modelInputRef.current) {
        modelInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (objectId) => {
    if (!window.confirm("Are you sure you want to delete this object?")) return;

    try {
      await deleteObject(objectId);
      setShapes((prevShapes) => prevShapes.filter((shape) => shape._id !== objectId));
      setModels((prevModels) => prevModels.filter((model) => model._id !== objectId));
      setError(null);
      setRefresh(!refresh);
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete object.");
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

  const handleModelDragStart = (model, e) => {
    if (!selectedPage) {
      alert("Please select a page before selecting a 3D model.");
      return;
    }
    
    // Store the model reference for when it's dropped
    draggedModelRef.current = model.filePath;
  };

  if (loading) return <p>Loading objects...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="file-list-section">
      <div className="file-list">
        <div className="header">
          <h2>Objects</h2>
          <div className="tabs">
            <button
              className={activeTab === "shapes" ? "active" : ""}
              onClick={() => setActiveTab("shapes")}
            >
              Shapes
            </button>
            <button
              className={activeTab === "models" ? "active" : ""}
              onClick={() => setActiveTab("models")}
            >
              3D Models
            </button>
          </div>
        </div>

        {activeTab === "shapes" && (
          <>
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
                        fontSize: "8px"
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "models" && (
          <>
            <div className="add-media" onClick={handleAddModelClick}>
              {uploading ? "Uploading..." : "+ Add 3D Model"}
            </div>
            <input
              type="file"
              ref={modelInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept=".gltf,.glb"
            />
            <div className="grid">
              {models.map((model) => (
                <div
                  key={model._id}
                  className="file-card"
                  style={{ position: "relative" }}
                  draggable
                  onDragStart={(e) => handleModelDragStart(model, e)}
                >
                  {/* 3D Model Preview */}
                  <div className="model-thumbnail">
                    <img
                      src={model.thumbnail || "/placeholder.png"}
                      alt={model.fileName || "3D Model"}
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "contain",
                        border: "1px solid #ddd",
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                  <p>{model.fileName}</p>
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(model._id);
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
                      fontSize: "8px"
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {models.length === 0 && (
                <div className="empty-models">
                  <p>No 3D models available. Upload a GLTF or GLB file to get started.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShapeLibrary;