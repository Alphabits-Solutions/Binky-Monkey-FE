import React from 'react';
import { Badge, Tooltip } from 'antd';
import { 
  WifiOutlined, 
  DisconnectOutlined, 
  LoadingOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';

const ConnectionStatus = ({ isConnected, reconnecting, error }) => {
  const getStatusConfig = () => {
    if (error) {
      return {
        status: 'error',
        color: '#ff4d4f',
        icon: <ExclamationCircleOutlined />,
        text: 'Connection Error',
        description: error
      };
    }
    
    if (reconnecting) {
      return {
        status: 'processing',
        color: '#faad14',
        icon: <LoadingOutlined spin />,
        text: 'Reconnecting...',
        description: 'Attempting to reconnect to server'
      };
    }
    
    if (isConnected) {
      return {
        status: 'success',
        color: '#52c41a',
        icon: <WifiOutlined />,
        text: 'Connected',
        description: 'Real-time sync active'
      };
    }
    
    return {
      status: 'default',
      color: '#d9d9d9',
      icon: <DisconnectOutlined />,
      text: 'Disconnected',
      description: 'No connection to server'
    };
  };

  const { status, color, icon, text, description } = getStatusConfig();

  return (
    <div 
      className="connection-status"
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1002,
        padding: '8px 12px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: `1px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease'
      }}
    >
      <Badge status={status} />
      <div style={{ color, fontSize: '14px' }}>
        {icon}
      </div>
      <Tooltip title={description}>
        <span style={{ 
          fontSize: '12px', 
          fontWeight: 500,
          color: status === 'success' ? '#52c41a' : 
                 status === 'error' ? '#ff4d4f' : 
                 status === 'processing' ? '#faad14' : '#8c8c8c'
        }}>
          {text}
        </span>
      </Tooltip>
    </div>
  );
};

export default ConnectionStatus;