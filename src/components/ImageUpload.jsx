import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Typography, CircularProgress, Grid, Container } from "@mui/material";

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);

  // Fetch all uploaded images on component mount
  useEffect(() => {
    fetchUploadedImages();
  }, []);

  const fetchUploadedImages = async () => {
    try {
      const response = await axios.get("http://localhost:5000/upload");
      setUploadedImages(response.data);
    } catch (error) {
      console.error("Error fetching uploaded images:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFileUrl(response.data.fileUrl);
      alert("File uploaded successfully!");
      // Refresh the list of uploaded images
      fetchUploadedImages();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/upload/${id}`);
      alert("File deleted successfully!");
      // Refresh the list of uploaded images
      fetchUploadedImages();
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file.");
    }
  };

  return (
    <Container style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        Upload your image
      </Typography>

      {/* Upload Section */}
      <div style={{ marginBottom: 20 }}>
        <input type="file" onChange={handleFileChange} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={uploading}
          style={{ marginTop: 10 }}
        >
          {uploading ? <CircularProgress size={24} /> : "Upload"}
        </Button>
      </div>

      {/* Display Uploaded Images in Grid */}
      <Typography variant="h5" gutterBottom>
        Uploaded Images
      </Typography>
      <Grid container spacing={2}>
        {uploadedImages.map((image) => (
          <Grid item key={image._id} xs={12} sm={6} md={4} lg={3}>
            <div style={{ border: "1px solid #ddd", padding: 10, borderRadius: 5 }}>
              <img
                src={image.filePath}
                alt={image.fileName}
                style={{ width: "100%", height: "auto", borderRadius: 5 }}
              />
              <Typography variant="body2" style={{ marginTop: 10 }}>
                {image.fileName}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDelete(image._id)}
                style={{ marginTop: 10, width: "100%" }}
              >
                Delete
              </Button>
            </div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ImageUpload;