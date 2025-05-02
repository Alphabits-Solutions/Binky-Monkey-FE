import Resize from "../assets/icons/Home/RightSidebar/resize.svg";
import Drag from "../assets/icons/Home/RightSidebar/drag.svg";
import Rotation from "../assets/icons/Home/RightSidebar/rotation.svg";
import ColorFill from "../assets/icons/Home/RightSidebar/colorfill.svg";
import Vibrations from "../assets/icons/Home/RightSidebar/vibration.svg";
import AudioAction from "../assets/icons/Home/RightSidebar/audioaction.svg";
import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

const RightSidebar = () => {
  const {
    selectedAction,
    setSelectedAction,
    assetPosition,
    setAssetPosition,
    assetSize,
    setAssetSize,
  } = useContext(AppContext); // Destructure context values
  const [fillColor, setFillColor] = useState("#861E00");
  const [strokeColor, setStrokeColor] = useState("#FFFFFF");

  const hexToRgb = (hex) => {
    hex = hex.replace(/^#/, "");
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const handlePositionChange = (e, axis) => {
    setAssetPosition((prev) => ({
      ...prev,
      [axis]: parseInt(e.target.value) || 0,
    }));
  };

  const handleSizeChange = (e, dimension) => {
    setAssetSize((prev) => ({
      ...prev,
      [dimension]: parseInt(e.target.value) || 0,
    }));
  };

  const actionFields = {
    drag: (
      <div className="layout-controls">
        <div>
          <label>Position</label>
          <input
            type="text"
            value={assetPosition?.x ?? 0} // Use optional chaining and fallback
            onChange={(e) => handlePositionChange(e, "x")}
            placeholder="X"
          />
          <input
            type="text"
            value={assetPosition?.y ?? 0}
            onChange={(e) => handlePositionChange(e, "y")}
            placeholder="Y"
          />
        </div>
        <div>
          <label>Size</label>
          <input
            type="text"
            value={assetSize?.width ?? 100}
            onChange={(e) => handleSizeChange(e, "width")}
            placeholder="W"
          />
          <input
            type="text"
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
            type="text"
            value={assetSize?.width ?? 100}
            onChange={(e) => handleSizeChange(e, "width")}
            placeholder="W"
          />
          <input
            type="text"
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
          <label>Rotation</label>
          <input type="text" placeholder="90°" />
        </div>
      </div>
    ),
    // Add other actions as needed
  };

  return (
    <div className="right-sidebar">
      <div className="layout">
        <h3>LAYOUT</h3>
        {selectedAction && actionFields[selectedAction]}
      </div>
      {/* <div className="color-section">
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
      </div> */}
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