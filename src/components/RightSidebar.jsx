// import { BorderOutlined, DragOutlined, RotateRightOutlined, BgColorsOutlined, SoundOutlined } from "@ant-design/icons";
import Resize from "../assets/icons/Home/RightSidebar/resize.svg";
import Drag from "../assets/icons/Home/RightSidebar/drag.svg";
import Rotation from "../assets/icons/Home/RightSidebar/rotation.svg";
import ColorFill from "../assets/icons/Home/RightSidebar/colorfill.svg";
import Vibrations from "../assets/icons/Home/RightSidebar/vibration.svg";
import AudioAction from "../assets/icons/Home/RightSidebar/audioaction.svg";
import { useState } from "react";

const RightSidebar = () => {
  const [fillColor, setFillColor] = useState("#861E00");  
  const [strokeColor, setStrokeColor] = useState("#FFFFFF"); 



  const hexToRgb = (hex) => {
    hex = hex.replace(/^#/, "");
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };
  return (
    <div className="right-sidebar">
      <div className="layout">
        <h3>LAYOUT SIZE</h3>
        <div className="layout-controls">
          <div>
            <label>Position</label>
            <input type="text" placeholder="X" />
            <input type="text" placeholder="Y" />
          </div>
          <div>
            <label>Size</label>
            <input type="text" placeholder="W" />
            <input type="text" placeholder="H" />
          </div>
          <div>
            <label>Vibration</label>
            <input type="text" placeholder="PX" />
          </div>
          <div>
            <label>Rotation</label>
            <input type="text" placeholder="90°" />
          </div>
        </div>
      </div>
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
        <label>Color</label>
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
      <div className="action">
        <h3>ACTIONS</h3>
        <div className="action-list">
          <button>
            <img src={Resize} alt="Resize Icon" />
          </button>
          <button>
            <img src={Drag} alt="Drag Icon" />
          </button>
          <button>
            <img src={Rotation} alt="Rotation Icon" />
          </button>
          <button>
            <img src={ColorFill} alt="Color Fill Icon" />
          </button>
          <button>
            <img src={Vibrations} alt="Vibration Icon" />
          </button>
          <button>
            <img src={AudioAction} alt="Audio Action Icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
