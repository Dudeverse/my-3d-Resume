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
    //object.lookAt(new THREE.Vector3(0,1,1));
    const loaderFont = new THREE.FontLoader();
    loaderFont.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
      const createText = (text, position) => {
        const geometry = new THREE.TextGeometry(text, {
          font: font,
          size: 0.5, // Small size for labels
          height: 0.05, // Thin text
        });
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        object.add(mesh); // Attach text to the rocket object
      };

      // Add X, Y, Z labels relative to the rocket's local axes
      createText('X', { x: 5, y: 0, z: 0 });
      createText('Y', { x: 0, y: 5, z: 0 });
      createText('Z', { x: 0, y: 0, z: 5 });
    });
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
const floorTexture = new THREE.TextureLoader().load('skybox/landing.jpg');  // Using the front skybox image as the floor texture
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

let moveSpeed = 0.02; // Acceleration rate
let maxSpeed = 1; // Maximum velocity
let rocketVelocity = new THREE.Vector3(0, 0, 0); // Current velocity
let rocketAcceleration = new THREE.Vector3(0, 0, 0); // Current acceleration

let rotationSpeed = 0.25; // Rotation speed (angle per frame)
let targetQuaternion = new THREE.Quaternion(); // To store the target direction

// A flag to track if the rocket is aligned to the target direction
let isAligned = false; 

// Function to update the rocket's direction (set facing direction)
function setRocketDirection(direction) {
  if (object) {
    const upVector = new THREE.Vector3(0, 1, 0); // Default up direction
    const lookVector = direction.clone().normalize(); // Normalize the direction vector

    // Calculate the target quaternion for the new direction
    targetQuaternion = new THREE.Quaternion().setFromUnitVectors(upVector, lookVector);
    //isAligned = false; // Reset alignment flag when we change direction
  }
}

// Key press logic for setting acceleration
document.onkeydown = (e) => {
  switch (e.key) {
    case "w":
    case "W":
      rocketAcceleration.z = -moveSpeed; // Accelerate forward
      setRocketDirection(new THREE.Vector3(0, 0, -1)); // Point rocket forward
      break;
    case "s":
    case "S":
      rocketAcceleration.z = moveSpeed; // Accelerate backward
      setRocketDirection(new THREE.Vector3(0, 0, 1)); // Point rocket backward
      break;
    case "a":
    case "A":
      rocketAcceleration.x = -moveSpeed; // Accelerate left
      setRocketDirection(new THREE.Vector3(-1, 0, 0)); // Point rocket left
      break;
    case "d":
    case "D":
      rocketAcceleration.x = moveSpeed; // Accelerate right
      setRocketDirection(new THREE.Vector3(1, 0, 0)); // Point rocket right
      break;
    case "ArrowUp":
      rocketAcceleration.y = moveSpeed; // Accelerate up
      setRocketDirection(new THREE.Vector3(0, 1, 0)); // Point rocket upward
      break;
    case "ArrowDown":
      rocketAcceleration.y = -moveSpeed; // Accelerate down
      setRocketDirection(new THREE.Vector3(0, -1, 0)); // Point rocket downward
      break;
  }
};

// Key release logic to stop acceleration
document.onkeyup = (e) => {
  switch (e.key) {
    case "w":
    case "W":
    case "s":
    case "S":
      rocketAcceleration.z = 0; // Stop forward/backward acceleration
      break;
    case "a":
    case "A":
    case "d":
    case "D":
      rocketAcceleration.x = 0; // Stop left/right acceleration
      break;
    case "ArrowUp":
    case "ArrowDown":
      rocketAcceleration.y = 0; // Stop up/down acceleration
      break;
  }
};

// function rotateObject() {
//   if (object) {
//     // Smoothly rotate the rocket towards the target direction
//      // 0.1 controls the rotation speed
//     // Check if the rocket is aligned with the target direction
//     if (object.quaternion.angleTo(targetQuaternion) < 0.1) {
//       isAligned = true; // Mark as aligned when the angle between the quaternions is small
//     }

//     // If the rocket is aligned, start spinning around its own axis
//     if (isAligned) {
//       // Get the current local axis to rotate around (e.g., z-axis in the rocket's local coordinate space)
//       let axis = object.getWorldDirection(new THREE.Vector3()); // Get the direction vector of the rocket

//       // Rotate around the axis perpendicular to the direction it's facing
//       // We'll apply the cross product of the up vector and the direction for the axis of rotation
//       const localAxis = new THREE.Vector3().crossVectors(new THREE.Vector3(1, 0, 0), axis).normalize(); 

//       // Apply the rotation around the local axis
//       object.rotateOnAxis(localAxis, rotationSpeed);
//     }
//   }
// }

function animate() {
  requestAnimationFrame(animate);

  if (object) {
    object.quaternion.slerp(targetQuaternion, 0.1);
    // Update velocity based on acceleration
    rocketVelocity.add(rocketAcceleration);

    // Clamp velocity to the maximum speed
    rocketVelocity.x = THREE.MathUtils.clamp(rocketVelocity.x, -maxSpeed, maxSpeed);
    rocketVelocity.z = THREE.MathUtils.clamp(rocketVelocity.z, -maxSpeed, maxSpeed);

    // Apply velocity to the rocket's position
    object.position.add(rocketVelocity);

    // Apply friction effect to slow down when no keys are pressed
    rocketVelocity.multiplyScalar(0.98);

    // Update the camera position to follow the rocket
    const targetPosition = new THREE.Vector3(
      object.position.x + 10, // X position relative to rocket
      object.position.y + 4,  // Y position relative to rocket
      object.position.z + 10  // Z position relative to rocket
    );
    camera.position.lerp(targetPosition, 0.05); // Smoothly follow the rocket
    camera.lookAt(object.position); // Make camera always look at the rocket
  }

  //rotateObject(); // Rotate based on targetQuaternion

  // Render the scene
  renderer.render(scene, camera);
}


// // Add a listener to the window, so we can resize the window and the camera
// window.addEventListener("resize", function () {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
// });

// // Add mouse position listener, so we can make the eye move
// document.onmousemove = (e) => {
//   mouseX = e.clientX;
//   mouseY = e.clientY;
// }

// Start the 3D rendering
animate();
