// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Create a Three.JS Scene
const scene = new THREE.Scene();

// Create a CubeTextureLoader for the skybox
const cubeTextureLoader = new THREE.CubeTextureLoader();
const spaceTextures = cubeTextureLoader.load([
  'skybox/front.png',  // Front face
  'skybox/back.png',   // Back face
  'skybox/left.png',   // Left face
  'skybox/right.png',  // Right face
  'skybox/top.png',    // Top face
  'skybox/bottom.png'  // Bottom face
]);

// Set the scene's background to the skybox
scene.background = spaceTextures;

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
    object.lookAt(new THREE.Vector3(1,9999, 0));
    // object.rotation.x = Math.PI / 2; // 45 degrees (upward angle)
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
const rocketSpeed = 0.1; // Adjust this for faster/slower movement
// Render the scene
// Variables for circles
const innerCircleRadius = 15; // Radius of the camera's path
const outerCircleRadius = 25; // Radius of the rocket's path
let angle = 0; // Angle to determine positions on the circles
const speed = 0.005; // Speed of the rotation


function animate() {
  requestAnimationFrame(animate);

  // Calculate positions of the rocket on the circle in the YZ plane
  const rocketX = outerCircleRadius * Math.cos(angle);
  const rocketZ = outerCircleRadius * Math.sin(angle);

  // Calculate the tangent direction (derivative of the circle equation)
  const tangentX = -Math.sin(angle); // Derivative of cos(angle)
  const tangentZ = Math.cos(angle);  // Derivative of sin(angle)

  // Set the rocket's position (circling around the camera in the YZ plane)
  if (object && objToRender === "rocket") {
    object.position.set(rocketX, 0, rocketZ); // Rocket moves in the YZ plane around the camera

    // Set the rocket's rotation to face tangentially to the circle
    const tangentVector = new THREE.Vector3(tangentX, 0, tangentZ).normalize();
    const upVector = new THREE.Vector3(0, 1, 0); // Y-axis is the up direction
    const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, tangentVector);
    object.setRotationFromQuaternion(quaternion);
  }

  // Keep the camera stationary at the center
  camera.position.set(0, 0, 0); // Camera stays at the center of the scene

  // Make the camera always look at the rocket
  camera.lookAt(rocketX, 0, rocketZ);

  // Update the angle for the next frame
  angle += speed;

  // Render the scene
  renderer.render(scene, camera);
}

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
