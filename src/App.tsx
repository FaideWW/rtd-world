import { useEffect, useRef, useState } from "react";
import "./App.css";
import { draw } from "./draw";

function App() {
  const canvasRef = useRef(null);
  const [method, setMethod] = useState<
    "midpointDisplacement" | "diamondSquare"
  >("midpointDisplacement");

  useEffect(() => {
    if (canvasRef.current) draw(canvasRef.current, "midpointDisplacement");
  }, []);

  const handleRedraw = () => {
    if (canvasRef.current) draw(canvasRef.current, method);
  };
  return (
    <div className="flex flex-col gap-4 my-4">
      <div className="flex flex-row justify-center gap-8 text-white items-center">
        <label htmlFor="midpointDisplacement">
          Midpoint displacement
          <input
            type="radio"
            name="method"
            id="midpointDisplacement"
            value="midpointDisplacement"
            checked={method === "midpointDisplacement"}
            onChange={() => setMethod("midpointDisplacement")}
          />
        </label>
        {/*<label htmlFor="diamondSquare">
          Diamond Square
          <input
            type="radio"
            name="method"
            value="diamondSquare"
            id="diamondSquare"
            checked={method === "diamondSquare"}
            onChange={() => setMethod("diamondSquare")}
          />
        </label>*/}
        <button
          onClick={handleRedraw}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-800 hover:cursor-pointer"
        >
          Redraw
        </button>
      </div>
      <div>
        <canvas
          className="mx-auto"
          width="1000px"
          height="1000px"
          id="canvas"
          ref={canvasRef}
        />
      </div>
    </div>
  );
}

export default App;
