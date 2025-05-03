import React, { createContext, useState, useEffect, useCallback } from "react";
import { getAllPages, getAllLayers } from "../services/api";

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
  const [selectedTab, setSelectedTab] = useState('1');
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
  const [slides, setSlides] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(-1);

  const loadPages = useCallback(async () => {
    if (!selectedActivity) return;
    try {
      const result = await getAllPages(selectedActivity);
      const fetchedSlides = Array.isArray(result) ? result : [];
      setSlides(fetchedSlides);
      if (selectedSlideId) {
        const index = fetchedSlides.findIndex(slide => slide._id === selectedSlideId);
        setCurrentPageIndex(index !== -1 ? index : 0);
      } else if (fetchedSlides.length > 0) {
        setCurrentPageIndex(0);
        setSelectedPage(fetchedSlides[0]._id);
        setSelectedSlideId(fetchedSlides[0]._id);
        setPageName(fetchedSlides[0].title);
      }
    } catch (error) {
      console.error("Failed to load pages:", error);
      setSlides([]);
    }
  }, [selectedActivity, selectedSlideId]);

  const loadLayers = useCallback(async (pageId) => {
    if (!pageId) {
      console.log("No pageId, clearing layers");
      setLayers([]);
      return;
    }
    try {
      console.log("Fetching layers for pageId:", pageId);
      const result = await getAllLayers(pageId);
      console.log("API response:", result);
      const apiLayers = (Array.isArray(result) ? result : []).map((layer) => ({
        ...layer,
        saved: true,
        properties: {
          ...layer.properties,
          type: layer.properties.type || (layer.properties.imgUrl.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image"),
        },
      }));
      console.log("Processed layers:", apiLayers);
      setLayers(apiLayers);
    } catch (error) {
      console.error("Failed to load layers:", error);
      setLayers([]);
    }
  }, [setLayers]);

  const switchPage = useCallback((direction) => {
    let newIndex;
    if (direction === "next" && currentPageIndex < slides.length - 1) {
      newIndex = currentPageIndex + 1;
    } else if (direction === "prev" && currentPageIndex > 0) {
      newIndex = currentPageIndex - 1;
    } else {
      return;
    }
    setCurrentPageIndex(newIndex);
    const newSlide = slides[newIndex];
    setSelectedPage(newSlide._id);
    setSelectedSlideId(newSlide._id);
    setPageName(newSlide.title);
  }, [currentPageIndex, slides]);

  useEffect(() => {
    if (selectedActivity) {
      loadPages();
    }
  }, [selectedActivity, loadPages]);

  useEffect(() => {
    if (selectedSlideId) {
      loadLayers(selectedSlideId);
    }
  }, [selectedSlideId, loadLayers]);

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
        slides,
        setSlides,
        currentPageIndex,
        setCurrentPageIndex,
        switchPage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};