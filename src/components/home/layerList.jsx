import { useState, useEffect, useCallback, useContext } from "react";
import { SaveOutlined } from "@ant-design/icons";
import { AppContext } from "../../context/AppContext";
import { createLayer } from "../../services/api";
import { message, Button, Collapse } from "antd";

const { Panel } = Collapse;

const Layers = () => {
  const {
    selectedPage,
    selectedAsset,
    selectedAction,
    layerProperties,
    setLayerProperties,
    layers,
    setLayers,
    selectedLayer,
    setSelectedLayer,
    setSelectedAsset,
    setSelectedAction,
    setAssetPosition,
    setAssetSize,
  } = useContext(AppContext);

  useEffect(() => {
    if (
      selectedPage &&
      selectedAsset &&
      selectedAction &&
      layerProperties.imgUrl &&
      !layers.some(
        (layer) =>
          layer.properties.imgUrl === layerProperties.imgUrl &&
          layer.action === selectedAction &&
          !layer.saved
      )
    ) {
      const newLayer = {
        name: "Untitled Layer",
        action: selectedAction,
        properties: {
          color: layerProperties.color || [],
          size: layerProperties.size || ["100px", "100px"],
          positionOrigin: layerProperties.positionOrigin || { x: 50, y: 50 },
          positionDestination: layerProperties.positionDestination || { x: 100, y: 100 },
          bearer: layerProperties.bearer || 0,
          imgUrl: layerProperties.imgUrl || "",
          audioUrl: layerProperties.audioUrl || "",
          type: selectedAsset.type || "image",
          rotationAngle: layerProperties.rotationAngle || 0,
        },
        pageId: selectedPage,
        saved: false,
      };
      console.log("Adding new unsaved layer:", newLayer);
      setLayers((prev) => [...prev, newLayer]);
    }
  }, [selectedPage, selectedAsset, selectedAction, layerProperties.imgUrl, setLayers, layers]);

  const handleSaveLayer = async (layer) => {
    try {
      const payload = {
        name: layer.name,
        action: layer.action,
        properties: {
          color: layer.properties.color,
          size: layer.properties.size,
          positionOrigin: layer.properties.positionOrigin,
          positionDestination: layer.properties.positionDestination,
          bearer: layer.properties.bearer,
          imgUrl: layer.properties.imgUrl,
          audioUrl: layer.properties.audioUrl,
          type: layer.properties.type,
          rotationAngle: layer.properties.rotationAngle || 0,
        },
        pageId: layer.pageId,
      };

      const savedLayer = await createLayer(payload);
      setLayers((prev) =>
        prev.map((l) =>
          l.properties.imgUrl === layer.properties.imgUrl && l.action === layer.action
            ? { ...savedLayer, saved: true }
            : l
        )
      );
      message.success("Layer saved successfully!");
    } catch (error) {
      console.error("Error saving layer:", error);
      message.error(error.message || "Failed to save layer. Please try again.");
    }
  };

  const handleSelectLayer = useCallback(
    (layer) => {
      setSelectedLayer(layer);
      setSelectedAsset({
        type: layer.properties.type || "image",
        src: layer.properties.imgUrl,
      });
      setSelectedAction(layer.action === "none" ? null : layer.action);
      setAssetPosition(layer.properties.positionOrigin);
      setAssetSize({
        width: parseInt(layer.properties.size[0]),
        height: parseInt(layer.properties.size[1]),
      });
      setLayerProperties({
        ...layer.properties,
        rotationAngle: layer.properties.rotationAngle || 0,
      });
    },
    [setSelectedLayer, setSelectedAsset, setSelectedAction, setAssetPosition, setAssetSize, setLayerProperties]
  );

  return (
    <div className="layer-list-container">
      <div className="header">
        <h2>LAYERS</h2>
      </div>
      <div className="layer-grid">
        {layers.length === 0 ? (
          <p>No layers available for this page.</p>
        ) : (
          <Collapse accordion>
            {layers.map((layer) => (
              <Panel
                header={
                  <div
                    className={`layer-header ${selectedLayer?._id === layer._id ? "selected" : ""}`}
                    onClick={() => handleSelectLayer(layer)}
                  >
                    {layer.name}
                    {!layer.saved && (
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveLayer(layer);
                        }}
                        aria-label={`Save layer ${layer.name}`}
                        style={{ marginLeft: "8px" }}
                      >
                        Save
                      </Button>
                    )}
                  </div>
                }
                key={layer._id || layer.properties.imgUrl + layer.action}
              >
                <div className="layer-action">
                  <p>Action: {layer.action}</p>
                </div>
              </Panel>
            ))}
          </Collapse>
        )}
      </div>
    </div>
  );
};

export default Layers;