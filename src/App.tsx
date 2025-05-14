import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import './App.css';
import './index.css';

export default function App() {
  const [heading, setHeading] = useState<number>(0);
  const offsetRef = useRef<number>(0);
  const [snapshots, setSnapshots] = useState<number[]>([]);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha != null) {
        let yaw = (e.alpha + offsetRef.current) % 360;
        if (yaw > 180) yaw -= 360;
        if (yaw < -180) yaw += 360;
        setHeading(yaw);
      }
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  const resetYaw = () => {
    offsetRef.current = (360 - heading) % 360;
    setHeading(0);
  };

  const saveHeading = () => {
    setSnapshots((prev) => [...prev, heading]);
  };

  const restoreHeading = (value: number) => {
    offsetRef.current = (360 - value) % 360;
    setHeading(0);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <motion.div
        className="w-40 h-40 border-4 border-blue-500 rounded-full flex items-center justify-center text-2xl font-bold"
        animate={{ rotate: heading }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
      >
        {heading.toFixed(1)}°
      </motion.div>

      <div className="mt-6 flex gap-4">
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
