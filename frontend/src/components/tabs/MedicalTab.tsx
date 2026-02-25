import type { Cat } from "../../types";
import type { Visit, Weight } from "../../types";
import VisitList from "../VisitList";
import WeightTracker from "./WeightTracker";

interface MedicalTabProps {
  cat: Cat;
  onVisitsUpdated: (visits: Visit[]) => void;
  onWeightsUpdated: (weights: Weight[]) => void;
}

export default function MedicalTab({ cat, onVisitsUpdated, onWeightsUpdated }: MedicalTabProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visits = cat.visits || [];
  const weights = cat.weights || [];

  const upcomingVisits = visits
    .filter((v) => !v.completed && new Date(v.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const overdueVisits = visits.filter(
    (v) => !v.completed && new Date(v.date) < today
  );

  const completedVisits = visits
    .filter((v) => v.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastVisit = completedVisits[0];

  const daysSinceLastVisit = lastVisit
    ? Math.floor(
        (today.getTime() - new Date(lastVisit.date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const nextVisit = upcomingVisits[0];
  const daysUntilNextVisit = nextVisit
    ? Math.ceil(
        (new Date(nextVisit.date).getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Health alert severity
  const hasOverdue = overdueVisits.length > 0;
  const noVisitLong = daysSinceLastVisit !== null && daysSinceLastVisit > 365;

  return (
    <div className="space-y-6">
      {/* Health Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-900 rounded-xl p-4 border-l-4 border-violet-500">
          <p className="text-2xl font-black text-violet-400">
            {visits.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Visits</p>
        </div>
        <div
          className={`bg-gray-900 rounded-xl p-4 border-l-4 ${
            hasOverdue ? "border-pink-500" : "border-green-500"
          }`}
        >
          <p
            className={`text-2xl font-black ${
              hasOverdue ? "text-pink-400" : "text-green-400"
            }`}
          >
            {overdueVisits.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Overdue Visits</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border-l-4 border-cyan-500">
          <p className="text-2xl font-black text-cyan-400">
            {upcomingVisits.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Upcoming Visits</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border-l-4 border-orange-500">
          <p className="text-2xl font-black text-orange-400">
            {weights.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Weight Entries</p>
        </div>
      </div>

      {/* Health Alerts */}
      {(hasOverdue || noVisitLong) && (
        <div className="bg-pink-900/30 border border-pink-600 rounded-xl p-4 space-y-2">
          <h3 className="text-pink-400 font-bold flex items-center gap-2">
            <span>🚨</span> Health Alerts
          </h3>
          {hasOverdue && (
            <p className="text-sm text-pink-300">
              {overdueVisits.length} overdue vet visit{overdueVisits.length !== 1 ? "s" : ""} need attention.
            </p>
          )}
          {noVisitLong && (
            <p className="text-sm text-pink-300">
              It's been {daysSinceLastVisit} days since the last recorded vet visit.
            </p>
          )}
        </div>
      )}

      {/* Quick Visit Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Last Visit</h4>
          {lastVisit ? (
            <>
              <p className="font-semibold text-white">{lastVisit.visit_type}</p>
              <p className="text-sm text-gray-400">
                {new Date(lastVisit.date).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {daysSinceLastVisit === 0
                  ? "Today"
                  : `${daysSinceLastVisit} days ago`}
              </p>
              {lastVisit.notes && (
                <p className="text-xs text-gray-500 mt-2 italic">"{lastVisit.notes}"</p>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm italic">No visits recorded yet</p>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Next Visit</h4>
          {nextVisit ? (
            <>
              <p className="font-semibold text-white">{nextVisit.visit_type}</p>
              <p className="text-sm text-cyan-400">
                {new Date(nextVisit.date).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {daysUntilNextVisit === 0
                  ? "Today!"
                  : `in ${daysUntilNextVisit} day${daysUntilNextVisit !== 1 ? "s" : ""}`}
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-sm italic">No upcoming visits scheduled</p>
          )}
        </div>
      </div>

      {/* Weight Tracker */}
      <WeightTracker
        catId={cat.id}
        weights={weights}
        onWeightsUpdated={onWeightsUpdated}
      />

      {/* Vaccination Status - Placeholder */}
      <div className="bg-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-white">💉 Vaccinations</h3>
          <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
        <p className="text-gray-500 text-sm italic">
          Track vaccination history and upcoming due dates. This feature is on the roadmap!
        </p>
        <div className="mt-3 space-y-2 opacity-50 pointer-events-none">
          {["Rabies", "FVRCP", "FeLV"].map((vaccine) => (
            <div
              key={vaccine}
              className="flex items-center justify-between bg-gray-900 rounded-lg p-3"
            >
              <span className="text-sm text-white">{vaccine}</span>
              <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded-full">
                — / — / —
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Medication Tracker - Placeholder */}
      <div className="bg-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-white">💊 Medications</h3>
          <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
        <p className="text-gray-500 text-sm italic">
          Track prescriptions, dosages, and schedules. Coming in a future update!
        </p>
      </div>

      {/* Full Visit Manager */}
      <div>
        <h3 className="font-bold text-lg mb-3 text-white">Manage Vet Visits</h3>
        <VisitList
          catId={cat.id}
          visits={cat.visits}
          onVisitsUpdated={onVisitsUpdated}
        />
      </div>
    </div>
  );
}