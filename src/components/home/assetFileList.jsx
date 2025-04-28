import React, { useEffect, useState, useRef, useContext } from "react";
import { getAllAssets, uploadAsset, deleteAsset } from "../../services/api";
import { AppContext } from "../../context/AppContext.jsx";

const AssetFileList = () => {
  const { setSelectedAsset } = useContext(AppContext);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("images");
  const [uploading, setUploading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFiles();
  }, [refresh]);

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
      if (response.success) {
        setFiles((prevFiles) => [...prevFiles, response]);
        alert("File uploaded successfully!");
        setRefresh(!refresh);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed!");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (assetId) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;

    try {
      await deleteAsset(assetId);
      setFiles((prevFiles) => prevFiles.filter((file) => file._id !== assetId));
      alert("File deleted successfully!");
      setRefresh(!refresh); // Trigger refresh after delete
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete file!");
    }
  };

  const handleSelectAsset = (file) => {
    setSelectedAsset({
      id: file._id,
      src: file.filePath,
      name: file.fileName || "Asset",
      type: file.filePath.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image",
    });
  };

  if (loading) return <p>Loading files...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="file-list-section">
      <div className="file-list">
        <div className="tabs">
          <button
            className={activeTab === "images" ? "active" : ""}
            onClick={() => setActiveTab("images")}
          >
            Images
          </button>
          <button
            className={activeTab === "videos" ? "active" : ""}
            onClick={() => setActiveTab("videos")}
          >
            Videos
          </button>
        </div>

        {activeTab === "images" && (
          <div className="grid">
            <div className="add-media" onClick={handleAddMediaClick}>
              {uploading ? "Uploading..." : "+ Add Media"}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/*"
            />
            {files
              .filter(
                (file) =>
                  file.filePath &&
                  typeof file.filePath === "string" &&
                  file.filePath.match(/\.(jpeg|jpg|png|gif|webp)$/i)
              )
              .map((file) => (
                <div
                  key={file._id}
                  className="file-card"
                  style={{ position: "relative" }}
                  onClick={() => handleSelectAsset(file)}
                >
                  <img
                    src={file.filePath}
                    alt={file.fileName || "Uploaded image"}
                  />
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file._id);
                    }}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
          </div>
        )}

        {activeTab === "videos" && (
          <div className="grid">
            <div className="add-media" onClick={handleAddMediaClick}>
              {uploading ? "Uploading..." : "+ Add Media"}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="video/*"
            />
            {files
              .filter(
                (file) =>
                  file.filePath &&
                  typeof file.filePath === "string" &&
                  file.filePath.match(/\.(mp4|webm|ogg)$/i)
              )
              .map((file) => (
                <div
                  key={file._id}
                  className="file-card"
                  style={{ position: "relative" }}
                  onClick={() => handleSelectAsset(file)}
                >
                  <video width="100%" controls>
                    <source src={file.filePath} type="video/mp4" />
                  </video>
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file._id);
                    }}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetFileList;