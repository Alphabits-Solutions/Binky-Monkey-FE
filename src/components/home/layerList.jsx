import { useState, useEffect, useCallback, useContext } from "react";
import { DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import { AppContext } from "../../context/AppContext";
import { createLayer, deleteLayer } from "../../services/api";
import { message, Button, Collapse,Modal, Popconfirm } from "antd";

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
    setCanvas3DObjects,
    modelViewers,
    setModelViewers
  } = useContext(AppContext);

  const [deletingLayerId, setDeletingLayerId] = useState(null);

  // Create a new layer when asset, action, and properties are set
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
        },
        pageId: selectedPage,
        saved: false,
      };
      console.log("Adding new unsaved layer:", newLayer);
      setLayers((prev) => [...prev, newLayer]);
    }
  }, [selectedPage, selectedAsset, selectedAction, layerProperties, setLayers, layers]);

// In Layers.jsx
// In layerList.jsx, update the handleSaveLayer function:
const handleSaveLayer = async (layer) => {
  try {
    let payload;
    if (layer.action === "model3d") {
      console.log("Saving 3D model layer with scale:", layer.properties.scale);
    }
    if (layer.action === "colorfill") {
      payload = {
        name: layer.name,
        action: layer.action,
        properties: {
          color: layer.properties.color,
          size: layer.properties.size,
          positionOrigin: layer.properties.positionOrigin,
          positionDestination: layer.properties.positionOrigin,
          svgContent: layer.properties.svgContent,
          type: "svg"
        },
        pageId: layer.pageId,
        shapeId: layer.shapeId
      };
    } else if (layer.action === "model3d") {
      // Special handling for 3D model layers
      payload = {
        name: layer.name,
        action: layer.action,
        properties: {
          modelUrl: layer.properties.modelUrl,
          size: layer.properties.size,
          positionOrigin: layer.properties.positionOrigin,
          positionDestination: layer.properties.positionDestination || layer.properties.positionOrigin,
          type: "model3d",
          rotation: layer.properties.rotation || { x: 0, y: 0, z: 0 },
          scale: layer.properties.scale || 1.0  // Ensure scale is included
        },
        pageId: layer.pageId,
        objectId: layer.objectId
      };
    } else {
      // Original payload for other action types
      payload = {
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
          rotationAngle: layer.properties.rotationAngle
        },
        pageId: layer.pageId,
      };
    }

    const savedLayer = await createLayer(payload);
    setLayers((prev) =>
      prev.map((l) =>
        l === layer ? { ...savedLayer, saved: true, shapeId: layer.shapeId, objectId: layer.objectId } : l
      )
    );
    message.success("Layer saved successfully!");
  } catch (error) {
    console.error("Error saving layer:", error);
    message.error(error.message || "Failed to save layer. Please try again.");
  }
};

const handleDeleteLayer = async (layer) => {
  try {
    setDeletingLayerId(layer._id || layer.name);
    // If the layer has an ID (was saved to the database), delete it from the server
    if (layer._id) {
      await deleteLayer(layer._id);
    }
    
    // Remove the layer from local state
    setLayers(prev => prev.filter(l => l !== layer));
    
    // If this layer has a 3D object, remove it from canvas3DObjects
    if (layer.objectId) {
      setCanvas3DObjects(prev => prev.filter(obj => obj.id !== layer.objectId));
      
      // Also clean up the model viewer if it exists
      if (modelViewers[layer.objectId]) {
        modelViewers[layer.objectId].dispose();
        setModelViewers(prev => {
          const updated = { ...prev };
          delete updated[layer.objectId];
          return updated;
        });
      }
    }
    
    // If this layer has a shape, remove it from canvasShapes
    if (layer.shapeId) {
      setCanvasShapes(prev => prev.filter(shape => shape.id !== layer.shapeId));
    }
    
    // Clear selected layer if it was the one deleted
    if (selectedLayer && selectedLayer._id === layer._id) {
      setSelectedLayer(null);
      setSelectedAsset(null);
      setSelectedAction(null);
    }
    
    message.success(`Layer "${layer.name}" deleted successfully`);
  } catch (error) {
    console.error("Error deleting layer:", error);
    message.error(`Failed to delete layer: ${error.message || "Unknown error"}`);
  } finally {
    setDeletingLayerId(null);
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
                    <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
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
                        >
                          Save
                        </Button>
                      )}
                      <Popconfirm
                        title="Delete this layer?"
                        description="This action cannot be undone."
                        onConfirm={(e) => {
                          e.stopPropagation();
                          handleDeleteLayer(layer);
                        }}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                      >
                        <Button
                          type="primary"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          loading={deletingLayerId === (layer._id || layer.name)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Delete layer ${layer.name}`}
                        />
                      </Popconfirm>
                    </div>
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