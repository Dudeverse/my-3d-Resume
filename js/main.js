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

// Keep the 3D object on a global variable so we can access it later
let object;

let controls;
// Set which object to render
let objToRender = 'rocket';

// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();
let clock = new THREE.Clock(); // To track time
let fire; // Variable to hold fire object

// Load the file
loader.load(
  `models/${objToRender}/scene.gltf`,
  function (gltf) {
    // If the file is loaded, add it to the scene
    object = gltf.scene;
    scene.add(object);

    //object.position.set(0,0,0)
    //object.rotation.set(-Math.PI/2 , 0, 0)
    const fireLoader = new GLTFLoader();
    fireLoader.load(
      'models/fire/scene.gltf',
    function (gltf) {
      fire = gltf.scene;
      fire.position.set(0, 0, 0);
      fire.rotation.set(Math.PI , 0, 0); // Adjust the position under the rocket
      fire.scale.set(0.5, 1, 1);
      object.add(fire); // Attach the fire to the rocket object
      fire.visible = false; 
    },
    undefined,
    function (error) {
    console.error(error);
  }
);
    //object.lookAt(new THREE.Vector3(0,0,1));
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

let moveSpeed = 0.025; // Acceleration rate
let maxSpeed = 1; // Maximum velocity
let rocketVelocity = new THREE.Vector3(0, 0, 0); // Current velocity
let rocketAcceleration = new THREE.Vector3(0, 0, 0); // Current acceleration
let targetQuaternion = new THREE.Quaternion(); // To store the target direction

// Function to update the rocket's direction (set facing direction)
function setRocketDirection(direction) {
  if (object) {
    const upVector = new THREE.Vector3(0, 1, 0); // Default up direction
    const lookVector = direction.clone().normalize(); // Normalize the direction vector

    // Calculate the target quaternion for the new direction
    targetQuaternion = new THREE.Quaternion().setFromUnitVectors(upVector, lookVector);
  }
}

function whoOSH() {
  if (fire) {
    fire.visible = true;  // Show fire when moving forward
    if (!sound.isPlaying) {
      sound.play();  // Start sound when moving forward
    }
  }
}

function shwup() {
  if (fire) fire.visible = false; // Hide fire when not moving
      if (sound.isPlaying) {
        sound.stop();  // Stop sound when key is released
      }
}
let spinSpeed=0.25
// Key press logic for setting acceleration
document.onkeydown = (e) => {
  switch (e.key) {
    case "w":
    case "W":
      rocketAcceleration.z = -moveSpeed; // Accelerate forward
      setRocketDirection(new THREE.Vector3(0, 0, -1));
      //spinRocket(new THREE.Vector3(0, 0, -1))
      whoOSH();
      break;
    case "s":
    case "S":
      rocketAcceleration.z = moveSpeed; // Accelerate backward
      setRocketDirection(new THREE.Vector3(0, 0, 1));
      
      whoOSH();
      break;
    case "a":
    case "A":
      rocketAcceleration.x = -moveSpeed; // Accelerate left
      setRocketDirection(new THREE.Vector3(-1, 0, 0));
      
      whoOSH();
      break;
    case "d":
    case "D":
      rocketAcceleration.x = moveSpeed; // Accelerate right
      setRocketDirection(new THREE.Vector3(1, 0, 0)); // Point rocket right
      
      whoOSH();
      break;
    case "ArrowUp":
      rocketAcceleration.y = moveSpeed; // Accelerate up
      //setRocketDirection(new THREE.Vector3(0, 1, 0));
      whoOSH();
      break;
    case "ArrowDown":
      rocketAcceleration.y = -moveSpeed; // Accelerate down
      //setRocketDirection(new THREE.Vector3(0, -1, 0));
      whoOSH();
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
      shwup();
      break;
    case "a":
    case "A":
    case "d":
    case "D":
      rocketAcceleration.x = 0; // Stop left/right acceleration
      
      shwup();
      break;
    case "ArrowUp":
    case "ArrowDown":
      rocketAcceleration.y = 0; // Stop up/down acceleration
      shwup();
      break;
  }
};





function createBillboard(title, description, position) {
  const loaderFont = new THREE.FontLoader();

  loaderFont.load(
    'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    function (font) {
      // Create the text geometry and material for the title
      const titleGeometry = new THREE.TextGeometry(title, {
        font: font,
        size: 2, // Adjust size as needed
        height: 0.5, // Extrude depth for text
      });
      const titleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFE62D, // Regular color for the text
        //emissive: 0x00ffff, // Emissive color to simulate glow
        //emissiveIntensity: 1, // Intensity of the glow effect
      });
      const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);

      // Adjust title position relative to billboard
      titleMesh.position.set(-10, 5, 0);

      // Create the text geometry and material for the description
      const descGeometry = new THREE.TextGeometry(description, {
        font: font,
        size: 1, // Smaller size for description
        height: 0.2,
      });
      const descMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFD4499, // Regular color for the description
        emissive: 0xff00ff, // Emissive color to simulate glow
        emissiveIntensity: 1, // Intensity of the glow effect
      });
      const descMesh = new THREE.Mesh(descGeometry, descMaterial);

      // Adjust description position relative to billboard
      descMesh.position.set(-10, 2, 0);

      // Create a plane to serve as the billboard background
      const planeGeometry = new THREE.PlaneGeometry(30, 15); // Adjust size as needed
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0
      });
      const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

      // Attach the text to the billboard
      planeMesh.add(titleMesh);
      planeMesh.add(descMesh);

      // Position the billboard at the specified location
      const billboardPosition = new THREE.Vector3(position.x, position.y, position.z);
      planeMesh.position.copy(billboardPosition);
      // Add a point light to enhance the glow effect (optional)
      const pointLight = new THREE.PointLight(0x00ffff, 1, 50); // Light color and intensity
      pointLight.position.set(billboardPosition.x, billboardPosition.y, billboardPosition.z);
      scene.add(pointLight);
      // Make the billboard face the camera
      //planeMesh.lookAt(camera.position);

      // Add the billboard to the scene
      scene.add(planeMesh);

      // Store initial distance
      planeMesh.cameraDistance = billboardPosition.distanceTo(camera.position);

      // Set custom properties
      planeMesh.initialOpacity = 0.01; // Initial dim state
      planeMesh.maxOpacity = 1.0; // Fully visible state
      planeMesh.minDistance = 10; // Distance at which it becomes fully visible
      planeMesh.maxDistance = 50; // Distance at which it becomes fully dim
      // Add the billboard to an array for easier management during animation
      billboards.push(planeMesh);

    }
  );
}
// Flickering effect: Randomly change emissive intensity at regular intervals
function flickerEffect() {
  titleMaterial.emissiveIntensity = Math.random() * (1.5 - 0.5) + 0.5;
  descMaterial.emissiveIntensity = Math.random() * (1.5 - 0.5) + 0.5;
}
// In your animatio

// Example usage
createBillboard("2020: Rocket Launch", "Started working on intergalactic systems.", { x: 50, y: 0, z: -100 });
createBillboard("2024: Rocket Launch", "Started working on intergalactic systems.", { x: 0, y: 0, z: -200 });
createBillboard("2020: Rocket Launch", "Started working on intergalactic systems.", { x: 50, y: 0, z: -300 });
createBillboard("2024: Rocket Launch", "Started working on intergalactic systems.", { x: 0, y: 0, z: -400 });
createBillboard("2020: Rocket Launch", "Started working on intergalactic systems.", { x: 50, y: 0, z: -500 });
createBillboard("2024: Rocket Launch", "Started working on intergalactic systems.", { x: 0, y: 0, z: -600 });
let billboards = []; // Global array to store billboard meshes


const fireRotationSpeed = 0.25
const listener = new THREE.AudioListener();
camera.add(listener);  // Attach the listener to the camera (or any other object)

// Create an Audio object
const sound = new THREE.Audio(listener);

// Load a sound file (replace with your own sound URL)
const audioLoader = new THREE.AudioLoader();
audioLoader.load('sfx/burning.wav', function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);   // Set to loop if you want continuous sound
  sound.setVolume(0.4);  // Set volume (0.0 to 1.0)
  //sound.play();          // Play the sound
});

function animate() {
  requestAnimationFrame(animate);

  if (object) {
    object.quaternion.slerp(targetQuaternion, 0.4);
    // Update velocity and position based on input (keep this logic as it is)
    rocketVelocity.add(rocketAcceleration);
    rocketVelocity.x = THREE.MathUtils.clamp(rocketVelocity.x, -maxSpeed, maxSpeed);
    rocketVelocity.z = THREE.MathUtils.clamp(rocketVelocity.z, -maxSpeed, maxSpeed);
    object.position.add(rocketVelocity);
    camera.position.add(rocketVelocity);
    rocketVelocity.multiplyScalar(0.98);
    // Smoothly follow the rocket with the camera
    const targetPosition = new THREE.Vector3(
      object.position.x + 4, 
      object.position.y + 4,  
      object.position.z + 10  
    );
    camera.position.lerp(targetPosition, 0.09);

    let elapsedTime = clock.getElapsedTime();

    if (fire) {
      // Set the minimum and maximum scale values
      let minScale = 0.20; // Minimum scale value
      let maxScale = 0.23; // Maximum scale value
  
      // Create a sinusoidal factor to scale the object
      let scaleFactor = minScale + (maxScale - minScale) * (0.5 * Math.sin(elapsedTime * 10) + 0.5);
  
      // Apply the scale factor to all axes (X, Y, Z)
      fire.scale.set(scaleFactor, scaleFactor*2, scaleFactor*2);

      fire.rotation.y += fireRotationSpeed
      sound.position.set(fire.position.x, fire.position.y, fire.position.z);
    }
  }
  renderer.render(scene, camera);
}

// Start the 3D rendering
animate();
