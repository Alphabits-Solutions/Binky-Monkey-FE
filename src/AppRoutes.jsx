import React from "react";
import { Routes, Route } from "react-router-dom";
import Auth from "../src/pages/Auth";
import AppLayout from "../src/AppLayout";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<AppLayout />} />
    </Routes>
  );
};

export default AppRoutes;