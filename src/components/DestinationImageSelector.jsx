// Create a new component: DestinationImageSelector.jsx in your components folder

import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Spin, message } from 'antd';
import { getAllAssets } from '../services/api';
import { AppContext } from '../context/AppContext';

const DestinationImageSelector = ({ 
  visible, 
  onClose, 
  onSelect, 
  currentDestination 
}) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(currentDestination);

  useEffect(() => {
    if (visible) {
      fetchAssets();
    }
  }, [visible]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await getAllAssets();
      // Filter only images (not videos)
      const imageAssets = (response || []).filter(asset => 
        asset.filePath && 
        asset.filePath.match(/\.(jpeg|jpg|png|gif|webp)$/i)
      );
      setAssets(imageAssets);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      message.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedAsset) {
      onSelect(selectedAsset);
      onClose();
    } else {
      message.warning('Please select a destination image');
    }
  };

  const handleRemove = () => {
    onSelect(null); // Remove destination image
    onClose();
  };

  return (
    <Modal
      title="Select Destination Image"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="remove" onClick={handleRemove} danger>
          Remove Destination
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="select" 
          type="primary" 
          onClick={handleSelect}
          disabled={!selectedAsset}
        >
          Set as Destination
        </Button>,
      ]}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <p>Loading images...</p>
        </div>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
            gap: '12px',
            padding: '10px'
          }}>
            {assets.map((asset) => (
              <div
                key={asset._id}
                onClick={() => setSelectedAsset(asset)}
                style={{
                  border: selectedAsset?._id === asset._id ? '3px solid #1890ff' : '2px solid #d9d9d9',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: selectedAsset?._id === asset._id ? '#f0f8ff' : 'white',
                  boxShadow: selectedAsset?._id === asset._id ? '0 4px 12px rgba(24, 144, 255, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <img
                  src={asset.filePath}
                  alt={asset.fileName || 'Asset'}
                  style={{
                    width: '100%',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginBottom: '4px'
                  }}
                />
                <p style={{
                  fontSize: '11px',
                  margin: 0,
                  textAlign: 'center',
                  color: '#666',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {asset.fileName || 'Unnamed'}
                </p>
              </div>
            ))}
          </div>
          
          {assets.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <p>No images available. Upload some images first.</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default DestinationImageSelector;