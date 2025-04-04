import React, { useEffect, useState, useRef } from "react";
import { getAllAssets, uploadAsset } from "../../../services/api";


const FileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("images");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null); 

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const assets = await getAllAssets();
      setFiles(assets || []);
    } catch (error) {
      setError("Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  
  const handleAddMediaClick = () => {
    fileInputRef.current.click();
  };

  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAsset(file);
      alert("File uploaded successfully!");
      setFiles((prevFiles) => [...prevFiles, response]); 
    } catch (error) {
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>Loading files...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="file-list">
      
      <div className="tabs">
        <button className={activeTab === "images" ? "active" : ""} onClick={() => setActiveTab("images")}>
          Images
        </button>
        <button className={activeTab === "videos" ? "active" : ""} onClick={() => setActiveTab("videos")}>
          Videos
        </button>
      </div>

      
      {activeTab === "images" && (
        <div className="grid">
          <div className="add-media" onClick={handleAddMediaClick}>
            {uploading ? "Uploading..." : "+ Add Media"}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />

          {files
            .filter((file) => file.filePath.match(/\.(jpeg|jpg|png|gif|webp)$/i))
            .map((file) => (
              <div key={file._id} className="file-card">
                <img src={file.filePath} alt={file.fileName} />
              </div>
            ))}
        </div>
      )}

      
      {activeTab === "videos" && (
        <div className="grid">
          <div className="add-media" onClick={handleAddMediaClick}>
            {uploading ? "Uploading..." : "+ Add Media"}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />

          {files
            .filter((file) => file.filePath.match(/\.(mp4|webm|ogg)$/i))
            .map((file) => (
              <div key={file._id} className="file-card">
                <video controls>
                  <source src={file.filePath} type="video/mp4" />
                </video>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default FileList;
