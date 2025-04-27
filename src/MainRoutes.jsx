import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../src/components/PrivateRoute";
import Auth from "../src/pages/Auth";
import ActivitySection from "../src/components/home/ActivitySection";
// import HomeDashboard from "../src/pages/HomeDashboard";
import Game from "../src/pages/Game";
import Audio from "../src/components/home/audio/Audio";
import Object from "../src/components/home/objects/objects";
import More from "../src/components/home/more/more";

const MainRoutes = () => (
  <Routes>
    {/* Public Route */}
    <Route path="/auth" element={<Auth />} />
    
    {/* Protected routes */}
    <Route
      path="/"
      element={
        <PrivateRoute>
          <ActivitySection />
        </PrivateRoute>
      }
    />
    
    <Route
      path="/activity/:activityId"
      element={
        <PrivateRoute>
          <Game />
        </PrivateRoute>
      }
    >
      {/* <Route path="game" element={<Game />} /> */}
      <Route path="audio" element={<Audio />} />
      <Route path="object" element={<Object />} />
      <Route path="more" element={<More />} />
      <Route path="*" element={<Navigate to="/auth" />} />
    </Route>
  </Routes>
);

export default MainRoutes;