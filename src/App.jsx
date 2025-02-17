import React, { useState, useRef, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { Canvas, Rect, Circle, Triangle } from 'fabric';
import { Button, IconButton } from 'blocksin-system';
import { SquareIcon, CircleIcon, TriangleIcon } from 'sebikostudio-icons';
import { debounce } from 'lodash'; // Import debounce to limit WebSocket updates
import './App.css';
import Setting from './Setting'

const WS_URL = 'ws://localhost:8080';

function App() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [screenId] = useState('123');

  // Connect to WebSocket
  const { sendJsonMessage } = useWebSocket(
    `${WS_URL}?role=dashboard&screenId=${screenId}`,
    {
      share: true,
      onOpen: () => console.log('WebSocket Connected'),
      shouldReconnect: () => true,
    }
  );

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: 500,
        height: 500,
      });
      initCanvas.backgroundColor = "#fff";
      setCanvas(initCanvas);

      // Setup event listeners for live updates
      const sendUpdate = debounce(() => {
        if (initCanvas) {
          sendJsonMessage({
            type: 'sync',
            content: initCanvas.toJSON(),
            screenId,
          });
          console.log('Canvas updated:', initCanvas.toJSON());
        }
      }, 500); // Debounced to prevent excessive updates

      initCanvas.on('object:modified', sendUpdate);
      initCanvas.on('object:added', sendUpdate);
      initCanvas.on('object:removed', sendUpdate);

      return () => {
        initCanvas.dispose();
      };
    }
  }, [canvasRef]); // Runs once when canvasRef is available

  // Function to manually send canvas updates
  const sendCanvasUpdate = () => {
    if (canvas) {
      sendJsonMessage({
        type: 'sync',
        content: canvas.toJSON(),
        screenId,
      });
      console.log('Canvas manually synced:', canvas.toJSON());
    }
  };

  // Shape addition functions with automatic syncing
  const addRectangle = () => {
    if (canvas) {
      const rect = new Rect({
        top: 100,
        left: 50,
        width: 100,
        height: 60,
        fill: '#3854cf',
      });
      canvas.add(rect);
      canvas.requestRenderAll();
      sendCanvasUpdate(); // Sync after adding
    }
  };

  const addCircle = () => {
    if (canvas) {
      const cir = new Circle({
        top: 100,
        left: 100,
        radius: 50,
        fill: '#3854cf',
      });
      canvas.add(cir);
      canvas.requestRenderAll();
      sendCanvasUpdate();
    }
  };

  const addTriangle = () => {
    if (canvas) {
      const tri = new Triangle({
        top: 100,
        left: 150,
        height: 50,
        fill: '#3854cf',
      });
      canvas.add(tri);
      canvas.requestRenderAll();
      sendCanvasUpdate();
    }
  };

  return (
    <div className="App">
      <h2>SCREEN ID: 123</h2>
      <div className="Toolbar">
        <h4>Shapes</h4>
        <IconButton onClick={addRectangle} size="medium">
          <SquareIcon />
        </IconButton>
        <IconButton onClick={addCircle} size="medium">
          <CircleIcon />
        </IconButton>
        <IconButton onClick={addTriangle} size="medium">
          <TriangleIcon />
        </IconButton>
      </div>
      <canvas id="Canvas" ref={canvasRef} />
      <Button onClick={sendCanvasUpdate}>Sync Canvas</Button>
      <Setting canvas={canvas}/>
    </div>
  );
}

export default App;
