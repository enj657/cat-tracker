import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { Weight } from "../../types";

interface WeightTrackerProps {
  catId: number;
  weights: Weight[];
  onWeightsUpdated: (weights: Weight[]) => void;
}

// Custom tooltip for the chart
interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const dateLabel = label
    ? new Date(Number(label)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-gray-400 text-xs mb-1">{dateLabel}</p>
      <p className="text-cyan-400 font-bold">{payload[0].value.toFixed(1)} lbs</p>
    </div>
  );
}

export default function WeightTracker({
  catId,
  weights,
  onWeightsUpdated,
}: WeightTrackerProps) {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);

  // Build date string from local time (toISOString() uses UTC which can give tomorrow in US timezones)
  const todayLocal = new Date();
  const today = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, "0")}-${String(todayLocal.getDate()).padStart(2, "0")}`;

  const sorted = [...weights].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Shape data for Recharts — include timestamp so XAxis can use a true time scale
  const chartData = sorted.map((w) => ({
    timestamp: new Date(w.date + "T00:00:00").getTime(),
    label: new Date(w.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    weight: parseFloat(String(w.weight)),
  }));

  const addWeight = async () => {
    if (!weight.trim() || !date) return;
    setAdding(true);
    try {
      const res = await fetch(`http://localhost:3000/cats/${catId}/weights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          weight: { weight: parseFloat(weight), date, notes },
        }),
      });
      const newWeight = await res.json();
      onWeightsUpdated([...weights, newWeight]);
      setWeight("");
      setNotes("");
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const deleteWeight = async (id: number) => {
    if (!window.confirm("Delete this weight entry?")) return;
    try {
      await fetch(`http://localhost:3000/cats/${catId}/weights/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      onWeightsUpdated(weights.filter((w) => w.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // Stats
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const latestChange = latest && previous
    ? parseFloat(String(latest.weight)) - parseFloat(String(previous.weight))
    : null;
  const allValues = sorted.map((w) => parseFloat(String(w.weight)));
  const minVal = allValues.length ? Math.min(...allValues) : 0;
  const maxVal = allValues.length ? Math.max(...allValues) : 0;

  // Y axis domain with a little padding
  const yPad = 0.5;
  const yDomain = sorted.length >= 2
    ? [Math.floor((minVal - yPad) * 10) / 10, Math.ceil((maxVal + yPad) * 10) / 10]
    : undefined;

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h3 className="font-bold text-lg mb-4 text-white">⚖️ Weight Tracker</h3>

      {sorted.length === 0 ? (
        <p className="text-gray-500 text-sm mb-5 italic">
          No weight entries yet. Log the first one below!
        </p>
      ) : (
        <>
          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Latest</p>
              <p className="text-xl font-black text-white">{latest.weight} lbs</p>
            </div>
            {latestChange !== null && (
              <div>
                <p className="text-xs text-gray-500">Change</p>
                <p className={`text-sm font-bold ${
                  latestChange > 0 ? "text-orange-400"
                  : latestChange < 0 ? "text-green-400"
                  : "text-gray-400"
                }`}>
                  {latestChange > 0 ? "▲" : latestChange < 0 ? "▼" : "—"}{" "}
                  {Math.abs(latestChange).toFixed(1)} lbs
                </p>
              </div>
            )}
            {sorted.length >= 2 && (
              <div>
                <p className="text-xs text-gray-500">Range</p>
                <p className="text-sm text-gray-300">
                  {minVal.toFixed(1)} – {maxVal.toFixed(1)} lbs
                </p>
              </div>
            )}
          </div>

          {/* Chart — only show with 2+ entries */}
          {sorted.length >= 2 ? (
            <div className="mb-5 -mx-1">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="weightLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(ts) =>
                      new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                    interval="preserveStartEnd"
                    minTickGap={40}
                  />
                  <YAxis
                    domain={yDomain}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}`}
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#4b5563", strokeWidth: 1 }} />
                  {/* Average reference line */}
                  {allValues.length >= 3 && (
                    <ReferenceLine
                      y={allValues.reduce((a, b) => a + b, 0) / allValues.length}
                      stroke="#4b5563"
                      strokeDasharray="4 4"
                      label={{ value: "avg", fill: "#6b7280", fontSize: 9, position: "right" }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="url(#weightLineGrad)"
                    strokeWidth={2.5}
                    dot={{ fill: "#06b6d4", r: 4, strokeWidth: 0 }}
                    activeDot={{ fill: "#06b6d4", r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-xs italic mb-4">
              Add one more entry to see the trend chart
            </p>
          )}

          {/* Weight history list */}
          <div className="mb-5 max-h-36 overflow-y-auto space-y-1">
            {[...sorted].reverse().map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium text-sm">{w.weight} lbs</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(w.date + "T00:00:00").toLocaleDateString()}
                  </span>
                  {w.notes && (
                    <span className="text-gray-500 text-xs italic">· {w.notes}</span>
                  )}
                </div>
                <button
                  onClick={() => deleteWeight(w.id)}
                  className="text-pink-500 text-xs hover:text-pink-400 ml-2 shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add entry form */}
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Weight (lbs) <span className="text-pink-400">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="Enter lbs"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="border border-gray-600 bg-gray-900 text-white placeholder-gray-600 p-2 rounded w-28 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Date</label>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-600 bg-gray-900 text-white p-2 rounded text-sm"
          />
        </div>
        <div className="flex-1 min-w-32">
          <label className="text-xs text-gray-500 block mb-1">Notes (optional)</label>
          <input
            placeholder="e.g. after vet visit"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border border-gray-600 bg-gray-900 text-white placeholder-gray-600 p-2 rounded w-full text-sm"
          />
        </div>
        <button
          onClick={addWeight}
          disabled={adding || !weight.trim()}
          title={!weight.trim() ? "Enter a weight to log" : ""}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm transition-colors"
        >
          {adding ? "Saving..." : "Log Weight"}
        </button>
      </div>
      {!weight.trim() && (
        <p className="text-xs text-gray-600 mt-2">Enter a weight above to enable logging</p>
      )}
    </div>
  );
}