// src/utils/threeDUtils.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Global loader for reuse
const gltfLoader = new GLTFLoader();

// Create a renderer for a container
export const createRenderer = (container) => {
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true, 
    preserveDrawingBuffer: true 
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  
  // Set size based on container
  if (container) {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
  }
  
  return renderer;
};

// Load a GLTF/GLB model
export const loadGLTFModel = (url, onProgress = null) => {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => {
        resolve(gltf);
      },
      (progress) => {
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error('Error loading 3D model:', error);
        reject(error);
      }
    );
  });
};

// Create a ThreeJS scene with a model
export const createSceneWithModel = (model, settings = {}) => {
  const scene = new THREE.Scene();
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 2, 3);
  scene.add(directionalLight);
  
  // Add model to scene
  scene.add(model);
  
  // Center the model
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  
  // Adjust scale if needed
  if (settings.scale) {
    model.scale.set(settings.scale, settings.scale, settings.scale);
  } else {
    // Auto-scale to fit a standard size
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scale = 1.0 / maxDim;
      model.scale.set(scale, scale, scale);
    }
  }
  
  return scene;
};

// Create a camera for the scene
export const createCamera = (aspect = 1, position = { x: 3, y: 3, z: 3 }) => {
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  camera.position.set(position.x, position.y, position.z);
  return camera;
};

// Create orbit controls for camera
export const createControls = (camera, canvas) => {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 1.5;
  controls.minDistance = 1;
  controls.maxDistance = 10;
  return controls;
};

// Create a preview thumbnail of a 3D model
export const createModelThumbnail = async (modelUrl, size = 150) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create container
      const container = document.createElement('div');
      container.style.width = `${size}px`;
      container.style.height = `${size}px`;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);
      
      // Create renderer
      const renderer = createRenderer(container);
      
      // Load model
      const gltf = await loadGLTFModel(modelUrl);
      const model = gltf.scene;
      
      // Create scene
      const scene = createSceneWithModel(model);
      
      // Create camera
      const camera = createCamera(1);
      camera.position.set(2, 2, 2);
      camera.lookAt(0, 0, 0);
      
      // Render the scene
      renderer.render(scene, camera);
      
      // Get the data URL
      const dataUrl = renderer.domElement.toDataURL('image/png');
      
      // Clean up
      document.body.removeChild(container);
      
      resolve(dataUrl);
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      reject(error);
    }
  });
};

// Helper to create a simple default model when loading fails
export const createDefaultModel = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x808080,
    roughness: 0.5,
    metalness: 0.5
  });
  return new THREE.Mesh(geometry, material);
};

// Create a self-contained 3D viewer component
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
    this.controls = this.createControls();
    this.model = null;
    
    this.setupLights();
    this.setupBackground();
    
    this.isAnimating = false;
    this.clock = new THREE.Clock();
    
    // Handle resize
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
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    renderer.setSize(width, height);
    this.container.appendChild(renderer.domElement);
    
    return renderer;
  }
  
  createCamera() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;
    
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(3, 3, 3);
    return camera;
  }
  
  createControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.autoRotate = this.options.autoRotate;
    controls.autoRotateSpeed = 2.0;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    return controls;
  }
  
  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);
    
    // Directional light (sun-like)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 2, 3);
    this.scene.add(directionalLight);
    
    // Add a secondary light from another angle
    const secondaryLight = new THREE.DirectionalLight(0xffffff, 0.5);
    secondaryLight.position.set(-1, 0.5, -3);
    this.scene.add(secondaryLight);
  }
  
  setupBackground() {
    if (this.options.background) {
      if (this.options.background.startsWith('#')) {
        // Hex color
        this.scene.background = new THREE.Color(this.options.background);
      } else {
        // Texture background
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(this.options.background, (texture) => {
          this.scene.background = texture;
        });
      }
    }
  }
  
  async loadModel(url) {
    try {
      if (this.model) {
        // Remove existing model
        this.scene.remove(this.model);
        this.model = null;
      }
      
      const gltf = await loadGLTFModel(url);
      this.model = gltf.scene;
      
      // Center the model
      const box = new THREE.Box3().setFromObject(this.model);
      const center = box.getCenter(new THREE.Vector3());
      this.model.position.x = -center.x;
      this.model.position.y = -center.y;
      this.model.position.z = -center.z;
      
      // Auto-scale to fit
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const scale = 1.0 / maxDim;
        this.model.scale.set(scale, scale, scale);
      }
      
      this.scene.add(this.model);
      this.startAnimation();
      
      // Look at the center of the model
      this.camera.lookAt(0, 0, 0);
      
      return this.model;
    } catch (error) {
      console.error('Error loading model:', error);
      
      // Create a default model
      this.model = createDefaultModel();
      this.scene.add(this.model);
      this.startAnimation();
      
      throw error;
    }
  }
  
  setModelPosition(x, y, z) {
    if (this.model) {
      this.model.position.set(x, y, z);
    }
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

       // Adjust the camera to ensure model is visible at any scale
    if (scale > 2) {
        this.camera.position.set(6, 6, 6); // Increase camera distance for larger models
      } else {
        this.camera.position.set(3, 3, 3); // Default camera position
      }
      
      // Update controls
      this.controls.update();
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
    
    const delta = this.clock.getDelta();
    this.controls.update(delta);
    
    this.renderer.render(this.scene, this.camera);
  }
  
  stopAnimation() {
    this.isAnimating = false;
  }
  
  handleResize = () => {
    if (!this.container) return;
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  dispose() {
    this.stopAnimation();
    window.removeEventListener('resize', this.handleResize);
    
    if (this.renderer && this.renderer.domElement) {
      if (this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
    
    // Dispose of THREE.js resources
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
    
    this.controls.dispose();
    this.renderer.dispose();
  }
}