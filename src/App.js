import React, { useRef, useEffect, useState} from 'react';
import './App.css';
import { db } from "./firebase";
import { ref, onChildAdded, push, set } from "firebase/database";


function App() {
  const canvasRef = useRef(null)
  const contextRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });


  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext("2d")
    context.scale(2,2)
    context.lineCap = "round"
    context.strokeStyle = "black"
    context.lineWidth = 5
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    contextRef.current = context;
  }, [])

  useEffect(() => {
    const strokesRef = ref(db, "strokes/");
    onChildAdded(strokesRef, (snapshot) => {
      const stroke = snapshot.val();
      drawLine(stroke.start, stroke.end, stroke.color, false);
    });
  }, []);

 
  const drawLine = (start, end, color = "black", shouldBroadcast = true) => {
    const context = contextRef.current;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.closePath();

    if (shouldBroadcast) {
      const strokesRef = ref(db, "strokes/");
      const newStrokeRef = push(strokesRef);
      set(newStrokeRef, { start, end, color });
    }
  };

  // Mouse event handlers
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setLastPos({ x: offsetX, y: offsetY });
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const newPos = { x: offsetX, y: offsetY };
    drawLine(lastPos, newPos, "black", true);
    setLastPos(newPos);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseLeave={finishDrawing}
      onMouseMove={draw}
      style={{ border: "1px solid #000", display: "block" }}
    />
  );
}

export default App;

