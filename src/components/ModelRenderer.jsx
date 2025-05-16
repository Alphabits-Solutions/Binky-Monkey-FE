// src/components/ModelRenderer.jsx
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ModelRenderer = ({
  modelUrl,
  width,
  height,
  rotation,
  scale,
  cameraPosition,
  cameraRotation,
  cameraZoom,
  ambientLightIntensity,
  directionalLightIntensity,
  animationEnabled,
  currentAnimation,
  animationSpeed,
  previewMode,
  onLoad
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationMixerRef = useRef(null);
  const modelRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const animationsRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any existing scene/renderer
    if (rendererRef.current) {
      containerRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      45, // Field of view
      width / height, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.rotation.set(
      THREE.MathUtils.degToRad(cameraRotation.x),
      THREE.MathUtils.degToRad(cameraRotation.y),
      THREE.MathUtils.degToRad(cameraRotation.z)
    );
    camera.zoom = cameraZoom;
    camera.updateProjectionMatrix();
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, directionalLightIntensity);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add controls if in preview mode
    if (previewMode) {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.enableZoom = true;
      controls.maxDistance = 50;
      controlsRef.current = controls;
    }

    // Add grid helper
    const gridHelper = new THREE.GridHelper(10, 10);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update mixer for animations
      if (animationMixerRef.current) {
        const delta = clockRef.current.getDelta();
        animationMixerRef.current.update(delta);
      }

      // Update controls if they exist
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Update model rotation in preview mode
      if (previewMode && modelRef.current) {
        modelRef.current.rotation.y += 0.005;
      }

      // Render the scene
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup function
    return () => {
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, [width, height, cameraPosition, cameraRotation, cameraZoom, ambientLightIntensity, directionalLightIntensity, previewMode]);

  // Load the 3D model
  useEffect(() => {
    if (!modelUrl || !sceneRef.current) return;

    setIsLoading(true);
    setError(null);

    // Remove any existing model
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }

    const loader = new GLTFLoader();

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        
        // Apply scale
        model.scale.set(scale.x, scale.y, scale.z);
        
        // Apply rotation (in radians)
        model.rotation.set(
          THREE.MathUtils.degToRad(rotation.x),
          THREE.MathUtils.degToRad(rotation.y),
          THREE.MathUtils.degToRad(rotation.z)
        );

        // Traverse and set up materials
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        // Add to scene
        sceneRef.current.add(model);
        modelRef.current = model;

        // Set up animations if available
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          animationMixerRef.current = mixer;
          
          // Store all animations
          animationsRef.current = gltf.animations.map((animation) => {
            return mixer.clipAction(animation);
          });
          
          // Play the selected animation if enabled
          if (animationEnabled && currentAnimation < animationsRef.current.length) {
            const action = animationsRef.current[currentAnimation];
            action.setEffectiveTimeScale(animationSpeed);
            action.play();
          }
        }

        setIsLoading(false);
        if (onLoad) onLoad();
      },
      (progress) => {
        // Progress callback
        console.log(`Loading model: ${Math.round((progress.loaded / progress.total) * 100)}%`);
      },
      (error) => {
        console.error('Error loading model:', error);
        setError('Failed to load 3D model');
        setIsLoading(false);
      }
    );
  }, [modelUrl, scale, rotation, animationEnabled, currentAnimation, animationSpeed, onLoad]);

  // Update animation when settings change
  useEffect(() => {
    if (!animationEnabled || !animationMixerRef.current || animationsRef.current.length === 0) {
      return;
    }

    // Stop all animations
    animationsRef.current.forEach(action => action.stop());

    // Play the selected animation if it exists
    if (currentAnimation < animationsRef.current.length) {
      const action = animationsRef.current[currentAnimation];
      action.setEffectiveTimeScale(animationSpeed);
      action.play();
    }
  }, [animationEnabled, currentAnimation, animationSpeed]);

  // Update camera parameters if they change
  useEffect(() => {
    if (!cameraRef.current) return;

    cameraRef.current.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    cameraRef.current.rotation.set(
      THREE.MathUtils.degToRad(cameraRotation.x),
      THREE.MathUtils.degToRad(cameraRotation.y),
      THREE.MathUtils.degToRad(cameraRotation.z)
    );
    cameraRef.current.zoom = cameraZoom;
    cameraRef.current.updateProjectionMatrix();
    
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  }, [cameraPosition, cameraRotation, cameraZoom]);

  // Update model rotation if it changes
  useEffect(() => {
    if (!modelRef.current) return;

    modelRef.current.rotation.set(
      THREE.MathUtils.degToRad(rotation.x),
      THREE.MathUtils.degToRad(rotation.y),
      THREE.MathUtils.degToRad(rotation.z)
    );
  }, [rotation]);

  // Update model scale if it changes
  useEffect(() => {
    if (!modelRef.current) return;

    modelRef.current.scale.set(scale.x, scale.y, scale.z);
  }, [scale]);

  // Update lighting if it changes
  useEffect(() => {
    if (!sceneRef.current) return;

    // Update ambient light
    const ambientLight = sceneRef.current.children.find(child => child.isAmbientLight);
    if (ambientLight) {
      ambientLight.intensity = ambientLightIntensity;
    }

    // Update directional light
    const directionalLight = sceneRef.current.children.find(child => child.isDirectionalLight);
    if (directionalLight) {
      directionalLight.intensity = directionalLightIntensity;
    }
  }, [ambientLightIntensity, directionalLightIntensity]);

  return (
    <div ref={containerRef} style={{ width, height, position: 'relative' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(240, 240, 240, 0.7)',
          zIndex: 10
        }}>
          Loading model...
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(240, 240, 240, 0.7)',
          color: 'red',
          zIndex: 10
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ModelRenderer;