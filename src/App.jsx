import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ImageUpload from "./components/ImageUpload";
import Create from "./components/Create";
import Assignment from "./pages/Assignment";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route path="/Image-upload" element={<ImageUpload />} />
          <Route path="/assignment" element={<Assignment />} />
          <Route path="/create" element={<Create />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;