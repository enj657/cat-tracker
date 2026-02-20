import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import AddCatForm from "../components/AddCatForm";
import CatCard from "../components/CatCard";
import type { Cat } from "../types";

type FilterType = "all" | "overdue" | "upcoming-visits" | "upcoming-reminders";

export default function Dashboard() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const { logout, user } = useAuth();

  useEffect(() => {
    fetch("http://localhost:3000/cats", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setCats)
      .catch(console.error);
  }, []);

  const handleDelete = (catId: number) => {
    setCats((prev) => prev.filter((cat) => cat.id !== catId));
  };

  // Filter + Sort logic
  const filteredCats = cats
    .filter((cat) => {
      if (filter === "all") return true;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filter === "overdue") {
        const hasOverdueVisit = cat.visits?.some(
          (v) => !v.completed && new Date(v.date) < today,
        );
        const hasOverdueReminder = cat.reminders?.some(
          (r) => !r.completed && new Date(r.due_date) < today,
        );
        return hasOverdueVisit || hasOverdueReminder;
      }

      if (filter === "upcoming-visits") {
        return cat.visits?.some(
          (v) => !v.completed && new Date(v.date) >= today,
        );
      }

      if (filter === "upcoming-reminders") {
        return cat.reminders?.some(
          (r) => !r.completed && new Date(r.due_date) >= today,
        );
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by birthday (oldest first)
      if (a.birthday && b.birthday) {
        return new Date(a.birthday).getTime() - new Date(b.birthday).getTime();
      }

      // Cats without birthday go to end
      if (a.birthday && !b.birthday) return -1;
      if (!a.birthday && b.birthday) return 1;

      return 0;
    });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Your Cats</h1>
          <p className="text-sm text-gray-600">Logged in as {user?.name}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="border rounded px-3 py-2 bg-gray-800 text-white"
          >
            <option value="all">All cats ({cats.length})</option>
            <option value="overdue">⚠️ Has overdue items</option>
            <option value="upcoming-visits">📅 Has upcoming visits</option>
            <option value="upcoming-reminders">
              ⏰ Has reminders due soon
            </option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600"
          >
            + Add Cat
          </button>

          <button
            onClick={logout}
            className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600"
          >
            Logout
          </button>
        </div>
      </div>

      {filteredCats.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCats.map((cat) => (
            <CatCard key={cat.id} cat={cat} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <p>
          {filter === "all" ? "No cats yet." : "No cats match this filter."}
        </p>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-gray-600 p-6 rounded-lg shadow-lg max-w-md w-full">
            <AddCatForm
              onCancel={() => setShowModal(false)}
              onCatSave={(newCat: Cat) => {
                setCats((prev) => [...prev, newCat]);
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
