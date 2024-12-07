// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Create a Three.JS Scene
const scene = new THREE.Scene();

// Create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Keep track of the mouse position, so we can make the eye move
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Keep the 3D object on a global variable so we can access it later
let object;

// OrbitControls allow the camera to move around the scene
let controls;

// Set which object to render
let objToRender = 'rocket';

// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

// Load the file
loader.load(
  `models/${objToRender}/scene.gltf`,
  function (gltf) {
    // If the file is loaded, add it to the scene
    object = gltf.scene;
    scene.add(object);
    object.lookAt(new THREE.Vector3(0,1,0));
  },
  function (xhr) {
    // While it is loading, log the progress
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    // If there is an error, log it
    console.error(error);
  }
);

// Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true }); // Alpha: true allows for the transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

// Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);

// Set how far the camera will be from the 3D model
camera.position.z = objToRender === "rocket" ? 25 : 500;

// Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
topLight.position.set(500, 500, 500); // top-left-ish
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, objToRender === "rocket" ? 5 : 1);
scene.add(ambientLight);

// This adds controls to the camera, so we can rotate / zoom it with the mouse
if (objToRender === "rocket") {
  controls = new OrbitControls(camera, renderer.domElement);
}

// Load the floor texture (one of the skybox images)
const floorTexture = new THREE.TextureLoader().load('skybox/front.png');  // Using the front skybox image as the floor texture
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;  // Repeat the texture for the floor
floorTexture.repeat.set(10, 10);  // Adjust the repetition to cover a larger area

// Create the floor plane
const floorGeometry = new THREE.PlaneGeometry(100, 100);  // Large plane to serve as the floor
const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);

// Rotate the floor to lie flat (XZ plane) and position it at y = -1
floor.rotation.x = -Math.PI / 2;  // This ensures the floor lies on the XZ plane
floor.position.y = -0.75;  // Position the floor below the rocket
scene.add(floor);

// Create axes helper (size 10 is arbitrary, adjust if needed)
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

// Add labels for axes (x, y, z)
// Create text labels for each axis (X, Y, Z)
const loaderFont = new THREE.FontLoader();
loaderFont.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
  
  const createText = (text, position) => {
    const geometry = new THREE.TextGeometry(text, {
      font: font,
      size: 5,
      height: 1,
    });
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);
    scene.add(mesh);
  };
  
  // Add X, Y, Z labels
  createText('X', new THREE.Vector3(10, 5, 0));
  createText('Y', new THREE.Vector3(0, 10, 0));
  createText('Z', new THREE.Vector3(0, 0, 10));
});

/// Variables for controlling rocket movement
let moveSpeed = 0.1; // Speed at which the rocket moves
let rocketVelocity = new THREE.Vector3(0, 0, 0); // Velocity vector to control movement

// Key press logic for setting velocity
document.onkeydown = (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "w":
    case "W":
      rocketVelocity.z = -moveSpeed; // Forward
      break;
    case "ArrowDown":
    case "s":
    case "S":
      rocketVelocity.z = moveSpeed; // Backward
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      rocketVelocity.x = -moveSpeed; // Left
      break;
    case "ArrowRight":
    case "d":
    case "D":
      rocketVelocity.x = moveSpeed; // Right
      break;
  }
};

// Key release logic to stop movement
document.onkeyup = (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "w":
    case "W":
    case "ArrowDown":
    case "s":
    case "S":
      rocketVelocity.z = 0; // Stop forward/backward movement
      break;
    case "ArrowLeft":
    case "a":
    case "A":
    case "ArrowRight":
    case "d":
    case "D":
      rocketVelocity.x = 0; // Stop left/right movement
      break;
  }
};

// Update the animate function
function animate() {
  requestAnimationFrame(animate);

  // Apply velocity to the rocket's position for smooth movement
  if (object) {
    object.position.add(rocketVelocity); // Increment position by velocity each frame

    // Update camera position relative to the rocket
    const targetPosition = new THREE.Vector3(
      object.position.x + 10, // X position relative to rocket
      object.position.y + 4,  // Y position relative to rocket
      object.position.z + 10  // Z position relative to rocket
    );

    camera.position.lerp(targetPosition, 0.05); // Smoothly follow the rocket
    camera.lookAt(object.position); // Make camera always look at the rocket
  }

  // Render the scene
  renderer.render(scene, camera);
}

// Start the animation loop
animate();

// Add a listener to the window, so we can resize the window and the camera
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add mouse position listener, so we can make the eye move
document.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}

// Start the 3D rendering
animate();
