// src/components/RightSidebar.jsx
import Resize from "../assets/icons/Home/RightSidebar/resize.svg";
import Drag from "../assets/icons/Home/RightSidebar/drag.svg";
import Rotation from "../assets/icons/Home/RightSidebar/rotation.svg";
import ColorFill from "../assets/icons/Home/RightSidebar/colorfill.svg";
import Vibrations from "../assets/icons/Home/RightSidebar/vibration.svg";
import AudioAction from "../assets/icons/Home/RightSidebar/audioaction.svg";
import { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";

// Predefined colors
const PRESET_COLORS = [
  { name: 'Red', value: '#FF5252' },
  { name: 'Blue', value: '#4285F4' },
  { name: 'Green', value: '#0F9D58' },
  { name: 'Yellow', value: '#FFEB3B' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Cyan', value: '#00BCD4' },
];

// Color wheel component to select custom colors
const ColorWheelVisual = ({ value, onChange }) => {
  return (
    <div className="color-wheel">
      <input
        type="color"
        value={value}
        onChange={onChange}
        className="color-input"
      />
    </div>
  );
};

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
    // Color fill properties
    selectedColors,
    setSelectedColors,
    customColor,
    setCustomColor,
    showColorPicker,
    setShowColorPicker,
    fillColor,
    setFillColor,
    strokeColor,
    setStrokeColor,
  } = useContext(AppContext);

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

  // Update effect in RightSidebar.jsx

useEffect(() => {
  if (selectedAction === "colorfill") {
    setLayerProperties((prev) => ({
      ...prev,
      color: selectedColors, // Store the color palette only, not the fills
    }));
  } else {
    setLayerProperties((prev) => ({
      ...prev,
      imgUrl: selectedAsset?.src || "",
      color: [hexToRgb(fillColor), hexToRgb(strokeColor)],
      size: [`${assetSize.width}px`, `${assetSize.height}px`],
      positionOrigin: assetPosition,
      positionDestination: shadowPosition || { x: assetPosition.x + 50, y: assetPosition.y + 50 },
      bearer: vibrationIntensity,
      audioUrl: audioUrl,
      rotationAngle: rotationAngle,
    }));
  }
}, [
  selectedAction,
  selectedAsset,
  fillColor,
  strokeColor,
  assetSize,
  assetPosition,
  shadowPosition,
  vibrationIntensity,
  audioUrl,
  rotationAngle,
  selectedColors,
  setLayerProperties,
]);

  const handlePositionChange = (e, axis, target) => {
    const value = parseInt(e.target.value) || 0;
    if (target === "original") {
      setAssetPosition((prev) => ({
        ...prev,
        [axis]: value,
      }));
      setLayerProperties((prev) => ({
        ...prev,
        positionOrigin: { ...prev.positionOrigin, [axis]: value },
      }));
    } else if (target === "shadow") {
      setShadowPosition((prev) => ({
        ...prev,
        [axis]: value,
      }));
      setLayerProperties((prev) => ({
        ...prev,
        positionDestination: { ...prev.positionDestination, [axis]: value },
      }));
    }
  };

  const handleSizeChange = (e, dimension) => {
    const value = parseInt(e.target.value) || 100;
    setAssetSize((prev) => ({
      ...prev,
      [dimension]: value,
    }));
    setLayerProperties((prev) => ({
      ...prev,
      size: [
        dimension === "width" ? `${value}px` : prev.size[0],
        dimension === "height" ? `${value}px` : prev.size[1],
      ],
    }));
  };

  // Handle custom color change
  const handleCustomColorChange = (e) => {
    setCustomColor(e.target.value);
  };

  // Handle toggling color selection
  const handleColorSelect = (color) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else if (selectedColors.length < 5) {
      setSelectedColors([...selectedColors, color]);
    }
  };

  // Handle adding custom color to palette
  const handleAddCustomColor = () => {
    if (selectedColors.length < 5) {
      setSelectedColors([...selectedColors, customColor]);
      setShowColorPicker(false);
    }
  };

  // Action-specific controls
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
        {/* Color Palette Section */}
        <div className="color-palette-section">
          <p className="color-palette-hint">Choose up to 5 colors for your palette:</p>
          
          {/* Selected Colors Display */}
          <div className="selected-colors">
            <h4>Your Palette</h4>
            <div className="color-chips">
              {selectedColors.length > 0 ? (
                selectedColors.map((color, index) => (
                  <div 
                    key={`${color}-${index}`}
                    className="color-chip"
                  >
                    <div 
                      className="color-preview" 
                      style={{ backgroundColor: color }}
                    />
                    <button 
                      className="color-delete-btn"
                      onClick={() => setSelectedColors(selectedColors.filter((_, i) => i !== index))}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-colors-message">No colors selected yet</p>
              )}
              {selectedColors.length < 5 && (
                <button
                  className="add-color-btn"
                  onClick={() => setShowColorPicker(true)}
                >
                  +
                </button>
              )}
            </div>
          </div>
          
          {/* Color Wheel Picker */}
          {showColorPicker && (
            <div className="color-picker-container">
              <button 
                className="close-picker-btn"
                onClick={() => setShowColorPicker(false)}
              >
                ×
              </button>
              <h4>Color Picker</h4>
              
              {/* Color Wheel */}
              <div className="color-wheel-container">
                <ColorWheelVisual 
                  value={customColor}
                  onChange={handleCustomColorChange}
                />
                
                <div className="color-preview-container">
                  <div 
                    className="selected-color-preview" 
                    style={{ backgroundColor: customColor }}
                  />
                  <input 
                    type="text"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    className="color-value-input"
                  />
                </div>
                
                {/* Color presets for quick selection */}
                <div className="color-presets">
                  {['#FF5252', '#4285F4', '#0F9D58', '#FFEB3B', '#9C27B0', '#FF9800', 
                    '#E91E63', '#00BCD4', '#3F51B5', '#8BC34A', '#FFC107', '#607D8B'].map(color => (
                    <div 
                      key={color}
                      className="preset-color"
                      style={{ backgroundColor: color }}
                      onClick={() => setCustomColor(color)}
                    />
                  ))}
                </div>
                
                <button 
                  className="add-palette-btn"
                  onClick={handleAddCustomColor}
                  disabled={selectedColors.length >= 5}
                >
                  Add to Palette
                </button>
              </div>
            </div>
          )}
          
          {/* Quick Pick Colors */}
          <div className="quick-picks">
            <h4>Quick Picks</h4>
            <div className="preset-colors-grid">
              {PRESET_COLORS.map((color) => (
                <div
                  key={color.value}
                  className={`preset-color-item ${
                    selectedColors.includes(color.value) ? 'selected' : ''
                  }`}
                  onClick={() => handleColorSelect(color.value)}
                >
                  <div className="preset-color-preview" style={{ backgroundColor: color.value }} />
                  <span className="preset-color-name">{color.name}</span>
                </div>
              ))}
            </div>
          </div>
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