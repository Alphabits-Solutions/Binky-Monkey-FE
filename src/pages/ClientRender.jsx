import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from "@mui/material";
import axios from "axios";

import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const ClientRender = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const navigate = useNavigate();
  const [assignmentId, setAssignmentId] = useState("");

  const handleStartPresentation = () => {
    console.log("Start Presentation", selectedAssignments[0]);

    if (selectedAssignments) {
      socket.emit("start_presentation", selectedAssignments[0]);
      navigate("/game");
    }
  };
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/assignment");
      setAssignments(response.data.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const handleSelectAssignment = (assignmentId) => {
    setSelectedAssignments((prevSelected) => {
      if (prevSelected.includes(assignmentId)) {
        return prevSelected.filter((id) => id !== assignmentId);
      }
      return [...prevSelected, assignmentId];
    });
  };

  const handleStartGame = () => {
    const selectedAssignment = assignments.find(
      (a) => a._id === selectedAssignments[0]
    );

    if (selectedAssignment) {
      navigate("/game", {
        state: {
          assignment: selectedAssignment,
        },
      });
    }
  };

  return (
    <Container>
      <h2>Assignments List</h2>

      <TableContainer component={Paper} style={{ marginTop: "16px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Created Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No assignments found
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment._id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedAssignments.includes(assignment._id)}
                      onChange={() => handleSelectAssignment(assignment._id)}
                    />
                  </TableCell>
                  <TableCell>{assignment.name}</TableCell>
                  <TableCell>
                    {new Date(assignment.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        variant="contained"
        color="primary"
        disabled={selectedAssignments.length === 0}
        // onClick={handleStartGame}
        onClick={handleStartPresentation}
        style={{ marginTop: "16px" }}
      >
        Start Presentation
      </Button>
    </Container>
  );
};

export default ClientRender;
