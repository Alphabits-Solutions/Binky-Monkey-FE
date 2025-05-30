// Simplified Three.js utilities for kids canvas
import * as THREE from 'three';

// Simple ModelViewer class for kids canvas
export class ModelViewer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      autoRotate: false,
      background: null,
      ...options
    };
    
    this.scene = new THREE.Scene();
    this.renderer = this.createRenderer();
    this.camera = this.createCamera();
    this.model = null;
    this.isAnimating = false;
    this.clock = new THREE.Clock();
    
    this.setupLights();
    this.setupBackground();
    
    // Handle resize
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }
  
  createRenderer() {
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    const width = this.container.clientWidth || 150;
    const height = this.container.clientHeight || 150;
    renderer.setSize(width, height);
    this.container.appendChild(renderer.domElement);
    
    return renderer;
  }
  
  createCamera() {
    const width = this.container.clientWidth || 150;
    const height = this.container.clientHeight || 150;
    const aspect = width / height;
    
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);
    return camera;
  }
  
  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 2, 3);
    this.scene.add(directionalLight);
    
    // Secondary light
    const secondaryLight = new THREE.DirectionalLight(0xffffff, 0.5);
    secondaryLight.position.set(-1, 0.5, -3);
    this.scene.add(secondaryLight);
  }
  
  setupBackground() {
    if (this.options.background) {
      if (this.options.background.startsWith('#')) {
        this.scene.background = new THREE.Color(this.options.background);
      }
    }
  }
  
  async loadModel(url) {
    try {
      if (this.model) {
        this.scene.remove(this.model);
        this.model = null;
      }
      
      // Use a simple approach - load GLTF with basic loader
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      
      return new Promise((resolve, reject) => {
        loader.load(
          url,
          (gltf) => {
            this.model = gltf.scene;
            
            // Center and scale the model
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Center the model
            this.model.position.x = -center.x;
            this.model.position.y = -center.y;
            this.model.position.z = -center.z;
            
            // Auto-scale to fit
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) {
              const scale = 1.0 / maxDim;
              this.model.scale.set(scale, scale, scale);
            }
            
            this.scene.add(this.model);
            this.startAnimation();
            resolve(this.model);
          },
          (progress) => {
            // Progress callback
          },
          (error) => {
            console.error('Error loading model:', error);
            this.createFallbackModel();
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('Error in loadModel:', error);
      this.createFallbackModel();
      throw error;
    }
  }
  
  createFallbackModel() {
    // Create a simple cube as fallback
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      roughness: 0.5,
      metalness: 0.5
    });
    this.model = new THREE.Mesh(geometry, material);
    this.scene.add(this.model);
    this.startAnimation();
  }
  
  setModelRotation(x, y, z) {
    if (this.model) {
      this.model.rotation.set(
        THREE.MathUtils.degToRad(x),
        THREE.MathUtils.degToRad(y),
        THREE.MathUtils.degToRad(z)
      );
    }
  }
  
  setModelScale(scale) {
    if (this.model) {
      this.model.scale.set(scale, scale, scale);
      
      // Adjust camera distance based on scale
      if (scale > 2) {
        this.camera.position.set(6, 6, 6);
      } else {
        this.camera.position.set(3, 3, 3);
      }
      
      this.camera.lookAt(0, 0, 0);
    }
  }
  
  startAnimation() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }
  
  animate = () => {
    if (!this.isAnimating) return;
    
    requestAnimationFrame(this.animate);
    
    // Optional auto-rotation
    if (this.options.autoRotate && this.model) {
      this.model.rotation.y += 0.01;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  stopAnimation() {
    this.isAnimating = false;
  }
  
  handleResize() {
    if (!this.container) return;
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    if (width > 0 && height > 0) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }
  
  dispose() {
    this.stopAnimation();
    window.removeEventListener('resize', this.handleResize);
    
    if (this.renderer && this.renderer.domElement) {
      if (this.container && this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
    
    // Dispose of Three.js resources
    if (this.model) {
      this.scene.remove(this.model);
      this.model.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

// Helper function to create model thumbnail (simplified version)
export const createModelThumbnail = async (modelUrl, size = 150) => {
  try {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.width = `${size}px`;
    container.style.height = `${size}px`;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);
    
    // Create viewer
    const viewer = new ModelViewer(container);
    
    // Load model
    await viewer.loadModel(modelUrl);
    
    // Wait a bit for rendering
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get data URL
    const dataUrl = viewer.renderer.domElement.toDataURL('image/png');
    
    // Clean up
    viewer.dispose();
    document.body.removeChild(container);
    
    return dataUrl;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    // Return a placeholder image data URL
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+M0QgTW9kZWw8L3RleHQ+PC9zdmc+';
  }
};