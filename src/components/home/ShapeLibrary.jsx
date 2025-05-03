// ShapeLibrary.jsx
import React, { useState, useEffect, useContext } from 'react';
import { uploadObject, getAllObjects } from '../../services/api';
import { AppContext } from '../../context/AppContext';
import { SHAPES } from './constants'; // Import predefined shapes

const ShapeLibrary = () => {
  // Define sidebar width
  const sidebarWidth = "250px";
  
  // State for component
  const [shapes, setShapes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  
  // Get context values and functions
  const { 
    draggedShapeRef
  } = useContext(AppContext);

  // Fetch all shapes on component mount
  useEffect(() => {
    fetchShapes();
  }, []);

  // Function to fetch shapes from API
  const fetchShapes = async () => {
    setIsLoading(true);
    try {
      // Get all objects from the API
      const response = await getAllObjects();
      
      // Create a shapes array starting with predefined shapes
      let allShapes = [...SHAPES];
      
      // The API returns a structure with a files array
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
            id: file._id,
            name: file.fileName.replace('.svg', ''),
            url: file.filePath,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>`,
            fromApi: true
          }));
        
        // Add API shapes to our shapes array
        allShapes = [...allShapes, ...apiShapes];
        
        setShapes(allShapes);
        setError(null);
      } else {
        // Even if API fails, still show predefined shapes
        setShapes(SHAPES);
        setError('Could not load additional shapes from server');
      }
    } catch (err) {
      // Even if API fails, still show predefined shapes
      setShapes(SHAPES);
      setError('Failed to load shapes from server');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file is SVG
    if (file.type !== 'image/svg+xml') {
      setError('Please upload a valid SVG file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload the SVG using the API
      const result = await uploadObject(file);
      
      if (result && result.success) {
        const fileData = result.file || {};
        
        // Add the new shape to the list
        setShapes(prevShapes => [
          ...prevShapes,
          {
            id: fileData._id || `upload-${Date.now()}`,
            name: file.name.replace('.svg', ''),
            url: fileData.filePath || '',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>`,
            fromApi: true
          }
        ]);
      } else {
        setError('Upload failed');
      }
      
      // Reset the input
      e.target.value = '';
    } catch (err) {
      setError('Failed to upload SVG');
    } finally {
      setUploading(false);
    }
  };

  // Handle shape drag start 
  const handleShapeDragStart = (shape, e) => {
    // For predefined shapes, store the svg content directly
    if (!shape.fromApi) {
      let svgContent = shape.svg;
      if (!svgContent.includes('xmlns')) {
        svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${svgContent}</svg>`;
      } else if (!svgContent.startsWith('<svg')) {
        svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${svgContent}</svg>`;
      }
      draggedShapeRef.current = svgContent;
    } else {
      // For API shapes, store the URL
      draggedShapeRef.current = shape.url;
    }
  };

  // Handle deletion of shape
  const handleDeleteShape = (shapeId) => {
    setShapes(prevShapes => prevShapes.filter(shape => shape.id !== shapeId));
    setActiveMenu(null);
  };

  // Toggle menu visibility
  const toggleMenu = (shapeId) => {
    setActiveMenu(activeMenu === shapeId ? null : shapeId);
  };

  // Filter shapes based on search term
  const filteredShapes = shapes.filter(shape => 
    shape.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Styles
  const sidebarStyle = {
    width: sidebarWidth,
    padding: '15px',
    borderRight: '1px solid #eee',
    overflow: 'auto',
    height: '100%',
    background:"#FFFFFF"
  };
  
  const titleStyle = {
    fontSize: '18px',
    marginBottom: '15px',
    fontWeight: 'normal'
  };
  
  const buttonStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px'
  };
  
  const addButtonStyle = {
    backgroundColor: '#e67e22',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px'
  };
  
  const gridItemStyle = {
    // backgroundColor: '#f5f5f5',
    // padding: '10px',
    // borderRadius: '4px',
    // marginBottom: '10px'
  };
  
  const totalShapesStyle = {
    fontSize: '14px',
    color: '#555',
    marginBottom: '15px'
  };

  return (
    <div style={sidebarStyle}>
      <h2 style={titleStyle}>Object Library</h2>
      
      {/* Upload Button */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="svg-upload" style={addButtonStyle}>
          + Add Shape
        </label>
        <input 
          id="svg-upload" 
          type="file" 
          accept=".svg"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          disabled={uploading}
        />
        {error && <div style={{ color: 'red', marginTop: '5px', fontSize: '12px' }}>{error}</div>}
      </div>
      
      {/* Total shapes count */}
      <div style={totalShapesStyle}>
        Total shapes: {filteredShapes.length}
      </div>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search shapes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '8px', 
            border: '1px solid #ddd',
            borderRadius: '4px' 
          }}
        />
      </div>

      {/* Shapes Grid */}
      {isLoading ? (
        <div>Loading shapes...</div>
      ) : (
        <div>
          {filteredShapes.map((shape) => (
            <div
              key={shape.id}
              style={gridItemStyle}
              draggable
              onDragStart={(e) => handleShapeDragStart(shape, e)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {/* <span>{shape.name}</span> */}
                </div>
                
                {/* Menu dots */}
                <div style={{ position: 'relative' }}>
                  <div 
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleMenu(shape.id)}
                  >
                    ⋮
                  </div>
                  
                  {/* Dropdown menu */}
                  {activeMenu === shape.id && (
                    <div style={{ 
                      position: 'absolute', 
                      right: 0, 
                      top: '20px', 
                      backgroundColor: 'white', 
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)', 
                      borderRadius: '4px',
                      zIndex: 10
                    }}>
                      <div 
                        style={{ 
                          padding: '8px 16px', 
                          color: '#e74c3c', 
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                        onClick={() => handleDeleteShape(shape.id)}
                      >
                        Delete
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SVG Display */}
              <div style={{ 
                height: '80px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                margin: '10px 0',
                backgroundColor: '#fff',
                border: '1px dashed #ddd',
                borderRadius: '4px'
              }}>
                {shape.fromApi ? (
                  <img 
                    src={shape.url} 
                    alt={shape.name}
                    style={{ maxHeight: '70px', maxWidth: '90%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="70" height="70">
                        <rect width="100" height="100" fill="#f0f0f0" />
                        <text x="50%" y="50%" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="#666">SVG</text>
                      </svg>`;
                    }}
                  />
                ) : (
                  <div style={{ width: '70px', height: '70px' }}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 100 100"
                      width="70"
                      height="70"
                      dangerouslySetInnerHTML={{ __html: shape.svg }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Refresh button - hidden by default based on reference design */}
      {false && (
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <button 
            onClick={fetchShapes} 
            style={{
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer'
            }}
          >
            Refresh Shapes
          </button>
        </div>
      )}
    </div>
  );
};

export default ShapeLibrary;