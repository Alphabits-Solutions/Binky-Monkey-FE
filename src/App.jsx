import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import ImageUpload from "./components/ImageUpload";
// import Create from "./components/Create";
// import Assignment from "./pages/Assignment";
// import ClientRender from "./pages/ClientRender";
// import GamePage from "./pages/GamePage";
// import Auth from "./pages/Auth";
import HomeScreen from "./pages/HomeScreen";
import Pages from "./components/home/pages/pages";
import Layers from "./components/home/layer/layer";
import Asset from "./components/home/assets/assets";
import Audio from "./components/home/audio/Audio";
import Object from "./components/home/objects/objects";
import More from "./components/home/more/more";
import HomeDashboard from "./pages/HomeDashboard";
import { AppProvider } from "./context/AppContext";

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* <Route path="/auth" element={<Auth/>}/> */}
          <Route path="/" element={<HomeScreen />} />

          <Route path="/" element={<HomeDashboard />}>
            <Route path="/pages" element={<Pages />} />
            <Route path="/layer" element={<Layers />} />
            <Route path="/asset" element={<Asset />} />
            <Route path="/audio" element={<Audio />} />
            <Route path="object" element={<Object />} />
            <Route path="more" element={<More />} />
          </Route>
          {/* <Route path="/" element={<Dashboard />} >
          <Route path="/Image-upload" element={<ImageUpload />} />
          <Route path="/assignment" element={<Assignment />} />
          <Route path="/create" element={<Create />} />
          <Route path="/client" element={<ClientRender />} />
          <Route path="/game" element={<GamePage />} />
        </Route> */}
          {/* <Route path="*" element={<Auth/>}/> */}
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;