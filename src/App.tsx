import { useEffect, useRef } from "react";
import "./App.css";
import { start, stop } from "./draw";

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log("starting");
    if (canvasRef.current) start(canvasRef.current);

    return () => {
      stop();
    };
  }, []);
  return (
    <>
      <canvas width={1000} height={1000} id="canvas" ref={canvasRef} />
    </>
  );
}

export default App;
