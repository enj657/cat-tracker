import { useState } from "react";
import type { GroomingLog } from "../../types";

interface GroomingSectionProps {
  catId: number;
  logs: GroomingLog[];
  onLogsUpdated: (logs: GroomingLog[]) => void;
}

const GROOMING_TYPES = [
  { value: "nail_trim",  label: "Nail Trim",         icon: "✂️" },
  { value: "bath",       label: "Bath",              icon: "🛁" },
  { value: "brush",      label: "Brushing",          icon: "🪮" },
  { value: "groom",      label: "Grooming",          icon: "✨" },
  { value: "dental",     label: "Dental Cleaning",   icon: "🦷" },
  { value: "ear_clean",  label: "Ear Cleaning",      icon: "👂" },
  { value: "other",      label: "Other",             icon: "📋" },
];

const PERFORMED_BY = [
  { value: "owner",   label: "Me"      },
  { value: "groomer", label: "Groomer" },
  { value: "vet",     label: "Vet"     },
];

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMeta(value: string) {
  return GROOMING_TYPES.find((t) => t.value === value) ?? { label: value, icon: "📋" };
}

export default function GroomingSection({ catId, logs, onLogsUpdated }: GroomingSectionProps) {
  const [groomingType, setGroomingType] = useState("");
  const [performedBy, setPerformedBy]   = useState("owner");
  const [date, setDate]                 = useState(todayLocal());
  const [nextDue, setNextDue]           = useState("");
  const [notes, setNotes]               = useState("");
  const [saving, setSaving]             = useState(false);
  const [showAll, setShowAll]           = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [editingId, setEditingId]       = useState<number | null>(null);

  const sorted    = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayed = showAll ? sorted : sorted.slice(0, 4);
  const today     = todayLocal();

  // ALL entries with a next_due_date that are overdue or due within 7 days
  const dueSoonEntries = logs
    .filter((l) => {
      if (!l.next_due_date) return false;
      const days = Math.ceil((new Date(l.next_due_date + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86400000);
      return days <= 7;
    })
    .sort((a, b) => new Date(a.next_due_date!).getTime() - new Date(b.next_due_date!).getTime());

  const resetForm = () => {
    setGroomingType(""); setNotes(""); setNextDue(""); setDate(todayLocal());
    setPerformedBy("owner"); setShowForm(false); setEditingId(null);
  };

  const startEdit = (log: GroomingLog) => {
    setEditingId(log.id);
    setGroomingType(log.grooming_type);
    setPerformedBy(log.performed_by || "owner");
    setDate(log.date);
    setNextDue(log.next_due_date || "");
    setNotes(log.notes || "");
    setShowForm(true);
  };

  const saveLog = async () => {
    if (!groomingType || !date) return;
    setSaving(true);
    try {
      const url = editingId
        ? `http://localhost:3000/cats/${catId}/grooming_logs/${editingId}`
        : `http://localhost:3000/cats/${catId}/grooming_logs`;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ grooming_log: { date, grooming_type: groomingType, performed_by: performedBy, next_due_date: nextDue || null, notes } }),
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
    await fetch(`http://localhost:3000/cats/${catId}/grooming_logs/${id}`, { method: "DELETE", credentials: "include" });
    onLogsUpdated(logs.filter((l) => l.id !== id));
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-white">✂️ Grooming & Maintenance</h3>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-colors">
          {showForm ? "Cancel" : "+ Log"}
        </button>
      </div>

      {/* Due soon / overdue alerts — shows ALL matching entries */}
      {dueSoonEntries.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {dueSoonEntries.map((entry) => {
            const daysUntil = Math.ceil((new Date(entry.next_due_date! + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86400000);
            const isOverdue = daysUntil < 0;
            const meta = getMeta(entry.grooming_type);
            return (
              <div key={entry.id} className={`rounded-lg px-3 py-2 text-sm flex items-center justify-between ${isOverdue ? "bg-pink-900/40 border border-pink-700" : "bg-yellow-900/40 border border-yellow-700"}`}>
                <span className={isOverdue ? "text-pink-300" : "text-yellow-300"}>
                  {isOverdue ? "⚠️ Overdue" : "📅 Due soon"} · <span className="font-medium">{meta.icon} {meta.label}</span>
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(entry.next_due_date! + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {isOverdue ? ` (${Math.abs(daysUntil)}d ago)` : ` (${daysUntil}d)`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Log list */}
      {sorted.length === 0 ? (
        <p className="text-gray-500 text-sm italic mb-4">No grooming entries yet.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {displayed.map((log) => {
            const meta = getMeta(log.grooming_type);
            return (
              <div key={log.id} className="bg-gray-900 rounded-lg p-3 flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-lg shrink-0">{meta.icon}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-white text-sm font-medium">{meta.label}</span>
                      {log.performed_by && (
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                          {PERFORMED_BY.find((p) => p.value === log.performed_by)?.label ?? log.performed_by}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(log.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    {log.next_due_date && (
                      <p className="text-xs text-cyan-500 mt-0.5">
                        Next due: {new Date(log.next_due_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
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
            {editingId ? "Edit entry" : "Log grooming"}
          </p>
          <div>
            <label className="text-xs text-gray-500 block mb-2">Type <span className="text-pink-400">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {GROOMING_TYPES.map((t) => (
                <button key={t.value} onClick={() => setGroomingType(t.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-colors ${groomingType === t.value ? "bg-violet-700 border-violet-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Performed by</label>
              <div className="flex gap-2">
                {PERFORMED_BY.map((p) => (
                  <button key={p.value} onClick={() => setPerformedBy(p.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${performedBy === p.value ? "bg-violet-700 border-violet-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Date</label>
              <input type="date" value={date} max={todayLocal()} onChange={(e) => setDate(e.target.value)}
                className="border border-gray-600 bg-gray-900 text-white p-1.5 rounded text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Next due <span className="text-gray-600">(optional)</span></label>
              <input type="date" value={nextDue} min={todayLocal()} onChange={(e) => setNextDue(e.target.value)}
                className="border border-gray-600 bg-gray-900 text-white p-1.5 rounded text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Notes <span className="text-gray-600">(optional · max 200)</span></label>
            <input type="text" maxLength={200} placeholder="e.g. resisted nail trim, used Zymox for ears"
              value={notes} onChange={(e) => setNotes(e.target.value)}
              className="border border-gray-600 bg-gray-900 text-white placeholder-gray-600 p-2 rounded w-full text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={saveLog} disabled={saving || !groomingType}
              className="bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
              {saving ? "Saving..." : editingId ? "Update" : "Save Entry"}
            </button>
            {editingId && (
              <button onClick={resetForm} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}