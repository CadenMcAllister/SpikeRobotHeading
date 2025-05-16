import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import './App.css';
import './index.css';

type ResetEntry = {
  offset: number;
  name: string;
  color: string;
  isDefault?: boolean;
};

export default function App() {
  const [heading, setHeading] = useState<number>(0);
  const offsetRef = useRef<number>(0);
  const rawAlphaRef = useRef<number>(0);
  const [resets, setResets] = useState<ResetEntry[]>([]);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha != null) {
        rawAlphaRef.current = e.alpha;
        const raw = -e.alpha + offsetRef.current;
        const yaw = ((raw + 180 + 360) % 360) - 180;
        setHeading(yaw);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);

    // Capture initial yaw after first reading
    const initialReset = setInterval(() => {
      if (rawAlphaRef.current !== 0 && resets.length === 0) {
        const initialEntry: ResetEntry = {
          offset: rawAlphaRef.current,
          name: "Default",
          color: "#cccccc",
          isDefault: true
        };
        offsetRef.current = rawAlphaRef.current;
        setResets([initialEntry]);
        clearInterval(initialReset);
      }
    }, 100);

    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [resets.length]);

  const pastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  };

  const resetYaw = () => {
    const newOffset = rawAlphaRef.current;
    const newReset: ResetEntry = {
      offset: newOffset,
      name: `Reset ${resets.length}`,
      color: pastelColor()
    };
    offsetRef.current = newOffset;
    setHeading(0);
    setResets((prev) => [...prev, newReset]);
  };

  const restoreReset = (entry: ResetEntry) => {
    offsetRef.current = entry.offset;
    setHeading(((rawAlphaRef.current - entry.offset + 180 + 360) % 360) - 180);
  };

  const renameReset = (index: number) => {
    const newName = prompt("Rename this reset?", resets[index].name);
    if (newName) {
      setResets((prev) =>
        prev.map((r, i) => (i === index ? { ...r, name: newName } : r))
      );
    }
  };

  const deleteReset = (index: number) => {
    if (resets[index].isDefault) return;
    setResets((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      {/* Heading display */}
      <div className="absolute top-8 text-4xl font-bold">
        {Math.round(heading)}°
      </div>

      {/* Rotating dial */}
      <motion.div
        className="w-40 h-40 border-4 border-blue-500 rounded-full flex items-center justify-center relative"
        animate={{ rotate: heading }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
      >
        <div className="w-0 h-20 border-l-4 border-white absolute top-0"></div>
      </motion.div>

      {/* Buttons */}
      <div className="mt-6 flex gap-4 flex-wrap justify-center">
        <button
          onClick={resetYaw}
          className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
        >
          Reset Yaw
        </button>
        <button
          onClick={() =>
            setResets((prev) => prev.filter((r) => r.isDefault))
          }
          className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Clear Resets
        </button>
      </div>

      {/* Reset history */}
      {resets.length > 0 && (
        <div className="mt-6 w-full max-w-sm">
          <h2 className="mb-2 text-lg font-semibold">Yaw Reset History</h2>
          <div className="grid gap-2">
            {resets.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 rounded text-black"
                style={{ backgroundColor: r.color }}
              >
                <button
                  onClick={() => restoreReset(r)}
                  className="text-left flex-1"
                >
                  {r.name}
                </button>
                <div className="flex gap-2 ml-2">
                  {!r.isDefault && (
                    <>
                      <button onClick={() => renameReset(i)}>
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => deleteReset(i)}>
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
