// src/context/AppContext.js
import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageName, setPageName] = useState("");
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetPosition, setAssetPosition] = useState({ x: 50, y: 50 });
  const [assetSize, setAssetSize] = useState({ width: 100, height: 100 });
  const [selectedTab, setSelectedTab]= useState('1');
  const [shadowPosition, setShadowPosition] = useState(null);
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [layerProperties, setLayerProperties] = useState({
    color: [],
    size: ["100px", "100px"],
    positionOrigin: { x: 0, y: 0 },
    positionDestination: { x: 50, y: 50 },
    bearer: 0,
    imgUrl: "",
    audioUrl: "",
    rotationAngle: 0,
  }); 
  

  return (
    <AppContext.Provider
      value={{
        selectedTab,
        setSelectedTab,
        selectedPage,
        setSelectedPage,
        pageName,
        setPageName,
        selectedAction,
        setSelectedAction,
        selectedAsset,
        setSelectedAsset,
        assetPosition,
        setAssetPosition,
        shadowPosition,
        setShadowPosition,
        assetSize,
        setAssetSize,
        selectedActivity,
        setSelectedActivity,
        selectedSlideId, 
        setSelectedSlideId,
        layers,
        setLayers,
        selectedLayer,
        setSelectedLayer,
        layerProperties,
        setLayerProperties,
      }}
    >
      {children}
      </AppContext.Provider>
  );
};