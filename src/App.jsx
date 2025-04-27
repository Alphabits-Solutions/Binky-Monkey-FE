import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AppProvider } from "../src/context/AppContext";
import AppRoutes from "../src/AppRoutes";
import "./assets/sass/homescreen.scss";

const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;