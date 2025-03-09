import * as THREE from 'three';
import { TreePointCloud } from './TreePointCloud.js';
import { CameraController } from './CameraController.js';
import { LoadingAnimation } from './loading.js';
import { Environment } from './Environment.js';
import { ControlsOverlay } from './controls-overlay.js';


// Initialize loading animation
const loadingAnimation = new LoadingAnimation();
loadingAnimation.init();

// Create controls overlay
const controlsOverlay = new ControlsOverlay();

// Create scene but don't display it yet
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// Camera and renderer setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Set a further initial camera position
const INITIAL_CAMERA_POSITION = new THREE.Vector3(0, 40, 70);
camera.position.copy(INITIAL_CAMERA_POSITION);
camera.lookAt(0, 80, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Create a container for the 3D scene that starts invisible
const sceneContainer = document.createElement('div');
sceneContainer.id = 'scene-container';
sceneContainer.style.opacity = '0';
sceneContainer.style.transition = 'opacity 1s ease-in';
sceneContainer.appendChild(renderer.domElement);
document.body.appendChild(sceneContainer);

// Initialize camera controller with initial position
const cameraController = new CameraController(camera, renderer.domElement, INITIAL_CAMERA_POSITION);

// Add maximum zoom out limit
cameraController.setZoomLimits(5, 200); // Min distance 5, Max distance 200

// Prevent spacebar from resetting camera
window.addEventListener('keydown', function(e) {
    // If the key pressed is spacebar (keyCode 32)
    if (e.code === 'Space') {
        // Prevent the default action
        e.preventDefault();
    }
});

// Add environment (ground and lighting)
const environment = new Environment();
scene.add(environment.group);

// Create tree point cloud with custom point positions
const tree = new TreePointCloud({
    height: 5,
    radiusBase: 0.5,
    branchLevels: 5,
    pointsPerLevel: 2000,
    colorVariation: 0.3,
    baseColor: 0x2E8B57,
    modelPath:'models/tree.obj', 
    pointSize: 0.15,
    customPointPositions: [
        { x: -2.0, y: 34.5, z: 0.0 },    // Point 1
        { x: -1.8, y: 23.2, z: 1.5 },   // Point 2
        { x: 0.5, y: 35.5, z: -1.0 },   // Point 3
        { x: 1.2, y: 22.8, z: 2.2 },    // Point 4
        { x: 1.0, y: 14.0, z: 0 }   // Point 5
    ]
});

scene.add(tree.points);


// Set callback to fade in the scene when loading completes
loadingAnimation.setOnComplete(() => {
    // Fade in the scene
    sceneContainer.style.opacity = '1';
    

    
    // Show controls overlay after the scene fades in
    setTimeout(() => {
        controlsOverlay.show(3000); // Show for 3 seconds
    }, 500); // Slight delay after scene appears
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Only animate tree if it's fully loaded
    if (tree.points.children.length > 0) {
        // Call update method which handles both animation and interaction
        tree.update(camera);
    }
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});