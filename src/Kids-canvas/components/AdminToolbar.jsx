import React, { useState } from 'react';

const AdminToolbar = ({ 
  interactionStates, 
  onInteractionToggle, 
  onCelebrate, 
  zoomLevel, 
  onZoomChange 
}) => {
  const [celebrateCooldown, setCelebrateCooldown] = useState(false);

  const interactionConfig = [
    {
      key: 'drag',
      title: 'Drag & Drop',
      description: 'Allow kids to drag objects to destinations',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
          <path d="M12 22V12"/>
          <path d="m17 13-5 5-5-5"/>
        </svg>
      )
    },
    {
      key: 'resize',
      title: 'Resize',
      description: 'Allow kids to resize images',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m15 3 6 6-6 6"/>
          <path d="M9 21l-6-6 6-6"/>
          <path d="M21 9H3"/>
          <path d="M21 15H3"/>
        </svg>
      )
    },
    {
      key: 'colorfill',
      title: 'Color Fill',
      description: 'Allow kids to fill shapes with colors',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3 6 6 3-3 6-6 3-3-6-6-3 3-6 6-3z"/>
        </svg>
      )
    },
    {
      key: 'audio',
      title: 'Audio Play',
      description: 'Allow kids to play audio by clicking objects',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="m19.07 4.93-4.14 4.14M23 12c0 4.97-4.03 9-9 9"/>
          <path d="M15 12c0 2.21-1.79 4-4 4"/>
        </svg>
      )
    },
    {
      key: 'model3d',
      title: '3D Rotation',
      description: 'Allow kids to rotate 3D models',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20"/>
          <path d="m15 5-3-3-3 3"/>
          <path d="m9 19 3 3 3-3"/>
          <path d="M2 12h20"/>
          <path d="m5 9-3-3-3 3"/>
          <path d="m19 15 3 3 3-3"/>
        </svg>
      )
    }
  ];

  const handleCelebrate = () => {
    if (celebrateCooldown) return;
    
    onCelebrate();
    setCelebrateCooldown(true);
    
    // Reduced cooldown to 3 seconds
    setTimeout(() => {
      setCelebrateCooldown(false);
    }, 3000);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 10, 200);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 10, 100);
    onZoomChange(newZoom);
  };

  const handleZoomReset = () => {
    onZoomChange(100);
  };

  return (
    <div className="admin-toolbar-horizontal">
      <div className="toolbar-section interactions">
        <div className="section-label">Interactions</div>
        <div className="toolbar-controls">
          {interactionConfig.map(({ key, title, description, icon }) => (
            <div
              key={key}
              className={`control-button ${interactionStates[key] ? 'active' : 'inactive'}`}
              onClick={() => onInteractionToggle(key, !interactionStates[key])}
              title={`${title}: ${description}`}
            >
              <div className="control-icon">
                {icon}
              </div>
              <div className={`control-indicator ${interactionStates[key] ? 'enabled' : 'disabled'}`}>
                {interactionStates[key] ? '●' : '○'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-section zoom">
        <div className="section-label">Zoom</div>
        <div className="zoom-controls">
          <button
            className="zoom-button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 100}
            title="Zoom Out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          
          <div className="zoom-display" title={`Current zoom: ${zoomLevel}%`}>
            {zoomLevel}%
          </div>
          
          <button
            className="zoom-button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 200}
            title="Zoom In"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          
          <button
            className="zoom-reset-button"
            onClick={handleZoomReset}
            disabled={zoomLevel === 100}
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-section celebrate">
        <div className="section-label">Actions</div>
        <button
          className={`celebrate-button ${celebrateCooldown ? 'cooldown' : ''}`}
          onClick={handleCelebrate}
          disabled={celebrateCooldown}
          title={celebrateCooldown ? 
            'Celebration cooldown active (3 seconds)' : 
            'Trigger confetti blast for all students'
          }
        >
          <div className="celebrate-icon">
            {celebrateCooldown ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 3h12l4 6-10 13L2 9l4-6z"/>
                <path d="M11 3 8 9l4 13 4-13-3-6"/>
                <path d="M2 9h20"/>
              </svg>
            )}
          </div>
          <span className="celebrate-text">
            {celebrateCooldown ? 'Cooldown...' : 'Celebrate'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AdminToolbar;