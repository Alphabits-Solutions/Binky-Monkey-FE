import React, { useEffect, useState, useRef } from "react";
import { getAllAudios, uploadAudio } from "../../../services/api";

const AudioList = () => {
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAudios();
  }, []);

  const fetchAudios = async () => {
    try {
      setLoading(true);
      const response = await getAllAudios();
      console.log("API Response:", response);
      
      
      if (response && response.files && Array.isArray(response.files)) {
        setAudios(response.files);
        fetchAudios();
      } else {
        setAudios([]);
        console.error("Unexpected API response format:", response);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to fetch audios");
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
      const response = await uploadAudio(file);
      console.log("Upload response:", response);
      alert("Audio uploaded successfully!");
      await fetchAudios();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Audio upload failed!");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (loading) return <p>Loading audios...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="audio-list">
      <h2>Audio Files</h2>

      {/* Upload Button */}
      <div className="upload-section">
        <button onClick={handleUploadClick} disabled={uploading}>
          {uploading ? "Uploading..." : "+ Add Audio"}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          onChange={handleFileChange} 
          accept="audio/*" 
        />
      </div>

      
      <div style={{ margin: "10px 0", fontSize: "12px", color: "#666" }}>
        Total audios: {audios ? audios.length : 0}
      </div>

      
      {!audios || audios.length === 0 ? (
        <p>No audio files uploaded yet.</p>
      ) : (
        <div className="grid">
          {audios.map((audio, index) => (
            <div key={audio._id || index} className="audio-card">
              <audio controls>
                <source src={audio.filePath} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
              <p>{audio.fileName || "Unnamed Audio"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioList;