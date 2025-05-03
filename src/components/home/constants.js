// constants.js
// This file contains shared constants used across components

// Shape definitions
export const SHAPES = [
    {
      id: 'circle',
      name: 'Circle',
      svg: '<circle cx="50" cy="50" r="40" fill="white" stroke="black" stroke-width="2" />'
    },
    {
      id: 'rectangle',
      name: 'Rectangle',
      svg: '<rect x="10" y="10" width="80" height="50" fill="white" stroke="black" stroke-width="2" />'
    },
    {
      id: 'triangle',
      name: 'Triangle',
      svg: '<polygon points="50,10 90,90 10,90" fill="white" stroke="black" stroke-width="2" />'
    },
    {
      id: 'star',
      name: 'Star',
      svg: '<path d="M50,10 L61,35 L89,35 L67,53 L78,78 L50,63 L22,78 L33,53 L11,35 L39,35 Z" fill="white" stroke="black" stroke-width="2" />'
    },
    {
      id: 'heart',
      name: 'Heart',
      svg: '<path d="M50,80 C35,60 0,50 0,20 C0,0 25,0 40,15 C45,20 50,25 50,25 C50,25 55,20 60,15 C75,0 100,0 100,20 C100,50 65,60 50,80 Z" fill="white" stroke="black" stroke-width="2" />'
    },
    {
      id: 'flower',
      name: 'Flower',
      svg: '<g><circle cx="50" cy="50" r="20" fill="white" stroke="black" stroke-width="2"/><circle cx="30" cy="30" r="15" fill="white" stroke="black" stroke-width="2"/><circle cx="70" cy="30" r="15" fill="white" stroke="black" stroke-width="2"/><circle cx="30" cy="70" r="15" fill="white" stroke="black" stroke-width="2"/><circle cx="70" cy="70" r="15" fill="white" stroke="black" stroke-width="2"/></g>'
    }
  ];
  
  // Predefined colors
  export const PRESET_COLORS = [
    { name: 'Red', value: '#FF5252' },
    { name: 'Blue', value: '#4285F4' },
    { name: 'Green', value: '#0F9D58' },
    { name: 'Yellow', value: '#FFEB3B' },
    { name: 'Purple', value: '#9C27B0' },
    { name: 'Orange', value: '#FF9800' },
    { name: 'Pink', value: '#E91E63' },
    { name: 'Cyan', value: '#00BCD4' },
  ];
  
  // Helper to create a unique ID for elements
  export const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;