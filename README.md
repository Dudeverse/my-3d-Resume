# 3D Resume with Hand Tracking

An interactive 3D resume experience that showcases career milestones through a rocket journey controlled by hand gestures.

## 🚀 Features

- **Hand Gesture Control**: Use hand gestures to control rocket movement
- **Career Timeline**: Navigate through resume milestones in 3D space
- **Keyboard Controls**: Traditional WASD + arrow key controls
- **Real-time Hand Tracking**: MediaPipe integration for gesture recognition
- **3D Models**: Rocket, fire effects, and interactive elements

## 🛠️ Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- A modern web browser with camera access
- Webcam for hand tracking

### Installation & Running

1. **Clone or navigate to the project directory**
   ```bash
   cd my-3d-Resume
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - The server will automatically open your browser
   - Or manually visit: http://localhost:3000

## 🎮 Controls

### Hand Gestures
- **✋ Open Hand**: Stop rocket movement
- **🤜 Clenched Fist**: Move rocket forward through timeline
- **Show Hand**: Must be visible to camera for tracking

### Keyboard Controls
- **W**: Move forward
- **A**: Move left  
- **S**: Move backward
- **D**: Move right
- **↑**: Move up
- **↓**: Move down

## 📋 Resume Timeline

The rocket travels through these career milestones:

1. **2021**: Completed BTech CSE
2. **2022**: Completed work at Sri Sai Oilfield International
3. **Sept 2022**: Started Masters at NJIT
4. **Dec 2023**: Started job at InTheLoop AI
5. **May 2024**: Finished Masters at NJIT
6. **Dec 2024**: Finished job at InTheLoop AI
7. **Jan 2025**: Joined Womp 3D
8. **Dec 2025**: Currently at Womp 3D

## 🔧 Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm start` - Alias for dev command
- `npm run serve` - Start server on port 8080
- `npm run preview` - Start server on port 4173

## 🌐 Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

**Note**: Camera access is required for hand tracking features.

## 📁 Project Structure

```
my-3d-Resume/
├── index.html          # Main HTML file
├── js/
│   └── main.js         # Main JavaScript with Three.js and hand tracking
├── css/
│   └── style.css       # Styling
├── models/             # 3D models (rocket, fire, etc.)
├── fonts/              # Custom fonts
├── skybox/             # Skybox textures
├── sfx/                # Sound effects
└── package.json        # NPM configuration
```

## 🎯 Troubleshooting

### Camera Not Working
- Ensure browser has camera permissions
- Check if another application is using the camera
- Try refreshing the page

### Hand Tracking Not Responding
- Ensure good lighting
- Keep hand clearly visible in camera frame
- Try different hand positions

### Server Won't Start
- Check if port 3000 is already in use
- Try `npm run serve` for port 8080
- Ensure Node.js is properly installed

## 👨‍💻 Author

**Surya Teja Ethalapaka**
- Interactive 3D Resume Experience
- Hand Gesture Integration
- Career Timeline Visualization

---

*Built with Three.js, MediaPipe, and modern web technologies*