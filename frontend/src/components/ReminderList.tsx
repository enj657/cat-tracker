import { useState } from "react";
import type { Reminder } from "../types";

interface RemindersSectionProps {
  catId: number;
  reminders?: Reminder[];
  onRemindersUpdated: (updated: Reminder[]) => void;
}

export default function RemindersSection({
  catId,
  reminders = [],
  onRemindersUpdated,
}: RemindersSectionProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showAll, setShowAll] = useState(false);

  const addReminder = async () => {
    if (!title || !dueDate) return alert("Please fill all fields.");

    try {
      const res = await fetch(`http://localhost:3000/cats/${catId}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reminder: {
            title,
            due_date: dueDate,
            completed: false,
          },
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

  const updateReminder = async (reminder: Reminder) => {
    if (!editingReminder) return;

    try {
      const res = await fetch(
        `http://localhost:3000/cats/${catId}/reminders/${reminder.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            reminder: {
              title: editingReminder.title,
              due_date: editingReminder.due_date,
              completed: editingReminder.completed,
            },
          }),
        },
      );

      const updatedReminder = await res.json();
      onRemindersUpdated(
        reminders.map((r) =>
          r.id === updatedReminder.id ? updatedReminder : r,
        ),
      );
      setEditingReminder(null);
    } catch (error) {
      console.error("Error updating reminder:", error);
    }
  };

  const toggleComplete = async (reminder: Reminder) => {
    try {
      const res = await fetch(
        `http://localhost:3000/cats/${catId}/reminders/${reminder.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            reminder: {
              completed: !reminder.completed,
            },
          }),
        },
      );

      const updatedReminder = await res.json();
      onRemindersUpdated(
        reminders.map((r) =>
          r.id === updatedReminder.id ? updatedReminder : r,
        ),
      );
    } catch (error) {
      console.error("Error toggling reminder:", error);
    }
  };

  const deleteReminder = async (reminderId: number) => {
    if (!window.confirm("Delete this reminder?")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/cats/${catId}/reminders/${reminderId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (res.ok) {
        onRemindersUpdated(reminders.filter((r) => r.id !== reminderId));
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const displayedReminders = showAll 
  ? [...reminders].sort((a, b) => {
      // Incomplete reminders first
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      // Then sort by due date (soonest first)
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
  : [...reminders].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }).slice(0, 3);

  return (
    <div className="p-4 border rounded mt-4">
      <h2 className="text-xl font-semibold mb-2">Reminders</h2>

      <ul className="space-y-2 mb-4">
        {displayedReminders.map((r) => (
          <li key={r.id} className="border-b pb-2">
            {editingReminder?.id === r.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingReminder.title}
                  onChange={(e) =>
                    setEditingReminder({
                      ...editingReminder,
                      title: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full"
                />
                <input
                  type="date"
                  value={editingReminder.due_date}
                  onChange={(e) =>
                    setEditingReminder({
                      ...editingReminder,
                      due_date: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingReminder.completed}
                    onChange={(e) =>
                      setEditingReminder({
                        ...editingReminder,
                        completed: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">Completed</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateReminder(r)}
                    className="bg-cyan-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingReminder(null)}
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
                    checked={r.completed}
                    onChange={() => toggleComplete(r)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div
                    className={r.completed ? "line-through text-gray-500" : ""}
                  >
                    <p className="font-medium">{r.title}</p>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(r.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingReminder(r)}
                    className="text-violet-500 text-sm hover:underline"
                  >
                    Edit
                  </button>
                  |
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="text-pink-500 text-sm hover:underline"
                  >
                    X
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {reminders.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-violet-500 text-sm hover:underline mb-4"
        >
          {showAll ? "Show less" : `Show all ${reminders.length} reminders`}
        </button>
      )}

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
        <button
          onClick={addReminder}
          className="bg-cyan-500 text-white px-3 rounded hover:bg-cyan-600"
        >
          Add
        </button>
      </div>
    </div>
  );
}
