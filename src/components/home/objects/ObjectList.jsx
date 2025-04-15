import React, { useEffect, useState, useRef } from "react";
import { getAllObjects, uploadObject } from "../../../services/api";

const ObjectList = () => {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchObjects();
  }, []);

  const fetchObjects = async () => {
    try {
      setLoading(true);
      const response = await getAllObjects();
      console.log("API Response:", response);
      
      
      if (response && response.files && Array.isArray(response.files)) {
        setObjects(response.files);
        // fetchObjects();
      } else {
        setObjects([]);
        console.error("Unexpected API response format:", response);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to fetch objects");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);

    try {
      const response = await uploadObject(file);
      console.log("Upload response:", response);
      alert("Object uploaded successfully!");
      await fetchObjects();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Object upload failed!");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (loading) return <p>Loading objects...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    // <div className="audio-list">
    <div className="file-list">
      <h2>Object Files</h2>

      {/* Upload Button */}
      {/* <div className="upload-section">
        <button onClick={handleUploadClick} disabled={uploading}>
          {uploading ? "Uploading..." : "+ Add Object"}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          onChange={handleFileChange} 
          // accept="audio/*" 
        />
      </div> */}
      <div className="grid">
          <div className="add-media" onClick={handleUploadClick}>
          {uploading ? "Uploading..." : "+ Add Object"}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />

          {objects
            // .filter((file) => file.filePath?.match(/\.(jpeg|jpg|png|gif|webp)$/i))
            .map((object) => (
              <div key={object._id} className="file-card">
                <img src={object.filePath} alt={object.fileName} />
              </div>
            ))}
        </div>

      
      {/* <div style={{ margin: "10px 0", fontSize: "12px", color: "#666" }}>
        Total objects: {objects ? objects.length : 0}
      </div> */}

      
      {/* {!objects || objects.length === 0 ? (
        <p>No objects files uploaded yet.</p>
      ) : (
        <div className="grid">
          {objects
            // .filter((object) => object.filePath?.match(/\.(jpeg|jpg|png|gif|webp)$/i))
            .map((object) => (
              <div key={object._id} className="file-card">
                <img src={object.filePath} alt={object.fileName} />
              </div>
            ))}
        </div>
      )} */}
    </div>
  );
};

export default ObjectList;