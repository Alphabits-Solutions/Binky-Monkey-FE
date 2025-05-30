import React, { useState, useEffect } from 'react';
import CanvasContainer from './components/CanvasContainer';
import './styles/CanvasContainer.css';

// Example App showing how to integrate the Kids Canvas
function App() {
  // Get isModerator from localStorage with fallback
  if (localStorage.getItem('isModerator') === null) {
    localStorage.setItem('isModerator', 'false');
  }
  console.log("isModerator", localStorage.getItem('isModerator'));
  
  
  const [userInfo, setUserInfo] = useState({
    userId: "user-" + Math.random().toString(36).substr(2, 9),
    // userName: "Student " + Math.random().toString(36).substr(2, 5),
    userName: "Student " + Math.random().toString(36).substr(2, 5),
    isModerator: localStorage.getItem('isModerator') === 'true' || false
    // isModerator: true
  });

  // In BBB integration, you would get this from meeting metadata
  const activityId = "682782fcf87c2b051dbadb57"; // Hardcoded for now

  // Configuration
  const config = {
    socketUrl: process.env.REACT_APP_SOCKET_URL || "http://localhost:8000",
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"
  };

  // For BBB integration, you might get user info like this:
  useEffect(() => {
    // Example BBB integration code (pseudo-code):
    /*
    if (window.BBB) {
      const user = window.BBB.getCurrentUser();
      const meeting = window.BBB.getMeetingInfo();
      
      setUserInfo({
        userId: user.userID,
        userName: user.name,
        isModerator: user.role === 'MODERATOR'
      });
      
      // Get activity ID from meeting metadata
      const activityId = meeting.metadata?.activityId || 'default-activity';
    }
    */
  }, []);

  return (
    <div className="app">
      {/* Development Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          zIndex: 9999,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <div>🎮 Kids Canvas v1.0</div>
          <div>👤 {userInfo.userName}</div>
          <div>🔧 {userInfo.isModerator ? 'Admin' : 'Student'}</div>
          <div>🏠 localStorage: {localStorage.getItem('isModerator') || 'null'}</div>
        </div>
      )}

      {/* Main Kids Canvas */}
      <CanvasContainer
        activityId={activityId}
        socketUrl={config.socketUrl}
        apiBaseUrl={config.apiBaseUrl}
      />
    </div>
  );
}

export default App;

// Alternative: Component for direct BBB integration
export const BBBKidsCanvas = ({ 
  meetingId, 
  userRole = 'MODERATOR',
  onActivityComplete,
  onError 
}) => {
  const [activityId, setActivityId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set isModerator in localStorage based on BBB role
    // localStorage.setItem('isModerator', userRole === 'MODERATOR' ? 'true' : 'false');
    
    // Fetch activity ID based on meeting ID
    const fetchActivityId = async () => {
      try {
        // This would be your API call to get activity ID from meeting ID
        const response = await fetch(`/api/meeting/${meetingId}/activity`);
        const data = await response.json();
        setActivityId(data.activityId);
      } catch (error) {
        console.error('Failed to fetch activity ID:', error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchActivityId();
    }
  }, [meetingId, userRole, onError]);

  if (loading) {
    return (
      <div className="canvas-loading">
        <div className="loading-spinner">Loading activity...</div>
      </div>
    );
  }

  if (!activityId) {
    return (
      <div className="canvas-error">
        <div className="error-message">No activity found for this meeting.</div>
      </div>
    );
  }

  return (
    <CanvasContainer
      activityId={activityId}
      socketUrl={process.env.REACT_APP_SOCKET_URL}
      apiBaseUrl={process.env.REACT_APP_API_BASE_URL}
    />
  );
};