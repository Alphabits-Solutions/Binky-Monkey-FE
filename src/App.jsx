import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ImageUpload from "./components/ImageUpload";
import ThreeDImage from "./components/ThreeDImage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route path="/Image-upload" element={<ImageUpload />} />
          <Route path="3d-image" element={<ThreeDImage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;