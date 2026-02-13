import { Link } from "react-router-dom";
import type { Cat } from "../types";

interface CatCardProps {
  cat: Cat;
  onDelete?: (catId: number) => void;
}

export default function CatCard({ cat, onDelete }: CatCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!window.confirm(`Are you sure you want to delete ${cat.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/cats/${cat.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        onDelete?.(cat.id);
      } else {
        alert("Failed to delete cat");
      }
    } catch (error) {
      console.error("Error deleting cat:", error);
      alert("Failed to delete cat");
    }
  };

  // Get profile photo or first photo
  const profilePhoto = cat.photos?.find((p) => p.profile_photo);
  const displayPhoto = profilePhoto || cat.photos?.[0];
  const photoUrl = displayPhoto
    ? displayPhoto.display_url || displayPhoto.image_url
    : null;

  // Get next upcoming visit
  const upcomingVisit = cat.visits
    ?.filter((v) => !v.completed && new Date(v.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // Get next upcoming reminder
  const upcomingReminder = cat.reminders
    ?.filter(r => !r.completed)
    .sort((a, b) => {
      // Reminders with dates first by soonest
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date && !b.due_date) return -1; // with date first
      if (!a.due_date && b.due_date) return 1;  // without date last
      return 0; // both no date, keep order
    })[0];

  return (
    <Link to={`/cats/${cat.id}`} className="block">
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition relative flex flex-col h-full">
        {/* Photo */}
        <div className="h-48 bg-linear-to-r from-cyan-400 to-cyan-800 flex items-center justify-center overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-6xl">🐱</span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h2 className="text-xl font-bold mb-2">{cat.name}</h2>

          {cat.birthday && (
            <p className="text-gray-400 text-sm mb-3">
              {(() => {
                const birthDate = new Date(cat.birthday);
                const today = new Date();

                const diffTime = today.getTime() - birthDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 1) return "Today";
                if (diffDays < 30)
                  return `${diffDays} day${diffDays !== 1 ? "s" : ""} old`;

                let years = today.getFullYear() - birthDate.getFullYear();
                let months = today.getMonth() - birthDate.getMonth();

                if (today.getDate() < birthDate.getDate()) {
                  months--;
                }

                if (months < 0) {
                  years--;
                  months += 12;
                }

                const yearText =
                  years > 0 ? `${years} year${years !== 1 ? "s" : ""}` : "";
                const monthText =
                  months > 0 ? `${months} month${months !== 1 ? "s" : ""}` : "";

                return (
                  [yearText, monthText].filter(Boolean).join(", ") + " old"
                );
              })()}
            </p>
          )}

          {/* {cat.breed && <p className="text-gray-400 text-sm mb-3">{cat.breed}</p>} */}

          {/* Upcoming/Overdue items */}
          <div className="mt-auto space-y-1 text-sm">
            {(() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              // Check for overdue visit
              const overdueVisit = cat.visits
                ?.filter((v) => !v.completed && new Date(v.date) < today)
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )[0];

              // Check for overdue reminder (only with due_date)
              const overdueReminder = cat.reminders
                ?.filter(
                  (r) => r.due_date && !r.completed && new Date(r.due_date) < today
                )
                .sort(
                  (a, b) =>
                    new Date(b.due_date).getTime() -
                    new Date(a.due_date).getTime(),
                )[0];

              const visitDisplay = overdueVisit ? (
                <p className="text-pink-600 font-semibold">
                  ⚠️ Missed Visit: {overdueVisit.visit_type} (
                  {new Date(overdueVisit.date).toLocaleDateString()})
                </p>
              ) : upcomingVisit ? (
                <p className="text-cyan-600 font-semibold">
                  📅 Next visit:{" "}
                  {new Date(upcomingVisit.date).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-gray-400 font-semibold">
                  No visits scheduled
                </p>
              );

              const reminderDisplay = (() => {
                if (overdueReminder) {
                  return (
                    <p className="text-pink-600 font-semibold">
                      ⚠️ Missed Reminder: {overdueReminder.title} (
                      {new Date(overdueReminder.due_date).toLocaleDateString()})
                    </p>
                  );
                } else if (upcomingReminder) {
                  return upcomingReminder.due_date ? (
                    <p className="text-cyan-600 font-semibold">
                      ⏰ {upcomingReminder.title} (
                      {new Date(upcomingReminder.due_date).toLocaleDateString()})
                    </p>
                  ) : (
                    <p className="text-cyan-600 font-semibold">
                      ⏰ {upcomingReminder.title}
                    </p>
                  );
                } else {
                  return <p className="text-gray-400 font-semibold">No reminders set</p>;
                }
              })();

              return (
                <>
                  {visitDisplay}
                  {reminderDisplay}
                </>
              );
            })()}
          </div>
        </div>

        {onDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 bg-violet-500 text-white px-3 py-1 rounded text-sm hover:bg-violet-600"
          >
            X
          </button>
        )}
      </div>
    </Link>
  );
}
