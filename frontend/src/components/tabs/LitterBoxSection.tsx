import { useState } from "react";
import type { LitterBoxLog } from "../../types";

interface LitterBoxSectionProps {
  catId: number;
  logs: LitterBoxLog[];
  onLogsUpdated: (logs: LitterBoxLog[]) => void;
}

const ACTIONS = [
  { value: "cleaned",         label: "Scooped / Cleaned",    icon: "🧹" },
  { value: "full_change",     label: "Full Litter Change",   icon: "🪣" },
  { value: "new_litter_type", label: "New Litter Brand/Type",icon: "🔄" },
];

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMeta(value: string) {
  return ACTIONS.find((a) => a.value === value) ?? { label: value, icon: "🪣" };
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${value ? "bg-pink-600" : "bg-gray-700"}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${value ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function LitterBoxSection({ catId, logs, onLogsUpdated }: LitterBoxSectionProps) {
  const [action, setAction]           = useState("");
  const [hasIssue, setHasIssue]       = useState(false);
  const [litterBrand, setLitterBrand] = useState("");
  const [date, setDate]               = useState(todayLocal());
  const [notes, setNotes]             = useState("");
  const [saving, setSaving]           = useState(false);
  const [showAll, setShowAll]         = useState(false);
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);

  const sorted    = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayed = showAll ? sorted : sorted.slice(0, 4);
  const today     = todayLocal();

  const issues    = logs.filter((l) => l.has_issue);
  const lastClean = sorted.find((l) => l.action === "cleaned" || l.action === "full_change");
  const daysSinceClean = lastClean
    ? Math.floor((new Date(today + "T00:00:00").getTime() - new Date(lastClean.date + "T00:00:00").getTime()) / 86400000)
    : null;

  const resetForm = () => {
    setAction(""); setHasIssue(false); setLitterBrand(""); setNotes(""); setDate(todayLocal()); setShowForm(false); setEditingId(null);
  };

  const startEdit = (log: LitterBoxLog) => {
    setEditingId(log.id);
    setAction(log.action);
    setHasIssue(log.has_issue || false);
    setLitterBrand(log.litter_brand || "");
    setDate(log.date);
    setNotes(log.notes || "");
    setShowForm(true);
  };

  const saveLog = async () => {
    if (!action || !date) return;
    setSaving(true);
    try {
      const url = editingId
        ? `http://localhost:3000/cats/${catId}/litter_box_logs/${editingId}`
        : `http://localhost:3000/cats/${catId}/litter_box_logs`;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ litter_box_log: { date, action, has_issue: hasIssue, litter_brand: litterBrand, notes } }),
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
    await fetch(`http://localhost:3000/cats/${catId}/litter_box_logs/${id}`, { method: "DELETE", credentials: "include" });
    onLogsUpdated(logs.filter((l) => l.id !== id));
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-white">🪣 Litter Box</h3>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-colors">
          {showForm ? "Cancel" : "+ Log"}
        </button>
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-2 mb-4">
        {daysSinceClean !== null && (
          <div className={`rounded-lg px-3 py-2 text-sm ${daysSinceClean > 2 ? "bg-orange-900/40 border border-orange-700 text-orange-300" : "bg-green-900/40 border border-green-700 text-green-300"}`}>
            {daysSinceClean === 0 ? "✅ Cleaned today" : daysSinceClean === 1 ? "🧹 Cleaned yesterday" : `⚠️ Last cleaned ${daysSinceClean} day${daysSinceClean !== 1 ? "s" : ""} ago`}
          </div>
        )}
        {issues.length > 0 && (
          <div className="rounded-lg px-3 py-2 text-sm bg-pink-900/40 border border-pink-700 text-pink-300">
            ⚠️ {issues.length} issue{issues.length !== 1 ? "s" : ""} logged
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="text-gray-500 text-sm italic mb-4">No litter box entries yet.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {displayed.map((log) => {
            const meta = getMeta(log.action);
            return (
              <div key={log.id} className={`rounded-lg p-3 flex items-start justify-between gap-2 ${log.has_issue ? "bg-pink-950/50 border border-pink-900" : "bg-gray-900"}`}>
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-lg shrink-0">{meta.icon}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-white text-sm font-medium">{meta.label}</span>
                      {log.has_issue && (
                        <span className="text-xs bg-pink-900/60 border border-pink-700 text-pink-400 px-2 py-0.5 rounded-full">⚠️ Issue noted</span>
                      )}
                      {log.litter_brand && <span className="text-xs text-violet-400">{log.litter_brand}</span>}
                      <span className="text-xs text-gray-500">
                        {new Date(log.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
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
            {editingId ? "Edit entry" : "Log litter box"}
          </p>

          <div>
            <label className="text-xs text-gray-500 block mb-2">Action <span className="text-pink-400">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {ACTIONS.map((a) => (
                <button key={a.value} onClick={() => setAction(a.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-colors ${action === a.value ? "bg-violet-700 border-violet-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                  <span>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Issue toggle — separate from action, can be combined */}
          <div className="flex items-center gap-3">
            <Toggle value={hasIssue} onChange={setHasIssue} />
            <span className="text-sm text-gray-300">Issue noted <span className="text-gray-600 text-xs">(going outside box, unusual odor, etc.)</span></span>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-36">
              <label className="text-xs text-gray-500 block mb-1">Litter brand <span className="text-gray-600">(optional)</span></label>
              <input type="text" placeholder="e.g. Dr. Elsey's, Fresh Step"
                value={litterBrand} onChange={(e) => setLitterBrand(e.target.value)}
                className="border border-gray-600 bg-gray-900 text-white placeholder-gray-600 p-2 rounded w-full text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Date</label>
              <input type="date" value={date} max={todayLocal()} onChange={(e) => setDate(e.target.value)}
                className="border border-gray-600 bg-gray-900 text-white p-1.5 rounded text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Notes <span className="text-gray-600">(optional · max 200)</span></label>
            <input type="text" maxLength={200} placeholder="e.g. going outside the box, blood in urine noticed"
              value={notes} onChange={(e) => setNotes(e.target.value)}
              className="border border-gray-600 bg-gray-900 text-white placeholder-gray-600 p-2 rounded w-full text-sm" />
          </div>

          <div className="flex gap-2">
            <button onClick={saveLog} disabled={saving || !action}
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