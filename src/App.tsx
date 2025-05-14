import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import './App.css';
import './index.css';

export default function App() {
  const tickColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-400",
    "bg-green-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
  ];

  const rawAlphaRef = useRef<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const offsetRef = useRef<number>(0);
  const [snapshots, setSnapshots] = useState<number[]>([]);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha != null) {
        rawAlphaRef.current = e.alpha;
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
    offsetRef.current = (360 - rawAlphaRef.current) % 360;
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
      <div className="relative w-40 h-40">
        {/* Compass Circle */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full flex items-center justify-center text-2xl font-bold"
          animate={{ rotate: -heading }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
        >
          {Math.round(heading)}°
        </motion.div>

        {/* Tick Marks */}
        {snapshots.map((snap, i) => {
          const angle = snap;
          const radius = 80;
          const x = radius * Math.sin((angle * Math.PI) / 180);
          const y = -radius * Math.cos((angle * Math.PI) / 180);
          const color = tickColors[i % tickColors.length];

          return (
            <div
              key={i}
              onClick={() => restoreHeading(snap)}
              className={`absolute w-3 h-3 rounded-full ${color} cursor-pointer`}
              style={{
                left: `calc(50% + ${x}px - 0.375rem)`,
                top: `calc(50% + ${y}px - 0.375rem)`,
              }}
              title={`${Math.round(snap)}°`}
            />
          );
        })}
      </div>

      {/* Buttons */}
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
    </div>
  );
}
