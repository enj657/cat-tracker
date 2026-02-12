import { useState } from "react";
import type { Visit } from "../types";

interface VisitListProps {
  catId: number;
  visits?: Visit[];
  onVisitsUpdated: (updated: Visit[]) => void;
}

export default function VisitList({
  catId,
  visits = [],
  onVisitsUpdated,
}: VisitListProps) {
  const [visitType, setVisitType] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [showAll, setShowAll] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const addVisit = async () => {
    if (!visitType || !date)
      return alert("Please enter visit type and date");

    try {
      const res = await fetch(
        `http://localhost:3000/cats/${catId}/visits`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            visit: {
              visit_type: visitType,
              date,
              notes,
              completed: false,
            },
          }),
        }
      );

      const newVisit = await res.json();
      onVisitsUpdated([...visits, newVisit]);
      setVisitType("");
      setDate("");
      setNotes("");
    } catch (error) {
      console.error("Error adding visit:", error);
    }
  };

  const updateVisit = async (visit: Visit) => {
    if (!editingVisit) return;

    try {
      const res = await fetch(
        `http://localhost:3000/cats/${catId}/visits/${visit.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            visit: {
              visit_type: editingVisit.visit_type,
              date: editingVisit.date,
              notes: editingVisit.notes,
              completed: editingVisit.completed,
            },
          }),
        }
      );

      const updatedVisit = await res.json();
      onVisitsUpdated(
        visits.map((v) =>
          v.id === updatedVisit.id ? updatedVisit : v
        )
      );
      setEditingVisit(null);
    } catch (error) {
      console.error("Error updating visit:", error);
    }
  };

  const toggleComplete = async (visit: Visit) => {
    try {
      const res = await fetch(
        `http://localhost:3000/cats/${catId}/visits/${visit.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            visit: {
              completed: !visit.completed,
            },
          }),
        }
      );

      const updatedVisit = await res.json();
      onVisitsUpdated(
        visits.map((v) =>
          v.id === updatedVisit.id ? updatedVisit : v
        )
      );
    } catch (error) {
      console.error("Error toggling visit:", error);
    }
  };

  const deleteVisit = async (visitId: number) => {
    if (!window.confirm("Delete this visit?")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/cats/${catId}/visits/${visitId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        onVisitsUpdated(
          visits.filter((v) => v.id !== visitId)
        );
      }
    } catch (error) {
      console.error("Error deleting visit:", error);
    }
  };

  // Sort: overdue incomplete → upcoming incomplete → completed
  const sortVisits = (a: Visit, b: Visit) => {
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);

    const aOverdue = !a.completed && aDate < today;
    const bOverdue = !b.completed && bDate < today;

    if (aOverdue !== bOverdue)
      return aOverdue ? -1 : 1;

    if (aOverdue && bOverdue) {
      return (
        aDate.getTime() - bDate.getTime()
      );
    }

    const aUpcoming =
      !a.completed && aDate >= today;
    const bUpcoming =
      !b.completed && bDate >= today;

    if (aUpcoming !== bUpcoming)
      return aUpcoming ? -1 : 1;

    if (aUpcoming && bUpcoming) {
      return (
        aDate.getTime() - bDate.getTime()
      );
    }

    if (a.completed && b.completed) {
      return (
        bDate.getTime() - aDate.getTime()
      );
    }

    return 0;
  };

  const displayedVisits = showAll
    ? [...visits].sort(sortVisits)
    : [...visits].sort(sortVisits).slice(0, 3);

  return (
    <div className="p-4 border rounded mt-4">
      <h2 className="text-xl font-semibold mb-2">
        Vet Visits
      </h2>

      <ul className="space-y-2 mb-4">
        {displayedVisits.map((v) => (
          <li key={v.id} className="border-b pb-2">
            {editingVisit?.id === v.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingVisit.visit_type}
                  onChange={(e) =>
                    setEditingVisit({
                      ...editingVisit,
                      visit_type: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full"
                />
                <input
                  type="date"
                  value={editingVisit.date}
                  onChange={(e) =>
                    setEditingVisit({
                      ...editingVisit,
                      date: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full"
                />
                <input
                  type="text"
                  value={editingVisit.notes || ""}
                  onChange={(e) =>
                    setEditingVisit({
                      ...editingVisit,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Notes"
                  className="border p-2 rounded w-full"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      editingVisit.completed || false
                    }
                    onChange={(e) =>
                      setEditingVisit({
                        ...editingVisit,
                        completed: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">
                    Completed
                  </span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateVisit(v)
                    }
                    className="bg-cyan-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() =>
                      setEditingVisit(null)
                    }
                    className="bg-gray-300 px-3 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={v.completed || false}
                    onChange={() =>
                      toggleComplete(v)
                    }
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div
                    className={
                      v.completed
                        ? "line-through text-gray-500"
                        : ""
                    }
                  >
                    <p className="font-medium">
                      {v.visit_type}
                    </p>
                    <p
                      className={`text-sm ${
                        !v.completed &&
                        new Date(v.date) <
                          today
                          ? "text-pink-600 font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      {!v.completed &&
                        new Date(v.date) <
                          today &&
                        "⚠️ "}
                      {new Date(
                        v.date
                      ).toLocaleDateString()}
                    </p>
                    {v.notes && (
                      <p className="text-sm italic text-gray-700">
                        {v.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setEditingVisit(v)
                    }
                    className="text-violet-500 text-sm font-bold hover:underline"
                  >
                    Edit
                  </button>
                  |
                  <button
                    onClick={() =>
                      deleteVisit(v.id)
                    }
                    className="text-pink-500 text-sm font-bold hover:underline"
                  >
                    X
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {visits.length > 3 && (
        <button
          onClick={() =>
            setShowAll(!showAll)
          }
          className="text-blue-500 text-sm hover:underline mb-4"
        >
          {showAll
            ? "Show less"
            : `Show all ${visits.length} visits`}
        </button>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Visit Type (e.g. Annual Checkup)"
          className="border p-2 rounded w-full sm:w-1/3"
          value={visitType}
          onChange={(e) =>
            setVisitType(e.target.value)
          }
        />
        <input
          type="date"
          className="border p-2 rounded w-full sm:w-1/4"
          value={date}
          onChange={(e) =>
            setDate(e.target.value)
          }
        />
        <input
          type="text"
          placeholder="Notes (optional)"
          className="border p-2 rounded w-full sm:w-1/3"
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
        />
        <button
          onClick={addVisit}
          className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600"
        >
          Add
        </button>
      </div>
    </div>
  );
}
