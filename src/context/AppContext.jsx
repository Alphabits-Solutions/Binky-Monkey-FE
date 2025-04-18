// src/context/AppContext.js
import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetPosition, setAssetPosition] = useState({ x: 50, y: 50 });
  const [assetSize, setAssetSize] = useState({ width: 100, height: 100 });

  return (
    <AppContext.Provider
      value={{
        selectedPage,
        setSelectedPage,
        selectedAction,
        setSelectedAction,
        selectedAsset,
        setSelectedAsset,
        assetPosition,
        setAssetPosition,
        assetSize,
        setAssetSize,
        selectedActivity,
        setSelectedActivity
      }}
    >
      {children}
      </AppContext.Provider>
  );
};