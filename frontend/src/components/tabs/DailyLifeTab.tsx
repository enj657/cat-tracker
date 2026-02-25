import type { Cat, Reminder } from "../../types";
import ReminderList from "../ReminderList";

// ── Sub-components declared OUTSIDE the main component ──────────────────────

function StatusCard({
  icon,
  label,
  count,
  color,
  empty,
}: {
  icon: string;
  label: string;
  count: number;
  color: string;
  empty: string;
}) {
  return (
    <div className={`bg-gray-900 rounded-xl p-4 border-l-4 ${color}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-lg">{icon}</span>
        <span className={`text-2xl font-bold ${color.replace("border-", "text-")}`}>
          {count}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-300">{label}</p>
      {count === 0 && <p className="text-xs text-gray-500 mt-1">{empty}</p>}
    </div>
  );
}

function ReminderChip({ reminder }: { reminder: Reminder }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = reminder.due_date && new Date(reminder.due_date) < today;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        isOverdue
          ? "bg-pink-900/40 border border-pink-700"
          : "bg-gray-900 border border-gray-700"
      }`}
    >
      <div>
        <p
          className={`font-medium text-sm ${
            reminder.completed ? "line-through text-gray-500" : "text-white"
          }`}
        >
          {reminder.title}
        </p>
        {reminder.due_date && (
          <p className={`text-xs mt-0.5 ${isOverdue ? "text-pink-400" : "text-gray-500"}`}>
            {isOverdue ? "⚠️ Overdue · " : ""}
            {new Date(reminder.due_date).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}

function RoutineSection({
  icon,
  title,
  color,
  items,
  emptyText,
}: {
  icon: string;
  title: string;
  color: string;
  items: Reminder[];
  emptyText: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3 className={`font-semibold text-sm uppercase tracking-wider ${color}`}>
          {title}
        </h3>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm italic pl-7">{emptyText}</p>
      ) : (
        <div className="space-y-2 pl-2">
          {items.map((r) => (
            <ReminderChip key={r.id} reminder={r} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface DailyLifeTabProps {
  cat: Cat;
  onRemindersUpdated: (reminders: Reminder[]) => void;
}

const GROOMING_KEYWORDS = ["groom", "brush", "bath", "nail", "trim", "fur", "coat"];
const FLEA_KEYWORDS = ["flea", "tick", "parasite", "frontline", "revolution", "advantage", "prevention"];
const FEEDING_KEYWORDS = ["feed", "food", "meal", "diet", "water", "treat"];

function categorize(r: Reminder) {
  const lower = (r.title || "").toLowerCase();
  if (GROOMING_KEYWORDS.some((k) => lower.includes(k))) return "grooming";
  if (FLEA_KEYWORDS.some((k) => lower.includes(k))) return "flea";
  if (FEEDING_KEYWORDS.some((k) => lower.includes(k))) return "feeding";
  return "general";
}

export default function DailyLifeTab({ cat, onRemindersUpdated }: DailyLifeTabProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reminders = cat.reminders || [];

  const overdueReminders  = reminders.filter((r) => !r.completed && r.due_date && new Date(r.due_date) < today);
  const upcomingReminders = reminders.filter((r) => !r.completed && (!r.due_date || new Date(r.due_date) >= today));

  const groomingReminders = upcomingReminders.filter((r) => categorize(r) === "grooming");
  const fleaReminders     = upcomingReminders.filter((r) => categorize(r) === "flea");
  const feedingReminders  = upcomingReminders.filter((r) => categorize(r) === "feeding");
  const generalReminders  = upcomingReminders.filter((r) => categorize(r) === "general");

  const behaviorNotes = (cat.visits || [])
    .filter((v) => v.notes && v.notes.trim())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatusCard icon="⚠️"  label="Overdue"       count={overdueReminders.length}  color="border-pink-500"   empty="All caught up!"  />
        <StatusCard icon="✂️"  label="Grooming Due"  count={groomingReminders.length} color="border-violet-500" empty="Looking fresh!"   />
        <StatusCard icon="🐛"  label="Flea/Tick Due" count={fleaReminders.length}     color="border-orange-500" empty="Up to date!"      />
        <StatusCard icon="🍽️" label="Feeding Notes" count={feedingReminders.length}  color="border-cyan-500"   empty="Nothing logged"   />
      </div>

      {/* Overdue Alert */}
      {overdueReminders.length > 0 && (
        <div className="bg-pink-900/30 border border-pink-600 rounded-xl p-4">
          <h3 className="text-pink-400 font-bold mb-3 flex items-center gap-2">
            <span>⚠️</span> Needs Attention
          </h3>
          <div className="space-y-2">
            {overdueReminders.map((r) => (
              <ReminderChip key={r.id} reminder={r} />
            ))}
          </div>
        </div>
      )}

      {/* Categorized Upcoming */}
      <div className="bg-gray-800 rounded-xl p-5">
        <h3 className="font-bold text-lg mb-4 text-white">Routine Schedule</h3>
        <RoutineSection icon="✂️"  title="Grooming"               color="text-violet-400" items={groomingReminders} emptyText="No grooming reminders — add one below!" />
        <RoutineSection icon="🐛"  title="Flea & Tick Prevention"  color="text-orange-400" items={fleaReminders}     emptyText="No flea/tick reminders set"             />
        <RoutineSection icon="🍽️" title="Feeding"                 color="text-cyan-400"   items={feedingReminders}  emptyText="No feeding reminders set"               />
        <RoutineSection icon="📋"  title="General Reminders"       color="text-gray-400"   items={generalReminders}  emptyText="No upcoming reminders"                  />
      </div>

      {/* Behavior Notes from Vet Visits */}
      {behaviorNotes.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-5">
          <h3 className="font-bold text-lg mb-4 text-white">📝 Behavior & Visit Notes</h3>
          <div className="space-y-3">
            {behaviorNotes.map((v) => (
              <div key={v.id} className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-violet-400">{v.visit_type}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(v.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 italic">"{v.notes}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Reminders Manager */}
      <div>
        <h3 className="font-bold text-lg mb-3 text-white">Manage All Reminders</h3>
        <ReminderList
          catId={cat.id}
          reminders={cat.reminders}
          onRemindersUpdated={onRemindersUpdated}
        />
      </div>
    </div>
  );
}