// ColorPalette.jsx
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import "../assets/sass/homescreen.scss"
import Resize from "../assets/icons/Home/RightSidebar/resize.svg";
import Drag from "../assets/icons/Home/RightSidebar/drag.svg";
import Rotation from "../assets/icons/Home/RightSidebar/rotation.svg";
import ColorFill from "../assets/icons/Home/RightSidebar/colorfill.svg";
import Vibrations from "../assets/icons/Home/RightSidebar/vibration.svg";
import AudioAction from "../assets/icons/Home/RightSidebar/audioaction.svg";

const ColorWheelVisual = ({ value, onChange }) => {
  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Main color input */}
      <input 
        type="color" 
        value={value}
        onChange={onChange}
        className="absolute inset-0 w-full h-full cursor-pointer z-10 opacity-100"
      />
      
      {/* Current color indicator ring */}
      {/* <div 
        className="absolute inset-0 rounded-full border-4 shadow-lg pointer-events-none"
        style={{ borderColor: value }}
      /> */}
    </div>
  );
};

const ColorPalette = ({ PRESET_COLORS }) => {
  // Get values from context
  const {
    selectedColors,
    setSelectedColors,
    showColorPicker,
    setShowColorPicker,
    customColor,
    setCustomColor,
    selectedAction,
    setSelectedAction,
    assetPosition,
    setAssetPosition,
    assetSize,
    setAssetSize,
    fillColor,
    setFillColor,
    strokeColor,
    setStrokeColor
  } = useContext(AppContext);

  // Handle toggling color selection
  const handleColorSelect = (color) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else if (selectedColors.length < 5) {
      setSelectedColors([...selectedColors, color]);
    }
  };

  // Handle custom color change
  const handleCustomColorChange = (e) => {
    setCustomColor(e.target.value);
  };

  // Handle adding custom color to palette
  const handleAddCustomColor = () => {
    if (selectedColors.length < 5) {
      setSelectedColors([...selectedColors, customColor]);
      setShowColorPicker(false);
    }
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
      <div className="flex flex-col gap-2">
        <div>
          <label className="text-sm font-semibold">Position</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={assetPosition?.x ?? 0} 
              onChange={(e) => handlePositionChange(e, "x")}
              placeholder="X"
              className="w-[35%] p-1 m-0.5 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              value={assetPosition?.y ?? 0}
              onChange={(e) => handlePositionChange(e, "y")}
              placeholder="Y"
              className="w-[35%] p-1 m-0.5 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold">Size</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={assetSize?.width ?? 100}
              onChange={(e) => handleSizeChange(e, "width")}
              placeholder="W"
              className="w-[35%] p-1 m-0.5 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              value={assetSize?.height ?? 100}
              onChange={(e) => handleSizeChange(e, "height")}
              placeholder="H"
              className="w-[35%] p-1 m-0.5 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>
    ),
    resize: (
      <div className="flex flex-col gap-2">
        <div>
          <label className="text-sm font-semibold">Size</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={assetSize?.width ?? 100}
              onChange={(e) => handleSizeChange(e, "width")}
              placeholder="W"
              className="w-[35%] p-1 m-0.5 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              value={assetSize?.height ?? 100}
              onChange={(e) => handleSizeChange(e, "height")}
              placeholder="H"
              className="w-[35%] p-1 m-0.5 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>
    ),
    rotation: (
      <div className="flex flex-col gap-2">
        <div>
          <label className="text-sm font-semibold">Rotation</label>
          <div className="flex gap-2 mt-1">
            <input 
              type="text" 
              placeholder="90°" 
              className="w-[35%] p-1 m-0.5 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>
    ),
    // Add other actions as needed
  };

  return (
    <div style={{padding:15}} className="w-64 bg-white p-4 h-[90vh] flex flex-col gap-4 overflow-y-auto">
      {/* Layout Section */}
      <div className="border-b-2 border-gray-200 mt-5 mb-5 pb-7">
        <h3 className="text-[#7E2807] text-base font-bold mb-3">LAYOUT</h3>
        {selectedAction && actionFields[selectedAction]}
      </div>
      
      {/* Show Color Palette only when colorfill action is selected */}
      {selectedAction === 'colorfill' && (
        <>
          <p className="text-gray-600 mb-4">Choose up to 5 colors for your palette:</p>
          
          {/* Selected Colors Display */}
          <div className="mb-4">
            <h3 className="text-[#7E2807] text-base font-bold mb-2">Your Palette</h3>
            <div className="flex flex-wrap gap-2 min-h-16 items-center">
              {selectedColors.length > 0 ? (
                selectedColors.map((color, index) => (
                  <div 
                    key={`${color}-${index}`}
                    className="relative group"
                  >
                    <div 
                      className="w-10 h-10 rounded-full shadow-md border border-gray-200" 
                      style={{ backgroundColor: color }}
                    />
                    <button 
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs shadow-md"
                      onClick={() => setSelectedColors(selectedColors.filter((_, i) => i !== index))}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic">No colors selected yet</p>
              )}
              {selectedColors.length < 5 && (
                <button
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                  onClick={() => setShowColorPicker(true)}
                >
                  +
                </button>
              )}
            </div>
          </div>
          
          {/* Color Wheel Picker */}
          {showColorPicker && (
            <div className="relative mb-4">
              <button 
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
                onClick={() => setShowColorPicker(false)}
              >
                ×
              </button>
              <h3 className="text-[#7E2807] text-base font-bold mb-3">Color Picker</h3>
              
              {/* Color Wheel */}
              <div className="flex flex-col items-center space-y-4">
                <ColorWheelVisual 
                  value={customColor}
                  onChange={handleCustomColorChange}
                />
                
                <div className="w-full flex items-center space-x-2">
                  <div 
                    className="w-10 h-10 rounded-lg shadow border border-gray-200" 
                    style={{ backgroundColor: customColor }}
                  />
                  <input 
                    type="text"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                
                {/* Color presets for quick selection */}
                <div className="grid grid-cols-6 gap-2 w-full">
                  {['#FF5252', '#4285F4', '#0F9D58', '#FFEB3B', '#9C27B0', '#FF9800', 
                    '#E91E63', '#00BCD4', '#3F51B5', '#8BC34A', '#FFC107', '#607D8B'].map(color => (
                    <div 
                      key={color}
                      className="w-6 h-6 rounded-md cursor-pointer border border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setCustomColor(color)}
                    />
                  ))}
                </div>
                
                <button 
                  className="bg-[#7e2907b7] hover:bg-[#7e2907e6] text-white px-4 py-2 rounded w-full flex items-center justify-center"
                  onClick={handleAddCustomColor}
                  disabled={selectedColors.length >= 5}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to Palette
                </button>
              </div>
            </div>
          )}
          
          {/* Quick Pick Colors */}
          <div className="mb-4">
            <h3 className="text-[#7E2807] text-base font-bold mb-3">Quick Picks</h3>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_COLORS.map((color) => (
                <div
                  key={color.value}
                  className={`p-1 rounded cursor-pointer transition-all ${
                    selectedColors.includes(color.value) ? 'bg-gray-200 scale-110 shadow-md' : 'bg-white hover:bg-gray-100'
                  }`}
                  onClick={() => handleColorSelect(color.value)}
                >
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-10 h-10 rounded-full shadow-sm border border-gray-200" 
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="mt-1 text-center text-xs">{color.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Fill Color and Stroke Color sections */}
          {/* <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-base font-semibold text-gray-800">Fill Color</label>
              <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded border border-gray-300">
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  className="w-7 h-7 rounded-full cursor-pointer"
                />
                <span className="text-gray-700 border-r border-gray-300 pr-2">{fillColor}</span>
                <span className="text-gray-600">100%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-base font-semibold text-gray-800">Stroke Color</label>
              <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded border border-gray-300">
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-7 h-7 rounded-full cursor-pointer"
                />
                <span className="text-gray-700 border-r border-gray-300 pr-2">{strokeColor}</span>
                <span className="text-gray-600">100%</span>
              </div>
            </div>
          </div> */}
          
          {/* Instructions section (commented out as requested) */}
          {/* 
          <div className="bg-white rounded-xl p-4 shadow-md mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Instructions</h3>
            <ol className="list-decimal ml-5 space-y-2 text-gray-700 text-sm">
              <li><strong>Place Mode:</strong> Drag shapes onto canvas and position them</li>
              <li><strong>Color Selection:</strong> Select up to 5 colors for your palette</li>
              <li><strong>Coloring Mode:</strong> Toggle the switch to start coloring</li>
              <li><strong>Painting:</strong> Select a color from your toolbar, then click on shape parts</li>
              <li><strong>Moving:</strong> Use Place Mode to reposition or delete shapes</li>
            </ol>
          </div>
          */}
        </>
      )}
      
      {/* Actions Section */}
      {/* <div>
        <h3 className="text-[#7E2807] text-base font-bold mb-3">ACTIONS</h3>
        <div className="flex flex-col">
          <button 
            className={`flex items-center justify-start py-4 px-2 ${selectedAction === 'resize' ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100 border-b border-gray-100`}
            onClick={() => setSelectedAction("resize")}
          >
            <img src={Resize} alt="Resize" className="w-17 h-10" />
          </button>
          <button 
            className={`flex items-center justify-start py-4 px-2 ${selectedAction === 'drag' ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100 border-b border-gray-100`}
            onClick={() => setSelectedAction("drag")}
          >
            <img src={Drag} alt="Drag" className="w-14 h-10" />
          </button>
          <button 
            className={`flex items-center justify-start py-4 px-2 ${selectedAction === 'rotation' ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100 border-b border-gray-100`}
            onClick={() => setSelectedAction("rotation")}
          >
            <img src={Rotation} alt="Rotation" className="w-24 h-10" />
          </button>
          <button 
            className={`flex items-center justify-start py-4 px-2 ${selectedAction === 'colorfill' ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100 border-b border-gray-100`}
            onClick={() => setSelectedAction("colorfill")}
          >
            <img src={ColorFill} alt="Color Fill" className="w-20 h-10" />
          </button>
          <button 
            className={`flex items-center justify-start py-4 px-2 ${selectedAction === 'vibration' ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100 border-b border-gray-100`}
            onClick={() => setSelectedAction("vibration")}
          >
            <img src={Vibrations} alt="Vibration" className="w-21 h-10" />
          </button>
          <button 
            className={`flex items-center justify-start py-4 px-2 ${selectedAction === 'audio' ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100 border-b border-gray-100`}
            onClick={() => setSelectedAction("audio")}
          >
            <img src={AudioAction} alt="Audio Action" className="w-24 h-10" />
          </button>
        </div>
      </div> */}
      <div className="action">
        <h3 className="text-[#7E2807] text-base font-bold mb-3">ACTIONS</h3>
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

export default ColorPalette;