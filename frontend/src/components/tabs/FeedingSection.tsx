import { useState } from "react";
import type { FoodLog } from "../../types";

interface FeedingSectionProps {
  catId: number;
  logs: FoodLog[];
  onLogsUpdated: (logs: FoodLog[]) => void;
}

const FOOD_TYPES = [
  { value: "wet",   label: "Wet",   icon: "🥫" },
  { value: "dry",   label: "Dry",   icon: "🥣" },
  { value: "raw",   label: "Raw",   icon: "🥩" },
  { value: "mixed", label: "Mixed", icon: "🍱" },
];

const REACTIONS = [
  { value: "none",     label: "None",     color: "text-green-400  border-green-700  bg-green-900/30"  },
  { value: "mild",     label: "Mild",     color: "text-yellow-400 border-yellow-700 bg-yellow-900/30" },
  { value: "moderate", label: "Moderate", color: "text-orange-400 border-orange-700 bg-orange-900/30" },
  { value: "severe",   label: "Severe",   color: "text-pink-400   border-pink-700   bg-pink-900/30"   },
];

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getFoodTypeMeta(v: string) {
  return FOOD_TYPES.find((t) => t.value === v) ?? { label: v, icon: "🍽️" };
}

function getReactionMeta(v: string) {
  return REACTIONS.find((r) => r.value === v) ?? REACTIONS[0];
}

// Reusable toggle component with correct Tailwind pattern
function Toggle({ value, onChange, color = "bg-violet-600" }: { value: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${value ? color : "bg-gray-700"}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${value ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function FeedingSection({ catId, logs, onLogsUpdated }: FeedingSectionProps) {
  const [foodBrand, setFoodBrand]           = useState("");
  const [foodType, setFoodType]             = useState("dry");
  const [prescription, setPrescription]     = useState(false);
  const [isFoodChange, setIsFoodChange]     = useState(false);
  const [previousBrand, setPreviousBrand]   = useState("");
  const [reaction, setReaction]             = useState("none");
  const [date, setDate]                     = useState(todayLocal());
  const [notes, setNotes]                   = useState("");
  const [saving, setSaving]                 = useState(false);
  const [showAll, setShowAll]               = useState(false);
  const [showForm, setShowForm]             = useState(false);
  const [editingId, setEditingId]           = useState<number | null>(null);

  const sorted    = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayed = showAll ? sorted : sorted.slice(0, 4);

  // Current diet = most recent entry with a food_brand or food_type
  const currentDiet = sorted[0] ?? null;
  const reactionLogs = logs.filter((l) => l.reaction && l.reaction !== "none");

  const resetForm = () => {
    setFoodBrand(""); setFoodType("dry"); setReaction("none");
    setIsFoodChange(false); setPreviousBrand(""); setPrescription(false);
    setNotes(""); setDate(todayLocal()); setShowForm(false); setEditingId(null);
  };

  const startEdit = (log: FoodLog) => {
    setEditingId(log.id);
    setFoodBrand(log.food_brand || "");
    setFoodType(log.food_type || "dry");
    setPrescription(log.prescription || false);
    setIsFoodChange(log.is_food_change || false);
    setPreviousBrand(log.previous_brand || "");
    setReaction(log.reaction || "none");
    setDate(log.date);
    setNotes(log.notes || "");
    setShowForm(true);
  };

  const saveLog = async () => {
    if (!date) return;
    setSaving(true);
    try {
      const url = editingId
        ? `http://localhost:3000/cats/${catId}/food_logs/${editingId}`
        : `http://localhost:3000/cats/${catId}/food_logs`;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          food_log: {
            date, food_brand: foodBrand, food_type: foodType,
            prescription, is_food_change: isFoodChange,
            previous_brand: isFoodChange ? previousBrand : null,
            reaction, notes,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const saved = await res.json();
      if (editingId) {
        onLogsUpdated(logs.map((l) => l.id === editingId ? saved : l));
      } else {
        onLogsUpdated([...logs, saved]);
      }
      resetForm();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const deleteLog = async (id: number) => {
    if (!window.confirm("Delete this entry?")) return;
    await fetch(`http://localhost:3000/cats/${catId}/food_logs/${id}`, { method: "DELETE", credentials: "include" });
    onLogsUpdated(logs.filter((l) => l.id !== id));
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-white">🍽️ Feeding & Diet</h3>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-colors">
          {showForm ? "Cancel" : "+ Log"}
        </button>
      </div>

      {/* Current diet summary */}
      {currentDiet && (
        <div className="bg-gray-900 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">Current diet</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg">{getFoodTypeMeta(currentDiet.food_type || "").icon}</span>
            <span className="text-white font-medium text-sm">
              {currentDiet.food_brand || "Brand not set"}
            </span>
            <span className="text-gray-400 text-xs">
              {getFoodTypeMeta(currentDiet.food_type || "").label}
            </span>
            {currentDiet.prescription && (
              <span className="text-xs bg-cyan-900/50 border border-cyan-700 text-cyan-400 px-2 py-0.5 rounded-full">Rx</span>
            )}
            {reactionLogs.length > 0 && (
              <span className="text-xs text-orange-400 ml-auto">⚠️ {reactionLogs.length} reaction{reactionLogs.length !== 1 ? "s" : ""} logged</span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            As of {new Date(currentDiet.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-gray-500 text-sm italic mb-4">No feeding entries yet.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {displayed.map((log) => {
            const typeMeta     = getFoodTypeMeta(log.food_type || "");
            const reactionMeta = getReactionMeta(log.reaction || "none");
            return (
              <div key={log.id} className="bg-gray-900 rounded-lg p-3 flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-lg shrink-0">{log.is_food_change ? "🔄" : typeMeta.icon}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      {log.is_food_change && (
                        <span className="text-xs bg-orange-900/50 border border-orange-700 text-orange-400 px-2 py-0.5 rounded-full">Food change</span>
                      )}
                      <span className="text-white text-sm font-medium">{log.food_brand || "No brand"}</span>
                      <span className="text-gray-500 text-xs">{typeMeta.label}</span>
                      {log.prescription && <span className="text-xs text-cyan-400">Rx</span>}
                      <span className="text-gray-500 text-xs">
                        {new Date(log.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    {log.is_food_change && log.previous_brand && (
                      <p className="text-xs text-gray-500">Previously: {log.previous_brand}</p>
                    )}
                    {log.reaction && log.reaction !== "none" && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border inline-block mt-0.5 ${reactionMeta.color}`}>
                        Reaction: {reactionMeta.label}
                      </span>
                    )}
                    {log.notes && <p className="text-xs text-gray-500 mt-0.5 truncate">{log.notes}</p>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(log)} className="text-violet-400 text-xs hover:text-violet-300">Edit</button>
                  <button onClick={() => deleteLog(log.id)} className="text-pink-500 text-xs hover:text-pink-400">✕</button>
                </div>
              </div>
            );
          })}
          {sorted.length > 4 && (
            <button onClick={() => setShowAll(!showAll)} className="text-violet-400 text-sm hover:underline">
              {showAll ? "Show less" : `Show all ${sorted.length} entries`}
            </button>
          )}
        </div>
      )}

      {showForm && (
        <div className="border-t border-gray-700 pt-4 space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            {editingId ? "Edit entry" : "Log feeding"}
          </p>

          {/* Food change toggle */}
          <div className="flex items-center gap-3">
            <Toggle value={isFoodChange} onChange={setIsFoodChange} />
            <span className="text-sm text-gray-300">This is a food change</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-36">
              <label className="text-xs text-gray-500 block mb-1">
                {isFoodChange ? "New brand" : "Food brand"} <span className="text-gray-600">(optional)</span>
              </label>
              <input type="text" placeholder="e.g. Hill's Science Diet"
                value={foodBrand} onChange={(e) => setFoodBrand(e.target.value)}
                className="border border-gray-600 bg-gray-900 text-white placeholder-gray-600 p-2 rounded w-full text-sm" />
            </div>
            {isFoodChange && (
              <div className="flex-1 min-w-36">
                <label className="text-xs text-gray-500 block mb-1">Previous brand</label>
                <input type="text" placeholder="e.g. Purina Pro Plan"
                  value={previousBrand} onChange={(e) => setPreviousBrand(e.target.value)}
                  className="border border-gray-600 bg-gray-900 text-white placeholder-gray-600 p-2 rounded w-full text-sm" />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-2">Food type</label>
            <div className="flex gap-2">
              {FOOD_TYPES.map((t) => (
                <button key={t.value} onClick={() => setFoodType(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${foodType === t.value ? "bg-violet-700 border-violet-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-start">
            <div>
              <label className="text-xs text-gray-500 block mb-2">Reaction</label>
              <div className="flex gap-2">
                {REACTIONS.map((r) => (
                  <button key={r.value} onClick={() => setReaction(r.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${reaction === r.value ? r.color : "bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500"}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-2">Date</label>
              <input type="date" value={date} max={todayLocal()} onChange={(e) => setDate(e.target.value)}
                className="border border-gray-600 bg-gray-900 text-white p-1.5 rounded text-sm" />
            </div>
          </div>

          {/* Prescription toggle */}
          <div className="flex items-center gap-3">
            <Toggle value={prescription} onChange={setPrescription} color="bg-cyan-600" />
            <span className="text-sm text-gray-300">Prescription food</span>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Notes <span className="text-gray-600">(optional · max 200)</span></label>
            <input type="text" maxLength={200} placeholder="e.g. eating well, switched due to urinary issues"
              value={notes} onChange={(e) => setNotes(e.target.value)}
              className="border border-gray-600 bg-gray-900 text-white placeholder-gray-600 p-2 rounded w-full text-sm" />
          </div>

          <div className="flex gap-2">
            <button onClick={saveLog} disabled={saving}
              className="bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
              {saving ? "Saving..." : editingId ? "Update" : "Save Entry"}
            </button>
            {editingId && (
              <button onClick={resetForm} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">Cancel</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}