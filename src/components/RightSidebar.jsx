import Resize from "../assets/icons/Home/RightSidebar/resize.svg";
import Drag from "../assets/icons/Home/RightSidebar/drag.svg";
import Rotation from "../assets/icons/Home/RightSidebar/rotation.svg";
import ColorFill from "../assets/icons/Home/RightSidebar/colorfill.svg";
import Vibrations from "../assets/icons/Home/RightSidebar/vibration.svg";
import AudioAction from "../assets/icons/Home/RightSidebar/audioaction.svg";
import { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";

const RightSidebar = () => {
  const {
    selectedAsset,
    selectedAction,
    setSelectedAction,
    assetPosition,
    setAssetPosition,
    shadowPosition,
    setShadowPosition,
    assetSize,
    setAssetSize,
    layerProperties,
    setLayerProperties,
  } = useContext(AppContext);

  const [fillColor, setFillColor] = useState("#861E00");
  const [strokeColor, setStrokeColor] = useState("#FFFFFF");
  const [rotationAngle, setRotationAngle] = useState(0);
  const [vibrationIntensity, setVibrationIntensity] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");

  const hexToRgb = (hex) => {
    hex = hex.replace(/^#/, "");
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  useEffect(() => {
    setLayerProperties((prev) => ({
      ...prev,
      imgUrl: selectedAsset?.src || "",
      color: [hexToRgb(fillColor), hexToRgb(strokeColor)],
      size: [`${assetSize.width}px`, `${assetSize.height}px`],
      positionOrigin: assetPosition,
      positionDestination: shadowPosition || { x: assetPosition.x + 50, y: assetPosition.y + 50 },
      bearer: vibrationIntensity,
      audioUrl: audioUrl,
    }));
  }, [
    selectedAsset,
    fillColor,
    strokeColor,
    assetSize,
    assetPosition,
    shadowPosition,
    vibrationIntensity,
    audioUrl,
    setLayerProperties,
  ]);

  const handlePositionChange = (e, axis, target) => {
    const value = parseInt(e.target.value) || 0;
    if (target === "original") {
      setAssetPosition((prev) => ({
        ...prev,
        [axis]: value,
      }));
    } else if (target === "shadow") {
      setShadowPosition((prev) => ({
        ...prev,
        [axis]: value,
      }));
    }
  };

  const handleSizeChange = (e, dimension) => {
    const value = parseInt(e.target.value) || 100;
    setAssetSize((prev) => ({
      ...prev,
      [dimension]: value,
    }));
  };

  const actionFields = {
    drag: (
      <div className="layout-controls">
        <div>
          <label>Origin</label>
          <input
            type="number"
            value={assetPosition?.x ?? 0}
            onChange={(e) => handlePositionChange(e, "x", "original")}
            placeholder="X"
          />
          <input
            type="number"
            value={assetPosition?.y ?? 0}
            onChange={(e) => handlePositionChange(e, "y", "original")}
            placeholder="Y"
          />
        </div>
        <div>
          <label>Destination</label>
          <input
            type="number"
            value={shadowPosition?.x ?? ""}
            onChange={(e) => handlePositionChange(e, "x", "shadow")}
            placeholder="X"
            disabled={!shadowPosition}
          />
          <input
            type="number"
            value={shadowPosition?.y ?? ""}
            onChange={(e) => handlePositionChange(e, "y", "shadow")}
            placeholder="Y"
            disabled={!shadowPosition}
          />
        </div>
        <div>
          <label>Size</label>
          <input
            type="number"
            value={assetSize?.width ?? 100}
            onChange={(e) => handleSizeChange(e, "width")}
            placeholder="W"
          />
          <input
            type="number"
            value={assetSize?.height ?? 100}
            onChange={(e) => handleSizeChange(e, "height")}
            placeholder="H"
          />
        </div>
      </div>
    ),
    resize: (
      <div className="layout-controls">
        <div>
          <label>Size</label>
          <input
            type="number"
            value={assetSize?.width ?? 100}
            onChange={(e) => handleSizeChange(e, "width")}
            placeholder="W"
          />
          <input
            type="number"
            value={assetSize?.height ?? 100}
            onChange={(e) => handleSizeChange(e, "height")}
            placeholder="H"
          />
        </div>
      </div>
    ),
    rotation: (
      <div className="layout-controls">
        <div>
          <label>Rotation Angle (°)</label>
          <input
            type="number"
            value={rotationAngle}
            onChange={(e) => setRotationAngle(parseInt(e.target.value) || 0)}
            placeholder="0°"
          />
        </div>
      </div>
    ),
    colorfill: (
      <div className="layout-controls">
        <div>
          <label>Fill Color</label>
          <input
            type="color"
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
          />
          <span>{fillColor}</span>
        </div>
        <div>
          <label>Stroke Color</label>
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
          />
          <span>{strokeColor}</span>
        </div>
      </div>
    ),
    vibration: (
      <div className="layout-controls">
        <div>
          <label>Vibration Intensity</label>
          <input
            type="number"
            value={vibrationIntensity}
            onChange={(e) => setVibrationIntensity(parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>
    ),
    audio: (
      <div className="layout-controls">
        <div>
          <label>Audio URL</label>
          <input
            type="text"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="Enter audio URL"
          />
        </div>
      </div>
    ),
  };

  return (
    <div className="right-sidebar">
      <div className="layout">
        <h3>LAYOUT</h3>
        {selectedAction && actionFields[selectedAction]}
      </div>
      {selectedAction !== "colorfill" && (
        <>
          <div className="color-section">
            <label>Color</label>
            <div className="color-picker">
              <input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
              />
              <span>{fillColor}</span>
              <span>100%</span>
            </div>
          </div>
          <div className="color-section">
            <label>Stroke Color</label>
            <div className="color-picker">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
              />
              <span>{strokeColor}</span>
              <span>100%</span>
            </div>
          </div>
        </>
      )}
      <div className="action">
        <h3>ACTIONS</h3>
        <div className="action-list">
          <button onClick={() => setSelectedAction("resize")}>
            <img src={Resize} alt="Resize Icon" />
          </button>
          <button onClick={() => setSelectedAction("drag")}>
            <img src={Drag} alt="Drag Icon" />
          </button>
          <button onClick={() => setSelectedAction("rotation")}>
            <img src={Rotation} alt="Rotation Icon" />
          </button>
          <button onClick={() => setSelectedAction("colorfill")}>
            <img src={ColorFill} alt="Color Fill Icon" />
          </button>
          <button onClick={() => setSelectedAction("vibration")}>
            <img src={Vibrations} alt="Vibration Icon" />
          </button>
          <button onClick={() => setSelectedAction("audio")}>
            <img src={AudioAction} alt="Audio Action Icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;