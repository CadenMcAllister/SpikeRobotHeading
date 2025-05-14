import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import './App.css';
import './index.css';

export default function App() {
  const [heading, setHeading] = useState<number>(0);
  const offsetRef = useRef<number>(0);
  const rawAlphaRef = useRef<number>(0);
  const [snapshots, setSnapshots] = useState<number[]>([]);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha != null) {
        rawAlphaRef.current = e.alpha;
        // Flip yaw to make right positive and left negative
        let yaw = (-e.alpha + offsetRef.current + 180) % 360 - 180;
        setHeading(yaw);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  const resetYaw = () => {
    offsetRef.current = rawAlphaRef.current;
    setHeading(0);
  };

  const saveHeading = () => {
    setSnapshots((prev) => [...prev, heading]);
  };

  const restoreHeading = (value: number) => {
    offsetRef.current = (-value + rawAlphaRef.current + 360) % 360;
    setHeading(0);
  };

  const clearHeadings = () => {
    setSnapshots([]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="absolute top-8 text-4xl font-bold">
        {Math.round(heading)}°
      </div>

      <motion.div
        className="w-40 h-40 border-4 border-blue-500 rounded-full flex items-center justify-center relative"
        animate={{ rotate: heading }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
      >
        <div className="w-0 h-20 border-l-4 border-white absolute top-0"></div>
      </motion.div>

      <div className="mt-6 flex gap-4 flex-wrap justify-center">
        <button
          onClick={resetYaw}
          className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
        >
          Reset Yaw
        </button>
        <button
          onClick={saveHeading}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Save Heading
        </button>
        <button
          onClick={clearHeadings}
          className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Clear Saved Headings
        </button>
      </div>

      {snapshots.length > 0 && (
        <div className="mt-6 w-full max-w-sm">
          <h2 className="mb-2 text-lg font-semibold">Saved Headings</h2>
          <div className="grid gap-2">
            {snapshots.map((snap, i) => (
              <button
                key={i}
                onClick={() => restoreHeading(snap)}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
              >
                {snap.toFixed(1)}°
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
