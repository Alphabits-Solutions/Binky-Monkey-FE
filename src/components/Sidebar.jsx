import React from "react";
import { Link } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

const Sidebar = () => {
  return (
    <div style={{ width: 250, backgroundColor: "#f5f5f5", height: "100vh" }}>
      <List>
        <ListItem button component={Link} to="/Image-upload">
          <ListItemText primary="Image Upload" />
        </ListItem>
        <ListItem button component={Link} to="/assignment">
          <ListItemText primary="Assignment" />
        </ListItem>
      </List>
    </div>
  );
};

export default Sidebar;