import { useState } from "react";
import type { Reminder } from "../types";

interface RemindersSectionProps {
  catId: number;
  reminders?: Reminder[];
  onRemindersUpdated: (updated: Reminder[]) => void;
}

export default function RemindersSection({ catId, reminders = [], onRemindersUpdated }: RemindersSectionProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const addReminder = async () => {
    if (!title || !dueDate) return alert("Please fill all fields.");

    try {
      const res = await fetch(`http://localhost:3000/cats/${catId}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',  // Add this!
        body: JSON.stringify({ 
          reminder: {  // Wrap in 'reminder' object to match Rails params
            title, 
            due_date: dueDate,
            completed: false
          }
        }),
      });
      const newReminder = await res.json();
      onRemindersUpdated([...reminders, newReminder]);
      setTitle("");
      setDueDate("");
    } catch (error) {
      console.error("Error adding reminder:", error);
    }
  };

  return (
    <div className="p-4 border rounded mt-4">
      <h2 className="text-xl font-semibold mb-2">Reminders</h2>

      <ul className="space-y-2 mb-4">
        {reminders.map((r) => (
          <li key={r.id} className="flex justify-between items-center border-b pb-1">
            <div>
              <p className="font-medium">{r.title}</p>
              <p className="text-sm text-gray-600">Due: {new Date(r.due_date).toLocaleDateString()}</p>
            </div>
            <span className={`text-sm ${r.completed ? "text-green-500" : "text-red-500"}`}>
              {r.completed ? "Done" : "Pending"}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          className="border p-2 rounded w-1/2"
          placeholder="Reminder title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border p-2 rounded w-1/3"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button onClick={addReminder} className="bg-blue-500 text-white px-3 rounded hover:bg-blue-600">
          Add
        </button>
      </div>
    </div>
  );
}