import { useState } from "react";
import type { Visit } from "../types";

interface VisitListProps {
  catId: number;
  visits?: Visit[];
  onVisitsUpdated: (updated: Visit[]) => void;
}

export default function VisitList({ catId, visits = [], onVisitsUpdated }: VisitListProps) {
  const [visitType, setVisitType] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const addVisit = async () => {
    if (!visitType || !date) return alert("Please enter visit type and date");

    try {
      const res = await fetch(`http://localhost:3000/cats/${catId}/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',  // Add this!
        body: JSON.stringify({
          visit: {  // Wrap in 'visit' object to match Rails params
            visit_type: visitType,
            date,
            notes,
          }
        }),
      });

      const newVisit = await res.json();
      onVisitsUpdated([...visits, newVisit]);
      setVisitType("");
      setDate("");
      setNotes("");
    } catch (error) {
      console.error("Error adding visit:", error);
    }
  };

  return (
    <div className="p-4 border rounded mt-4">
      <h2 className="text-xl font-semibold mb-2">Vet Visits</h2>

      <ul className="space-y-2 mb-4">
        {visits.map((v) => (
          <li key={v.id} className="border-b pb-1">
            <p className="font-medium">{v.visit_type}</p>
            <p className="text-sm text-gray-600">
              {new Date(v.date).toLocaleDateString()}
            </p>
            {v.notes && <p className="text-sm italic text-gray-700">{v.notes}</p>}
          </li>
        ))}
      </ul>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Visit Type (e.g. Annual Checkup)"
          className="border p-2 rounded w-full sm:w-1/3"
          value={visitType}
          onChange={(e) => setVisitType(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded w-full sm:w-1/4"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Notes (optional)"
          className="border p-2 rounded w-full sm:w-1/3"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button
          onClick={addVisit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>
    </div>
  );
}