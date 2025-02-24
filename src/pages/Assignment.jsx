import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardMedia,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";

const AssignmentPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [open, setOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
    fetchUploadedImages();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/assignment");
      setAssignments(response.data.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const fetchUploadedImages = async () => {
    try {
      const response = await axios.get("http://localhost:5000/upload");
      setUploadedImages(response.data);
    } catch (error) {
      console.error("Error fetching uploaded images:", error);
    }
  };

  const handleDelete = async (assignmentId) => {
    try {
      await axios.delete(`http://localhost:5000/assignment/${assignmentId}`);
      fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleImageSelect = (image) => {
    if (selectedImages.includes(image.filePath)) {
      setSelectedImages(selectedImages.filter((img) => img !== image.filePath));
    } else {
      setSelectedImages([...selectedImages, image.filePath]);
    }
  };

  const handleProceed = () => {
    navigate("/create", { state: { selectedImages } });
  };

  return (
    <Container>
      <h2>Assignments</h2>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        style={{ marginBottom: "16px" }}
      >
        Create Assignment
      </Button>

      <TableContainer component={Paper} style={{ marginTop: "16px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No assignments found
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment._id}>
                  <TableCell>{assignment._id}</TableCell>
                  <TableCell>{assignment.name}</TableCell>
                  <TableCell>
                    {new Date(assignment.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete(assignment._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Image Selection Popup */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Select Images</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {uploadedImages.map((image) => (
              <Grid item key={image._id} xs={6} sm={4} md={3}>
                <Card
                  onClick={() => handleImageSelect(image)}
                  style={{
                    border: selectedImages.includes(image.filePath)
                      ? "3px solid blue"
                      : "1px solid gray",
                    cursor: "pointer",
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={image.filePath}
                    alt={image.fileName}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            color="primary"
            disabled={selectedImages.length === 0}
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssignmentPage;
