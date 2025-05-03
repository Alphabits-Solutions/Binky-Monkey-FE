import Resize from "../assets/icons/Home/RightSidebar/resize.svg";
import Drag from "../assets/icons/Home/RightSidebar/drag.svg";
import Rotation from "../assets/icons/Home/RightSidebar/rotation.svg";
import ColorFill from "../assets/icons/Home/RightSidebar/colorfill.svg";
import Vibrations from "../assets/icons/Home/RightSidebar/vibration.svg";
import AudioAction from "../assets/icons/Home/RightSidebar/audioaction.svg";
import { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";

// Color Wheel component from ColorPalette
const ColorWheelVisual = ({ value, onChange }) => {
  return (
    <div className="color-wheel-container">
      {/* Main color input */}
      <input 
        type="color" 
        value={value}
        onChange={onChange}
        className="color-wheel-input"
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
    // Make sure these are added to your AppContext
    selectedColors = [],
    setSelectedColors = () => {},
    activeColor,
    setActiveColor = () => {},
  } = useContext(AppContext);

  // Local state
  const [fillColor, setFillColor] = useState("#861E00");
  const [strokeColor, setStrokeColor] = useState("#FFFFFF");
  const [rotationAngle, setRotationAngle] = useState(0);
  const [vibrationIntensity, setVibrationIntensity] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#FF5252");

  // Preset colors for quick selection
  const PRESET_COLORS = [
    { name: "Red", value: "#FF5252" },
    { name: "Blue", value: "#4285F4" },
    { name: "Green", value: "#0F9D58" },
    { name: "Yellow", value: "#FFEB3B" },
    { name: "Purple", value: "#9C27B0" },
    { name: "Orange", value: "#FF9800" },
    { name: "Pink", value: "#E91E63" },
    { name: "Cyan", value: "#00BCD4" }
  ];

  const hexToRgb = (hex) => {
    hex = hex.replace(/^#/, "");
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Update layer properties when relevant state changes
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
      rotationAngle: rotationAngle,
    }));

    // If fill color changes, also update active color for drawing
    if (selectedAction === "colorfill" && setActiveColor) {
      setActiveColor(fillColor);
    }
  }, [
    selectedAsset,
    fillColor,
    strokeColor,
    assetSize,
    assetPosition,
    shadowPosition,
    vibrationIntensity,
    audioUrl,
    rotationAngle,
    setLayerProperties,
    selectedAction,
    setActiveColor,
  ]);

  // Handle toggling color selection
  const handleColorSelect = (color) => {
    // Update active color for drawing
    if (setActiveColor) {
      setActiveColor(color);
    }
    
    // For color palette management
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else if (selectedColors.length < 5) {
      setSelectedColors([...selectedColors, color]);
    }
    
    // Also update fill color to stay in sync
    setFillColor(color);
  };

  // Handle custom color change
  const handleCustomColorChange = (e) => {
    setCustomColor(e.target.value);
  };

  // Handle adding custom color to palette
  const handleAddCustomColor = () => {
    if (selectedColors.length < 5) {
      const newColor = customColor;
      setSelectedColors([...selectedColors, newColor]);
      if (setActiveColor) {
        setActiveColor(newColor);
      }
      setFillColor(newColor);
      setShowColorPicker(false);
    }
  };

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

  // Original action fields merged with enhanced color fill
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
      <div className="layout-controls color-fill-panel">
        <p className="color-palette-note">Choose up to 5 colors for your palette:</p>
          
        {/* Selected Colors Display */}
        <div className="palette-section">
          <h4>Your Palette</h4>
          <div className="selected-colors-container">
            {selectedColors.length > 0 ? (
              selectedColors.map((color, index) => (
                <div 
                  key={`${color}-${index}`}
                  className="color-swatch-wrapper"
                >
                  <div 
                    className={`color-swatch ${activeColor === color ? 'active-swatch' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                  ></div>
                  <button 
                    className="remove-color-btn"
                    onClick={() => setSelectedColors(selectedColors.filter((_, i) => i !== index))}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p className="no-colors-text">No colors selected yet</p>
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
            <div className="color-wheel-ui">
              <ColorWheelVisual 
                value={customColor}
                onChange={handleCustomColorChange}
              />
              
              <div className="color-preview">
                <div 
                  className="preview-swatch"
                  style={{ backgroundColor: customColor }}
                ></div>
                <input 
                  type="text"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="color-text-input"
                />
              </div>
              
              {/* Color presets for quick selection */}
              <div className="preset-palette">
                {['#FF5252', '#4285F4', '#0F9D58', '#FFEB3B', '#9C27B0', '#FF9800', 
                  '#E91E63', '#00BCD4', '#3F51B5', '#8BC34A', '#FFC107', '#607D8B'].map(color => (
                  <div 
                    key={color}
                    className="preset-color"
                    style={{ backgroundColor: color }}
                    onClick={() => setCustomColor(color)}
                  ></div>
                ))}
              </div>
              
              <button 
                className="add-to-palette-btn"
                onClick={handleAddCustomColor}
                disabled={selectedColors.length >= 5}
              >
                Add to Palette
              </button>
            </div>
          </div>
        )}
        
        {/* Quick Pick Colors */}
        <div className="quick-picks-section">
          <h4>Quick Picks</h4>
          <div className="quick-picks-grid">
            {PRESET_COLORS.map((color) => (
              <div
                key={color.value}
                className={`quick-pick-item ${
                  selectedColors.includes(color.value) ? 'selected-quick-pick' : ''
                }`}
                onClick={() => handleColorSelect(color.value)}
              >
                <div className="quick-pick-content">
                  <div 
                    className={`quick-pick-swatch ${activeColor === color.value ? 'active-swatch' : ''}`}
                    style={{ backgroundColor: color.value }}
                  ></div>
                  <span className="quick-pick-name">{color.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Standard fill and stroke inputs */}
        {/* <div>
          <label>Fill Color</label>
          <input
            type="color"
            value={fillColor}
            onChange={(e) => {
              const newColor = e.target.value;
              setFillColor(newColor);
              if (setActiveColor) setActiveColor(newColor);
            }}
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
        </div> */}
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
          <button 
            className={selectedAction === "resize" ? "active" : ""}
            onClick={() => setSelectedAction("resize")}
          >
            <img src={Resize} alt="Resize Icon" />
          </button>
          <button 
            className={selectedAction === "drag" ? "active" : ""}
            onClick={() => setSelectedAction("drag")}
          >
            <img src={Drag} alt="Drag Icon" />
          </button>
          <button 
            className={selectedAction === "rotation" ? "active" : ""}
            onClick={() => setSelectedAction("rotation")}
          >
            <img src={Rotation} alt="Rotation Icon" />
          </button>
          <button 
            className={selectedAction === "colorfill" ? "active" : ""}
            onClick={() => setSelectedAction("colorfill")}
          >
            <img src={ColorFill} alt="Color Fill Icon" />
          </button>
          <button 
            className={selectedAction === "vibration" ? "active" : ""}
            onClick={() => setSelectedAction("vibration")}
          >
            <img src={Vibrations} alt="Vibration Icon" />
          </button>
          <button 
            className={selectedAction === "audio" ? "active" : ""}
            onClick={() => setSelectedAction("audio")}
          >
            <img src={AudioAction} alt="Audio Action Icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;