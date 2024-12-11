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


let moveSpeed = 0.015; // Acceleration rate
let maxSpeed = 1; // Maximum velocity
let rocketVelocity = new THREE.Vector3(0, 0, 0); // Current velocity
let rocketAcceleration = new THREE.Vector3(0, 0, 0); // Current acceleration
let targetQuaternion = new THREE.Quaternion(); // To store the target direction

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
        height: 0.05, // Extrude depth for text
        curveSegments: 120,
        bevelEnabled: true,
        bevelThickness: 0.005,
        bevelSize: 0.01,
        bevelOffset: 0,
		    bevelSegments: 12
      });
      const titleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x1D2B53,
      });
      const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
      titleMesh.position.set(-20, 5, 0);
      const descGeometry = new THREE.TextGeometry(description, {
        font: font,
        size: 1, // Smaller size for description
        height: 0.2,
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



const material = new THREE.LineBasicMaterial( { color: 0xFAEF5D, linewidth: 1 } );
const points = [];
points.push( new THREE.Vector3( 0, 0, -50    ) );
points.push( new THREE.Vector3( 0, 0, -150    ) );
points.push( new THREE.Vector3( 0, 0, -250    ) );
points.push( new THREE.Vector3( 0, 0, -350    ) );
points.push( new THREE.Vector3( 0, 0, -450    ) );
points.push( new THREE.Vector3( 0, 0, -550    ) );
points.push( new THREE.Vector3( 0, 0, -650    ) );
const geometry = new THREE.BufferGeometry().setFromPoints( points );
const line = new THREE.Line( geometry, material );
scene.add( line );
createBillboard("Press W to move the rocket ahead"        , "", { x: 0,    y: 0,  z: -50 });
createBillboard("Press Up Arrow to move the rocket up"    , "", { x: 0,    y: 0,  z: -150  }); 
createBillboard("Press A to move the rocket left"         , "", { x: 0,    y: 0,  z: -250 });
createBillboard("Press S to move the rocket backwards"    , "", { x: 0,    y: 0,  z: -350 });
createBillboard("Press down Arrow to move the rocket down", "", { x: 0,    y: 0,  z: -450 });
createBillboard("Press d to move the rocket left"         , "", { x: 0,    y: 0,  z: -550 });


//-------------------------CHECKPOINT LINE---------------------------//
// -----------------------------END----------------------------------//
// ------------------------------------------------------------------//


// ------------------------------------------------------------------//
//-------------------------ANIMATE LOOP------------------------------//
// ----------------------------BEGIN---------------------------------//
function animate() {
  requestAnimationFrame(animate);
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
//-------------------------ANIMATE LOOP------------------------------//
// -----------------------------END----------------------------------//
// ------------------------------------------------------------------//