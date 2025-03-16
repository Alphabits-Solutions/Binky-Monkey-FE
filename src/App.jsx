import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ImageUpload from "./components/ImageUpload";
import Create from "./components/Create";
import Assignment from "./pages/Assignment";
import ClientRender from "./pages/ClientRender";
import GamePage from "./pages/GamePage";
import Auth from "./pages/Auth";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth/>}/>
        <Route path="/" element={<Dashboard />}>
          <Route path="/Image-upload" element={<ImageUpload />} />
          <Route path="/assignment" element={<Assignment />} />
          <Route path="/create" element={<Create />} />
          <Route path="/client" element={<ClientRender />} />
          <Route path="/game" element={<GamePage />} />
        </Route>
        <Route path="*" element={<Auth/>}/>
      </Routes>
    </Router>
  );
};

export default App;