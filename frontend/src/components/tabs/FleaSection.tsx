import { useState } from "react";
import type { FleaTreatment } from "../../types";

interface FleaSectionProps {
  catId: number;
  treatments: FleaTreatment[];
  onTreatmentsUpdated: (treatments: FleaTreatment[]) => void;
}

const TREATMENT_TYPES = [
  { value: "flea_tick",  label: "Flea & Tick",  icon: "🐛", defaultDays: 30 },
  { value: "flea_only",  label: "Flea Only",    icon: "🦟", defaultDays: 30 },
  { value: "tick_only",  label: "Tick Only",    icon: "🕷️", defaultDays: 30 },
  { value: "deworming",  label: "Deworming",    icon: "💊", defaultDays: 90 },
  { value: "combined",   label: "Combined",     icon: "🧪", defaultDays: 30 },
];

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMeta(value: string) {
  return TREATMENT_TYPES.find((t) => t.value === value) ?? { label: value, icon: "💊", defaultDays: 30 };
}

export default function FleaSection({ catId, treatments, onTreatmentsUpdated }: FleaSectionProps) {
  const [treatmentType, setTreatmentType] = useState("flea_tick");
  const [productName, setProductName]     = useState("");
  const [date, setDate]                   = useState(todayLocal());
  const [nextDue, setNextDue]             = useState(addDays(todayLocal(), 30));
  const [notes, setNotes]                 = useState("");
  const [saving, setSaving]               = useState(false);
  const [showAll, setShowAll]             = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const [editingId, setEditingId]         = useState<number | null>(null);

  const sorted    = [...treatments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayed = showAll ? sorted : sorted.slice(0, 4);
  const today     = todayLocal();

  // Group by treatment type — show status per type
  const typeStatuses = TREATMENT_TYPES.map((type) => {
    const latest = sorted.find((t) => t.treatment_type === type.value);
    if (!latest?.next_due_date) return null;
    const days = Math.ceil((new Date(latest.next_due_date + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86400000);
    return { type, latest, days };
  }).filter(Boolean) as { type: typeof TREATMENT_TYPES[0]; latest: FleaTreatment; days: number }[];

  const resetForm = () => {
    setProductName(""); setNotes(""); setDate(todayLocal());
    setNextDue(addDays(todayLocal(), getMeta(treatmentType).defaultDays));
    setShowForm(false); setEditingId(null);
  };

  const startEdit = (t: FleaTreatment) => {
    setEditingId(t.id);
    setTreatmentType(t.treatment_type);
    setProductName(t.product_name || "");
    setDate(t.date);
    setNextDue(t.next_due_date || "");
    setNotes(t.notes || "");
    setShowForm(true);
  };

  const handleTypeChange = (type: string) => {
    setTreatmentType(type);
    setNextDue(addDays(date, getMeta(type).defaultDays));
  };

  const saveTreatment = async () => {
    if (!date) return;
    setSaving(true);
    try {
      const url = editingId
        ? `http://localhost:3000/cats/${catId}/flea_treatments/${editingId}`
        : `http://localhost:3000/cats/${catId}/flea_treatments`;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ flea_treatment: { date, treatment_type: treatmentType, product_name: productName, next_due_date: nextDue, notes } }),
      });
      if (!res.ok) throw new Error("Failed");
      const saved = await res.json();
      if (editingId) {
        onTreatmentsUpdated(treatments.map((t) => t.id === editingId ? saved : t));
      } else {
        onTreatmentsUpdated([...treatments, saved]);
      }
      resetForm();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const deleteTreatment = async (id: number) => {
    if (!window.confirm("Delete this entry?")) return;
    await fetch(`http://localhost:3000/cats/${catId}/flea_treatments/${id}`, { method: "DELETE", credentials: "include" });
    onTreatmentsUpdated(treatments.filter((t) => t.id !== id));
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-white">🐛 Flea, Tick & Deworming</h3>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-colors">
          {showForm ? "Cancel" : "+ Log"}
        </button>
      </div>

      {/* Status per treatment type */}
      {typeStatuses.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {typeStatuses.map(({ type, latest, days }) => {
            const isOverdue = days < 0;
            const isSoon    = days >= 0 && days <= 7;
            return (
              <div key={type.value} className={`rounded-lg px-3 py-2 text-sm flex items-center justify-between ${
                isOverdue ? "bg-pink-900/40 border border-pink-700"
                : isSoon  ? "bg-yellow-900/40 border border-yellow-700"
                          : "bg-green-900/40 border border-green-700"
              }`}>
                <span className={isOverdue ? "text-pink-300" : isSoon ? "text-yellow-300" : "text-green-300"}>
                  {isOverdue ? "⚠️ Overdue" : isSoon ? "📅 Due soon" : "✅ Up to date"} · {type.icon} {type.label}
                  {latest.product_name ? ` · ${latest.product_name}` : ""}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(latest.next_due_date! + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {isOverdue ? ` (${Math.abs(days)}d ago)` : days === 0 ? " (today)" : ` (${days}d)`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-gray-500 text-sm italic mb-4">No treatments logged yet.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {displayed.map((t) => {
            const meta = getMeta(t.treatment_type);
            return (
              <div key={t.id} className="bg-gray-900 rounded-lg p-3 flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-lg shrink-0">{meta.icon}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-white text-sm font-medium">{meta.label}</span>
                      {t.product_name && <span className="text-xs text-violet-400">{t.product_name}</span>}
                      <span className="text-xs text-gray-500">
                        {new Date(t.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    {t.next_due_date && (
                      <p className="text-xs text-cyan-500 mt-0.5">
                        Next due: {new Date(t.next_due_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    )}
                    {t.notes && <p className="text-xs text-gray-500 mt-0.5 truncate">{t.notes}</p>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(t)} className="text-violet-400 text-xs hover:text-violet-300">Edit</button>
                  <button onClick={() => deleteTreatment(t.id)} className="text-pink-500 text-xs hover:text-pink-400">✕</button>
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
            {editingId ? "Edit entry" : "Log treatment"}
          </p>
          <div>
            <label className="text-xs text-gray-500 block mb-2">Treatment type</label>
            <div className="flex flex-wrap gap-1.5">
              {TREATMENT_TYPES.map((t) => (
                <button key={t.value} onClick={() => handleTypeChange(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${treatmentType === t.value ? "bg-violet-700 border-violet-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                  <span>{t.icon}</span>{t.label}
                  <span className="text-gray-500 ml-1">({t.defaultDays}d)</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Next due auto-set to {getMeta(treatmentType).defaultDays} days — adjust below if needed
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-40">
              <label className="text-xs text-gray-500 block mb-1">Product name <span className="text-gray-600">(optional)</span></label>
              <input type="text" placeholder="e.g. Frontline Plus, Panacur"
                value={productName} onChange={(e) => setProductName(e.target.value)}
                className="border border-gray-600 bg-gray-900 text-white placeholder-gray-600 p-2 rounded w-full text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Date applied</label>
              <input type="date" value={date} max={todayLocal()}
                onChange={(e) => { setDate(e.target.value); setNextDue(addDays(e.target.value, getMeta(treatmentType).defaultDays)); }}
                className="border border-gray-600 bg-gray-900 text-white p-1.5 rounded text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Next due</label>
              <input type="date" value={nextDue} min={todayLocal()} onChange={(e) => setNextDue(e.target.value)}
                className="border border-gray-600 bg-gray-900 text-white p-1.5 rounded text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Notes <span className="text-gray-600">(optional · max 200)</span></label>
            <input type="text" maxLength={200} placeholder="e.g. applied between shoulder blades"
              value={notes} onChange={(e) => setNotes(e.target.value)}
              className="border border-gray-600 bg-gray-900 text-white placeholder-gray-600 p-2 rounded w-full text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={saveTreatment} disabled={saving}
              className="bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
              {saving ? "Saving..." : editingId ? "Update" : "Save Treatment"}
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