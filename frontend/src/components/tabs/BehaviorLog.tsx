import { useState } from "react";
import type { BehaviorLog } from "../../types";

interface BehaviorLogProps {
  catId: number;
  logs: BehaviorLog[];
  onLogsUpdated: (logs: BehaviorLog[]) => void;
}

const CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: "vomiting",        label: "Vomiting",          icon: "🤢" },
  { value: "limping",         label: "Limping",            icon: "🦵" },
  { value: "hiding",          label: "Hiding",             icon: "🫣" },
  { value: "aggression",      label: "Aggression",         icon: "😾" },
  { value: "litter_box",      label: "Litter Box Issue",   icon: "🪣" },
  { value: "appetite_change", label: "Appetite Change",    icon: "🍽️" },
  { value: "lethargy",        label: "Lethargy",           icon: "😴" },
  { value: "scratching",      label: "Scratching",         icon: "🐾" },
  { value: "sneezing",        label: "Sneezing",           icon: "🤧" },
  { value: "other",           label: "Other",              icon: "📋" },
];

const SEVERITIES: { value: string; label: string; color: string }[] = [
  { value: "mild",     label: "Mild",     color: "text-yellow-400 border-yellow-600 bg-yellow-900/30" },
  { value: "moderate", label: "Moderate", color: "text-orange-400 border-orange-600 bg-orange-900/30" },
  { value: "severe",   label: "Severe",   color: "text-pink-400 border-pink-600 bg-pink-900/30" },
];

function getCategoryMeta(value: string) {
  return CATEGORIES.find((c) => c.value === value) ?? { label: value, icon: "📋" };
}

function getSeverityMeta(value: string) {
  return SEVERITIES.find((s) => s.value === value) ?? SEVERITIES[0];
}

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function BehaviorLogSection({
  catId,
  logs,
  onLogsUpdated,
}: BehaviorLogProps) {
  const [date, setDate]             = useState(todayLocal());
  const [category, setCategory]     = useState("");
  const [severity, setSeverity]     = useState("mild");
  const [description, setDescription] = useState("");
  const [saving, setSaving]         = useState(false);
  const [showAll, setShowAll]       = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  const sorted = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = filterCategory === "all"
    ? sorted
    : sorted.filter((l) => l.category === filterCategory);

  const displayed = showAll ? filtered : filtered.slice(0, 5);

  // Count per category for the summary bar
  const categoryCounts = CATEGORIES.map((c) => ({
    ...c,
    count: logs.filter((l) => l.category === c.value).length,
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  const addLog = async () => {
    if (!category || !date) return;
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/cats/${catId}/behavior_logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          behavior_log: { date, category, severity, description },
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const newLog = await res.json();
      onLogsUpdated([...logs, newLog]);
      setCategory("");
      setDescription("");
      setSeverity("mild");
      setDate(todayLocal());
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const deleteLog = async (id: number) => {
    if (!window.confirm("Delete this behavior entry?")) return;
    try {
      await fetch(`http://localhost:3000/cats/${catId}/behavior_logs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      onLogsUpdated(logs.filter((l) => l.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h3 className="font-bold text-lg mb-4 text-white">🧠 Behavior Log</h3>

      {/* Category summary chips */}
      {categoryCounts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {categoryCounts.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilterCategory(filterCategory === c.value ? "all" : c.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterCategory === c.value
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
              <span className={`ml-0.5 font-bold ${
                filterCategory === c.value ? "text-violet-200" : "text-gray-500"
              }`}>
                {c.count}
              </span>
            </button>
          ))}
          {filterCategory !== "all" && (
            <button
              onClick={() => setFilterCategory("all")}
              className="text-xs text-gray-500 hover:text-gray-300 px-2"
            >
              Clear filter ✕
            </button>
          )}
        </div>
      )}

      {/* Log list */}
      {sorted.length === 0 ? (
        <p className="text-gray-500 text-sm italic mb-5">
          No behavior entries yet. Log the first one below!
        </p>
      ) : (
        <div className="space-y-2 mb-5">
          {displayed.map((log) => {
            const cat = getCategoryMeta(log.category);
            const sev = getSeverityMeta(log.severity);
            return (
              <div
                key={log.id}
                className="bg-gray-900 rounded-lg p-3 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-xl shrink-0 mt-0.5">{cat.icon}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-white text-sm font-medium">{cat.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${sev.color}`}>
                        {sev.label}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(log.date + "T00:00:00").toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                    </div>
                    {log.description && (
                      <p className="text-gray-400 text-xs truncate">{log.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteLog(log.id)}
                  className="text-pink-500 text-xs hover:text-pink-400 shrink-0 mt-1"
                >
                  ✕
                </button>
              </div>
            );
          })}

          {filtered.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-violet-400 text-sm hover:underline"
            >
              {showAll ? "Show less" : `Show all ${filtered.length} entries`}
            </button>
          )}
        </div>
      )}

      {/* Add entry form */}
      <div className="border-t border-gray-700 pt-4 space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Log an incident</p>

        {/* Category grid */}
        <div>
          <label className="text-xs text-gray-500 block mb-2">
            Category <span className="text-pink-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors text-left ${
                  category === c.value
                    ? "bg-violet-700 border-violet-500 text-white"
                    : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                <span>{c.icon}</span>
                <span className="text-xs">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Severity + Date row */}
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-2">Severity</label>
            <div className="flex gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSeverity(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs border font-medium transition-colors ${
                    severity === s.value
                      ? s.color
                      : "bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-500"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-2">Date</label>
            <input
              type="date"
              value={date}
              max={todayLocal()}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-600 bg-gray-900 text-white p-1.5 rounded text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Notes <span className="text-gray-600">(optional · max 200 chars)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. vomited twice in the morning, seemed fine after"
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-600 bg-gray-900 text-white placeholder-gray-600 p-2 rounded w-full text-sm pr-12"
            />
            {description.length > 0 && (
              <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${
                description.length > 180 ? "text-orange-400" : "text-gray-600"
              }`}>
                {description.length}/200
              </span>
            )}
          </div>
        </div>

        <button
          onClick={addLog}
          disabled={saving || !category}
          title={!category ? "Select a category first" : ""}
          className="bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? "Saving..." : "Log Behavior"}
        </button>
      </div>
    </div>
  );
}