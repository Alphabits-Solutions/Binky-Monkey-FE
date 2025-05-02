import { useState, useEffect, useCallback, useContext } from "react";
import { SaveOutlined } from "@ant-design/icons";
import { AppContext } from "../../context/AppContext";
import { getAllLayers, createLayer } from "../../services/api";
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

  const loadLayers = useCallback(async () => {
    if (!selectedPage) return;
    try {
      const result = await getAllLayers(selectedPage);
      setLayers(result.layers || []);
    } catch (error) {
      console.error("Failed to load layers:", error);
      message.error("Failed to load layers. Please try again.");
    }
  }, [selectedPage, setLayers]);

  useEffect(() => {
    loadLayers();
  }, [loadLayers]);

  // Create a new layer when asset, action, and properties are set
  useEffect(() => {
    if (
      selectedPage &&
      selectedAsset &&
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
        action: selectedAction || "none",
        properties: { ...layerProperties },
        pageId: selectedPage,
        saved: false,
      };
      setLayers((prev) => [...prev, newLayer]);
    }
  }, [selectedPage, selectedAsset, selectedAction, layerProperties, setLayers, layers]);

  const handleSaveLayer = async (layer) => {
    try {
      const savedLayer = await createLayer(selectedPage, {
        name: layer.name,
        action: layer.action,
        properties: layer.properties,
        pageId: selectedPage,
      });
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
      message.error("Failed to save layer. Please try again.");
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
          <p>No layers available. Select an asset to create a layer.</p>
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