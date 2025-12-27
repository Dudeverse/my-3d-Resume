// ------------------------------------------------------------------//
//----------------------- 3D RESUME PROJECT--------------------------//
// ----------------------------BEGIN---------------------------------//


// Project: 3D Resume 
// Author: Surya Teja Ethalapaka


// ---------------------------AUTHOR DETAILS-------------------------//
// ----------------------------END-----------------------------------//
// ------------------------------------------------------------------//




// ------------------------------------------------------------------//
//----------------------- IMPORTS SECTION----------------------------//
// ----------------------------BEGIN---------------------------------//

import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


// ---------------------- IMPORTS SECTION----------------------------//
// ----------------------------END-----------------------------------//
// ------------------------------------------------------------------//




// ------------------------------------------------------------------//
//----------------------- SKYMAP SECTION-----------------------------//
// ----------------------------BEGIN---------------------------------//

const cubeTextureLoader = new THREE.CubeTextureLoader();
const spaceTextures = cubeTextureLoader.load([
  'skybox/front.png',  // Front face
  'skybox/back.png',   // Back face
  'skybox/left.png',   // Left face
  'skybox/right.png',  // Right face
  'skybox/top.png',    // Top face
  'skybox/bottom.png'  // Bottom face
]);
scene.background = spaceTextures;
// ---------------------- SKYMAP SECTION-----------------------------//
// ----------------------------END-----------------------------------//
// ------------------------------------------------------------------//




// ------------------------------------------------------------------//
//---------------- ROCKET + FIRE OBJECT SECTION----------------------//
// ----------------------------BEGIN---------------------------------//
let object;
let objToRender = 'rocket';
const loader = new GLTFLoader();
let clock = new THREE.Clock(); // To track time
let fire; // Variable to hold fire object
loader.load(
  `models/${objToRender}/scene.gltf`,
  function (gltf) {
    object = gltf.scene;
    scene.add(object);

    const fireLoader = new GLTFLoader();
    fireLoader.load(
      'models/fire/scene.gltf',
    function (gltf) {
      fire = gltf.scene;
      fire.position.set(0, 0, 0);
      fire.rotation.set(Math.PI , 0, 0); // Adjust the position under the rocket
      fire.scale.set(0.5, 1, 1);
      object.add(fire); // Attach the fire to the rocket object
      fire.visible = false; // no fire at t=0s
    },
    undefined,
    function (error) {
    console.error(error);
  }
);
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
//---------------- ROCKET + FIRE OBJECT SECTION----------------------//
// ----------------------------END-----------------------------------//
// ------------------------------------------------------------------//


// ------------------------------------------------------------------//
//------------------RENDERER, LIGHTS, FLOOR, AXES--------------------//
// ----------------------------BEGIN---------------------------------//

// Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ 
  alpha: true,
  antialias: false, // Disable antialiasing for better performance
  powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limit pixel ratio for performance

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
//-------------------------RENDERER, LIGHTS--------------------------//
// -----------------------------END----------------------------------//
// ------------------------------------------------------------------//



// ------------------------------------------------------------------//
//----------------------------FLOOR, AXES----------------------------//
// ----------------------------BEGIN---------------------------------//

// Load the floor texture (one of the skybox images)
const floorTexture = new THREE.TextureLoader().load('skybox/landing.jpg');  // Using the front skybox image as the floor texture
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;  // Repeat the texture for the floor
floorTexture.repeat.set(10, 10);  // Adjust the repetition to cover a larger area

const floorGeometry = new THREE.PlaneGeometry(20, 1000);  // Large plane to serve as the floor
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

//--------------------------FLOOR, AXES------------------------------//
// -----------------------------END----------------------------------//
// ------------------------------------------------------------------//


// ------------------------------------------------------------------//
//----------SET UP VELOCITY, ACCELERATION, DIRECTION QUATERNIONS-----//
// ----------------------------BEGIN---------------------------------//


let moveSpeed = 0.025; // Acceleration rate (increased for faster movement)
let maxSpeed = 1.5; // Maximum velocity (increased)
let rocketVelocity = new THREE.Vector3(0, 0, 0); // Current velocity
let rocketAcceleration = new THREE.Vector3(0, 0, 0); // Current acceleration
let targetQuaternion = new THREE.Quaternion(); // To store the target direction

// Separate tracking for keyboard and hand inputs
let keyboardInput = { x: 0, y: 0, z: 0 };
let handInput = { x: 0, y: 0, z: 0 };
let isKeyboardActive = false;
let isHandInputActive = false;

//---------SET UP VELOCITY, ACCELERATION, DIRECTION QUATERNIONS------//
// -----------------------------END----------------------------------//
// ------------------------------------------------------------------//

// ------------------------------------------------------------------//
//----------SOUNDS AND FIRE VISIBILITY-------------------------------//
// ----------------------------BEGIN---------------------------------//
const fireRotationSpeed = 0.25
const listener = new THREE.AudioListener();
camera.add(listener);  
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('sfx/burning.wav', function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);   // Set to loop if you want continuous sound
  sound.setVolume(0.4);  // Set volume (0.0 to 1.0)
});

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


//----------SOUNDS AND FIRE VISIBILITY-------------------------------//
// -----------------------------END----------------------------------//
// ------------------------------------------------------------------//



// ------------------------------------------------------------------//
//----------POINT TOWARDS THE  DIRECTION PRESSED---------------------//
// ----------------------------BEGIN---------------------------------//

// Function to update the rocket's direction (set facing direction)
function setRocketDirection(direction) {
  if (object) {
    const upVector = new THREE.Vector3(0, 1, 0); // Default up direction
    const lookVector = direction.clone().normalize(); // Normalize the direction vector

    // Calculate the target quaternion for the new direction
    targetQuaternion = new THREE.Quaternion().setFromUnitVectors(upVector, lookVector);
  }
}

// Key press logic for setting acceleration
document.onkeydown = (e) => {
  isKeyboardActive = true;
  switch (e.key) {
    case "w":
    case "W":
      keyboardInput.z = -moveSpeed; // Accelerate forward
      setRocketDirection(new THREE.Vector3(0, 0, -1));
      whoOSH();
      break;
    case "s":
    case "S":
      keyboardInput.z = moveSpeed; // Accelerate backward
      setRocketDirection(new THREE.Vector3(0, 0, 1));
      whoOSH();
      break;
    case "a":
    case "A":
      keyboardInput.x = -moveSpeed; // Accelerate left
      setRocketDirection(new THREE.Vector3(-1, 0, 0));
      whoOSH();
      break;
    case "d":
    case "D":
      keyboardInput.x = moveSpeed; // Accelerate right
      setRocketDirection(new THREE.Vector3(1, 0, 0));
      whoOSH();
      break;
    case "ArrowUp":
      keyboardInput.y = moveSpeed; // Accelerate up
      whoOSH();
      break;
    case "ArrowDown":
      keyboardInput.y = -moveSpeed; // Accelerate down
      whoOSH();
      break;
    }
  updateCombinedInput();
};

// Key release logic to stop acceleration
document.onkeyup = (e) => {
  switch (e.key) {
    case "w":
    case "W":
    case "s":
    case "S":
      keyboardInput.z = 0; // Stop forward/backward acceleration
      break;
    case "a":
    case "A":
    case "d":
    case "D":
      keyboardInput.x = 0; // Stop left/right acceleration
      break;
    case "ArrowUp":
    case "ArrowDown":
      keyboardInput.y = 0; // Stop up/down acceleration
      break;
  }
  
  // Check if keyboard is still active
  isKeyboardActive = keyboardInput.x !== 0 || keyboardInput.y !== 0 || keyboardInput.z !== 0;
  
  updateCombinedInput();
  
  // Only stop effects if neither keyboard nor hand is active
  if (!isKeyboardActive && !isHandInputActive) {
    shwup();
  }
};

//----------POINT TOWARDS THE  DIRECTION PRESSED---------------------//
// -----------------------------END----------------------------------//
// ------------------------------------------------------------------//


// ------------------------------------------------------------------//
//-------------------------BILLBOARDS -------------------------------//
// ----------------------------BEGIN---------------------------------//
function createBillboard(title, description, position) {
  const loaderFont = new THREE.FontLoader();
  loaderFont.load(
    'fonts/combine_supercharge.json',
    function (font) {
      const titleGeometry = new THREE.TextGeometry(title, {
        font: font,
        size: 1.5, // Adjust size as needed
        height: 0.02, // Reduced extrude depth
        curveSegments: 8, // Reduced from 120 for performance
        bevelEnabled: false, // Disabled bevel for performance
        bevelThickness: 0,
        bevelSize: 0,
        bevelOffset: 0,
		    bevelSegments: 0
      });
      const titleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x1D2B53,
      });
      const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
      titleMesh.position.set(-20, 5, 0);
      const descGeometry = new THREE.TextGeometry(description, {
        font: font,
        size: 1, // Smaller size for description
        height: 0.01, // Reduced height for performance
        curveSegments: 4 // Added for performance
      });
      const descMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFD4499, // Regular color for the description
      });
      const descMesh = new THREE.Mesh(descGeometry, descMaterial);
      descMesh.position.set(-10, 2, 0);
      const planeGeometry = new THREE.PlaneGeometry(0, 0); // Adjust size as needed
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0
      });
      const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
      const planeGeometry2 = new THREE.PlaneGeometry(75, 3.5);
      const planeMaterial2 = new THREE.MeshBasicMaterial({
        color: 0xFF004D,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      const titlebackMesh = new THREE.Mesh(planeGeometry2, planeMaterial2);
      titlebackMesh.position.set(5,5.65,0)
      titleMesh.add(titlebackMesh);
      planeMesh.add(titleMesh);
      planeMesh.add(descMesh);
      planeMesh.add(titlebackMesh);
      //planeMesh.position.set(-10,10,0)
      // Store title and description meshes as properties of planeMesh
      //planeMesh.titleMesh = titleMesh;
      //planeMesh.descMesh = descMesh;

      const billboardPosition = new THREE.Vector3(position.x, position.y, position.z);
      planeMesh.position.copy(billboardPosition);
      const pointLight = new THREE.PointLight(0x00ffff, 1, 50); // Light color and intensity
      pointLight.position.set(billboardPosition.x, billboardPosition.y, billboardPosition.z);
      scene.add(pointLight);
      scene.add(planeMesh);
      // Create marker (small sphere to show position)
      const markerGeometry = new THREE.SphereGeometry(1.5, 16, 16); // Small sphere
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xFAEF5D, transparent: true, opacity: 0.5 }); // Red color
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(billboardPosition); // Position the marker at the billboard's location
      
      const markerGeometry1 = new THREE.SphereGeometry(0.75, 16, 16); // Small sphere
      const markerMaterial1 = new THREE.MeshBasicMaterial({ color: 0xFAEF5D, transparent: false, opacity: 0.8 }); // Red color
      const marker1 = new THREE.Mesh(markerGeometry1, markerMaterial1);
      marker1.position.copy(billboardPosition); // Position the marker at the billboard's location
      
      scene.add(marker);
      scene.add(marker1);

      planeMesh.cameraDistance = billboardPosition.distanceTo(camera.position);
      planeMesh.initialOpacity = 0.01; // Initial dim state
      planeMesh.maxOpacity = 1.0; // Fully visible state
      planeMesh.minDistance = 10; // Distance at which it becomes fully visible
      planeMesh.maxDistance = 50; // Distance at which it becomes fully dim
      billboards.push(planeMesh);
    }
  );
}

let billboards = []; 
const someBillboard = billboards[0]; // Assuming it's the first billboard in the billboards array

//-------------------------BILLBOARDS -------------------------------//
// -----------------------------END----------------------------------//
// ------------------------------------------------------------------//


// ------------------------------------------------------------------//
//-------------------------CHECKPOINT LINE---------------------------//
// ----------------------------BEGIN---------------------------------//



// Resume milestones data
const resumeMilestones = [
  { year: "2021", text: "Completed BTech CSE", z: -50 },
  { year: "2022", text: "Completed work at Sri Sai Oilfield International", z: -150 },
  { year: "Sept 2022", text: "Started Masters at NJIT", z: -250 },
  { year: "Dec 2023", text: "Started job at InTheLoop AI", z: -350 },
  { year: "May 2024", text: "Finished Masters at NJIT", z: -450 },
  { year: "Dec 2024", text: "Finished job at InTheLoop AI", z: -550 },
  { year: "Jan 2025", text: "Joined Womp 3D", z: -650 }
];

// Create straight line through milestones
const material = new THREE.LineBasicMaterial( { color: 0xFAEF5D, linewidth: 1 } );
const points = [];
resumeMilestones.forEach(milestone => {
  points.push(new THREE.Vector3(0, 0, milestone.z));
});
const geometry = new THREE.BufferGeometry().setFromPoints( points );
const line = new THREE.Line( geometry, material );
scene.add( line );

// Create billboards for each milestone
resumeMilestones.forEach(milestone => {
  createBillboard(`${milestone.year}: ${milestone.text}`, "", { x: 0, y: 0, z: milestone.z });
});


//-------------------------CHECKPOINT LINE---------------------------//
// -----------------------------END----------------------------------//
// ------------------------------------------------------------------//


// ------------------------------------------------------------------//
//-------------------------ANIMATE LOOP------------------------------//
// ----------------------------BEGIN---------------------------------//

// Performance monitoring
let frameCount = 0;
let lastTime = performance.now();
const fpsElement = document.getElementById('fps-counter');

function animate() {
  requestAnimationFrame(animate);
  
  // FPS Counter
  frameCount++;
  const currentTime = performance.now();
  if (currentTime - lastTime >= 1000) {
    const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
    if (fpsElement) fpsElement.textContent = `FPS: ${fps}`;
    frameCount = 0;
    lastTime = currentTime;
  }
  //console.log(billboards)
  if (object) {
    const coordinatesDiv = document.getElementById("coordinates");
    coordinatesDiv.innerHTML = `Position: (${object.position.x.toFixed(2)}, ${object.position.y.toFixed(2)}, ${object.position.z.toFixed(2)})`;

    object.quaternion.slerp(targetQuaternion, 0.4);
    rocketVelocity.add(rocketAcceleration);
    rocketVelocity.x = THREE.MathUtils.clamp(rocketVelocity.x, -maxSpeed, maxSpeed);
    rocketVelocity.z = THREE.MathUtils.clamp(rocketVelocity.z, -maxSpeed, maxSpeed);
    object.position.add(rocketVelocity);
    camera.position.add(rocketVelocity);
    rocketVelocity.multiplyScalar(0.96);
    const targetPosition = new THREE.Vector3(
      object.position.x + 4, 
      object.position.y + 4,  
      object.position.z + 10  
    );
    camera.position.lerp(targetPosition, 0.02);
    //camera.lookAt(object.position);

    let elapsedTime = clock.getElapsedTime();

    if (fire) {
      let minScale = 0.20; 
      let maxScale = 0.23; 
      let scaleFactor = minScale + (maxScale - minScale) * (0.5 * Math.sin(elapsedTime * 10) + 0.5);
      fire.scale.set(scaleFactor, scaleFactor*2, scaleFactor*2)
      fire.rotation.y += fireRotationSpeed
      sound.position.set(fire.position.x, fire.position.y, fire.position.z);
    }
  }
  renderer.render(scene, camera);
}


animate();

// ------------------------------------------------------------------//
//-------------------------HAND TRACKING-----------------------------//
// ----------------------------BEGIN---------------------------------//

// Hand tracking variables
let isHandClenched = false;
let handTrackingActive = false;
let handTrackingFrameCount = 0; // For throttling hand tracking
let totalFramesProcessed = 0; // For debugging
const videoElement = document.getElementById('video-element');
const handStatusElement = document.getElementById('hand-status');
const frameCounterElement = document.getElementById('frame-counter');
const clenchConfidenceElement = document.getElementById('clench-confidence');

// Hand tracking functions (throttled for performance)
function onHandResults(results) {
  // Update frame counter
  totalFramesProcessed++;
  if (frameCounterElement) {
    frameCounterElement.textContent = `Frames: ${totalFramesProcessed}`;
  }
  
  // Debug: Log that this function is being called
  if (totalFramesProcessed === 1) {
    console.log('✅ onHandResults function is being called!');
  }
  
  // Throttle hand tracking to every 3rd frame for performance
  handTrackingFrameCount++;
  if (handTrackingFrameCount % 3 !== 0) return;
  
  // Debug logging (less frequent to avoid spam)
  if (handTrackingFrameCount % 30 === 0) {
    console.log('Hand results received:', results);
    console.log('Landmarks found:', results.multiHandLandmarks ? results.multiHandLandmarks.length : 0);
  }
  
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    handTrackingActive = true;
    
    // Show hand detected status (will be updated below if clenched)
    if (!isHandClenched) {
      handStatusElement.innerText = "Hand Status: Detected - Try Clenching";
      handStatusElement.style.color = "#00e5ff";
    }

    const hand = results.multiHandLandmarks[0];
    
    // Simple fist detection - just check distance from fingertips to wrist
    const wrist = hand[0];
    const tips = [hand[8], hand[12], hand[16], hand[20]]; // Index, Middle, Ring, Pinky tips
    
    let avgDistanceToWrist = 0;
    tips.forEach(tip => {
      avgDistanceToWrist += Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
    });
    avgDistanceToWrist /= 4;
    
    // If fingers are curled in (small distance to wrist), hand is clenched
    const wasHandClenched = isHandClenched;
    isHandClenched = avgDistanceToWrist < 0.25;
    
    // Update confidence indicator
    if (clenchConfidenceElement) {
      clenchConfidenceElement.textContent = `Distance: ${avgDistanceToWrist.toFixed(3)}`;
      clenchConfidenceElement.style.color = isHandClenched ? '#00ff00' : '#ff6666';
    }
    
    if (isHandClenched && !wasHandClenched) {
      // Hand just clenched - start moving forward
      const status = isKeyboardActive ? "Hand + Keyboard Active" : "Hand Control Active";
      handStatusElement.innerText = `Hand Status: Clenched - ${status}`;
      handStatusElement.style.color = "#00ff00";
      startHandMovement();
    } else if (!isHandClenched && wasHandClenched) {
      // Hand just opened - stop moving
      const status = isKeyboardActive ? "Keyboard Still Active" : "Stopped";
      handStatusElement.innerText = `Hand Status: Open - ${status}`;
      handStatusElement.style.color = "#ffff00";
      stopHandMovement();
    }
  } else {
    handTrackingActive = false;
    handStatusElement.innerText = "Hand Status: Show Hand";
    handStatusElement.style.color = "#555";
    
    // Stop movement when no hand detected
    if (isHandClenched) {
      isHandClenched = false;
      stopHandMovement();
    }
  }
}

function startHandMovement() {
  // Move forward (same as pressing W)
  isHandInputActive = true;
  handInput.z = -moveSpeed;
  setRocketDirection(new THREE.Vector3(0, 0, -1));
  updateCombinedInput();
  whoOSH();
}

function stopHandMovement() {
  // Stop forward movement (same as releasing W)
  isHandInputActive = false;
  handInput.z = 0;
  updateCombinedInput();
  
  // Only stop effects if neither keyboard nor hand is active
  if (!isKeyboardActive && !isHandInputActive) {
    shwup();
  }
}

// Function to combine keyboard and hand inputs
function updateCombinedInput() {
  // Combine inputs - hand takes priority for Z-axis when both are active
  if (isHandInputActive && isKeyboardActive) {
    // Hand controls forward/backward, keyboard controls left/right/up/down
    rocketAcceleration.x = keyboardInput.x;
    rocketAcceleration.y = keyboardInput.y;
    rocketAcceleration.z = handInput.z; // Hand takes priority for forward movement
  } else if (isHandInputActive) {
    // Only hand input
    rocketAcceleration.x = handInput.x;
    rocketAcceleration.y = handInput.y;
    rocketAcceleration.z = handInput.z;
  } else if (isKeyboardActive) {
    // Only keyboard input
    rocketAcceleration.x = keyboardInput.x;
    rocketAcceleration.y = keyboardInput.y;
    rocketAcceleration.z = keyboardInput.z;
  } else {
    // No input
    rocketAcceleration.x = 0;
    rocketAcceleration.y = 0;
    rocketAcceleration.z = 0;
  }
}

// Initialize MediaPipe Hands with proper loading check
function initializeHandTracking() {
  console.log('Checking MediaPipe availability...');
  console.log('Hands available:', typeof window.Hands !== 'undefined');
  console.log('Camera available:', typeof window.Camera !== 'undefined');
  
  if (typeof window.Hands !== 'undefined' && typeof window.Camera !== 'undefined') {
    console.log('Initializing MediaPipe Hands...');
    
    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0, // Reduced from 1 to 0 for better performance
      minDetectionConfidence: 0.7, // Increased for more stable detection
      minTrackingConfidence: 0.7 // Increased for more stable tracking
    });
    
    hands.onResults(onHandResults);
    
    // Verify the callback is set
    console.log('MediaPipe hands callback set, starting camera...');
    
    // Initialize camera with reduced resolution for performance
    const camera_utils = new window.Camera(videoElement, {
      onFrame: async () => {
        try {
          // Always send frames to MediaPipe (removed throttling here since we throttle in onHandResults)
          await hands.send({image: videoElement});
          
          // Debug: Log every 60 frames to show camera is working
          if (totalFramesProcessed % 60 === 0) {
            console.log('Camera frame sent to MediaPipe, total frames:', totalFramesProcessed);
          }
        } catch (error) {
          console.error('Error sending frame to MediaPipe:', error);
        }
      },
      width: 240, // Reduced from 320
      height: 180  // Reduced from 240
    });
    
    // Request camera permission first
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        console.log('Camera permission granted');
        return camera_utils.start();
      })
      .then(() => {
        console.log('Camera started successfully');
        handStatusElement.innerText = "Hand Status: Ready - Show Your Hand";
        handStatusElement.style.color = "#00ff00";
        
        // Update status after a short delay to ensure everything is ready
        setTimeout(() => {
          if (handStatusElement.innerText.includes("Ready")) {
            handStatusElement.innerText = "Hand Status: Show Hand to Camera";
            handStatusElement.style.color = "#00e5ff";
          }
        }, 2000);
        
        // Check if frames are being processed after 5 seconds
        setTimeout(() => {
          if (totalFramesProcessed === 0) {
            console.error('❌ No frames processed after 5 seconds - camera may not be working');
            handStatusElement.innerText = "Hand Status: Camera Not Processing";
            handStatusElement.style.color = "#ff0000";
          } else {
            console.log(`✅ ${totalFramesProcessed} frames processed - camera working`);
          }
        }, 5000);
      })
      .catch((error) => {
        console.error('Camera initialization failed:', error);
        handStatusElement.innerText = "Hand Status: Camera Access Denied";
        handStatusElement.style.color = "#ff0000";
      });
    
  } else {
    console.log('MediaPipe not loaded, retrying in 1 second...');
    handStatusElement.innerText = "Hand Status: Loading MediaPipe...";
    handStatusElement.style.color = "#ffaa00";
    
    // Retry after 1 second
    setTimeout(initializeHandTracking, 1000);
  }
}

// Start initialization after a short delay to ensure scripts are loaded
setTimeout(initializeHandTracking, 500);

// Also try when window is fully loaded as a backup
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!handTrackingActive && handStatusElement.innerText.includes('Waiting')) {
      console.log('Backup initialization attempt...');
      initializeHandTracking();
    }
  }, 1000);
});

// Add test button functionality
document.addEventListener('DOMContentLoaded', () => {
  const testButton = document.getElementById('test-hand');
  const testClenchButton = document.getElementById('test-clench');
  const testOpenButton = document.getElementById('test-open');
  
  if (testButton) {
    testButton.addEventListener('click', () => {
      console.log('Manual test triggered');
      console.log('Hand tracking active:', handTrackingActive);
      console.log('Video element:', videoElement);
      console.log('Current status:', handStatusElement.innerText);
      
      // Simulate hand detection for testing
      handStatusElement.innerText = "Hand Status: Test - Move Forward!";
      handStatusElement.style.color = "#00ff00";
      startHandMovement();
      
      setTimeout(() => {
        handStatusElement.innerText = "Hand Status: Test Complete";
        handStatusElement.style.color = "#00e5ff";
        stopHandMovement();
      }, 2000);
    });
  }
  
  if (testClenchButton) {
    testClenchButton.addEventListener('click', () => {
      console.log('Simulating hand clench');
      handStatusElement.innerText = "Hand Status: Simulated Clench";
      handStatusElement.style.color = "#00ff00";
      startHandMovement();
    });
  }
  
  if (testOpenButton) {
    testOpenButton.addEventListener('click', () => {
      console.log('Simulating hand open');
      handStatusElement.innerText = "Hand Status: Simulated Open";
      handStatusElement.style.color = "#ffff00";
      stopHandMovement();
    });
  }
});

//-------------------------HAND TRACKING-----------------------------//
// -----------------------------END----------------------------------//
// ------------------------------------------------------------------//

//-------------------------ANIMATE LOOP------------------------------//
// -----------------------------END----------------------------------//
// ------------------------------------------------------------------//