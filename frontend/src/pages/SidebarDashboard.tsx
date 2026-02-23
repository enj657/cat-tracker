import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { Cat } from "../types";
import CatDetails from "./CatDetails";
import AddCatForm from "../components/AddCatForm";

export default function SidebarDashboard() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAllMissed, setShowAllMissed] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const { logout, user } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/cats", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setCats)
      .catch(console.error);
  }, []);

  const sortedCats = [...cats].sort((a, b) => {
    if (a.birthday && b.birthday) {
      return new Date(a.birthday).getTime() - new Date(b.birthday).getTime();
    }
    if (a.birthday && !b.birthday) return -1;
    if (!a.birthday && b.birthday) return 1;
    return 0;
  });

  const selectedCat = cats.find((cat) => cat.id === parseInt(id || "0"));

  const handleCatSelect = (catId: number) => {
    if (selectedCat?.id === catId) {
      navigate("/");
    } else {
      navigate(`/cats/${catId}`);
    }
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const getProfilePhotoUrl = (cat: Cat) => {
    const profilePhoto = cat.photos?.find((p) => p.profile_photo);
    return profilePhoto
      ? profilePhoto.display_url || profilePhoto.image_url
      : null;
  };

  const getAllEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events: Array<{
      type: "visit" | "reminder";
      cat: Cat;
      date: Date;
      title: string;
      overdue: boolean;
    }> = [];

    cats.forEach((cat) => {
      cat.visits?.forEach((v) => {
        if (!v.completed) {
          events.push({
            type: "visit",
            cat,
            date: new Date(v.date),
            title: v.visit_type,
            overdue: new Date(v.date) < today,
          });
        }
      });

      cat.reminders?.forEach((r) => {
        if (!r.completed && r.due_date) {
          events.push({
            type: "reminder",
            cat,
            date: new Date(r.due_date),
            title: r.title,
            overdue: new Date(r.due_date) < today,
          });
        }
      });
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    const birthdays = cats
      .filter((cat) => cat.birthday)
      .map((cat) => {
        const birthDate = new Date(cat.birthday!);
        const nextBirthday = new Date(
          today.getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate(),
        );

        // If birthday already passed this year, get next year's
        if (nextBirthday < today) {
          nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        const daysUntil = Math.ceil(
          (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        const turningAge = nextBirthday.getFullYear() - birthDate.getFullYear();

        return { cat, nextBirthday, daysUntil, turningAge };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 3);

    return birthdays;
  };

  const refreshCats = () => {
    fetch("http://localhost:3000/cats", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setCats)
      .catch(console.error);
  };

  // Update the useEffect to use it
  useEffect(() => {
    refreshCats();
  }, []);

  // Also refresh when coming back to dashboard (no cat selected)
  useEffect(() => {
    refreshCats();
  }, [id]);

  const missedEvents = getAllEvents().filter((e) => e.overdue);
  const upcomingEvents = getAllEvents().filter((e) => !e.overdue);

  return (
    <div className="flex md:flex-row md:h-screen relative">
      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-transparent/50 bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
    fixed md:relative z-50 md:z-0
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    ${sidebarOpen ? "w-64" : "md:w-20 w-64"}
    bg-gray-800 text-white flex flex-col h-screen
    transition-all duration-300
  `}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center shrink-0">
          {sidebarOpen ? (
            <>
              <div>
                <h1 className="text-xl font-bold">{user?.name}'s Household</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ←
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="mx-auto text-gray-400 hover:text-white text-2xl"
            >
              →
            </button>
          )}
        </div>

        {/* Cat List */}
        <div className="flex-1 overflow-y-auto border-t border-gray-700">
          {cats.length === 0
            ? sidebarOpen && (
                <p className="p-4 text-gray-400 text-sm">
                  No cats yet. Add one below!
                </p>
              )
            : sortedCats.map((cat) => {
                const photoUrl = getProfilePhotoUrl(cat);
                const isSelected = selectedCat?.id === cat.id;

                if (!sidebarOpen) {
                  // Collapsed view - just show profile photos
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCatSelect(cat.id)}
                      className={`w-full p-2 flex justify-center hover:bg-gray-700 transition ${
                        isSelected
                          ? "bg-gray-700 border-l-4 border-violet-500"
                          : ""
                      }`}
                      title={cat.name}
                    >
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={cat.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-linear-to-r from-cyan-500 to-violet-500 flex items-center justify-center text-xl">
                          🐱
                        </div>
                      )}
                    </button>
                  );
                }

                // Expanded view - full info
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCatSelect(cat.id)}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-gray-700 transition ${
                      isSelected
                        ? "bg-gray-700 border-l-4 border-violet-500"
                        : ""
                    }`}
                  >
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={cat.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-linear-to-r from-cyan-500 to-violet-500 flex items-center justify-center text-2xl">
                        🐱
                      </div>
                    )}
                    <div className="text-left flex-1">
                      <p className="font-semibold">{cat.name}</p>
                      {cat.birthday && (
                        <p className="text-xs text-gray-400">
                          {(() => {
                            const birthDate = new Date(cat.birthday);
                            const today = new Date();
                            let age =
                              today.getFullYear() - birthDate.getFullYear();
                            const monthDiff =
                              today.getMonth() - birthDate.getMonth();
                            if (
                              monthDiff < 0 ||
                              (monthDiff === 0 &&
                                today.getDate() < birthDate.getDate())
                            ) {
                              age--;
                            }
                            return `${age} yr${age !== 1 ? "s" : ""}`;
                          })()}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
        </div>

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-700 space-y-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded"
            >
              + Add Cat
            </button>
            <button
              onClick={logout}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-700 min-h-screen">
        {/* Hamburger for when sidebar is closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-2 z-30 bg-gray-800 text-white p-2 rounded-lg shadow-lg hover:bg-gray-700 sm:hidden"
          >
            →
          </button>
        )}

        {selectedCat ? (
          <div key={selectedCat.id}>
            <CatDetails onUpdate={refreshCats} />
          </div>
        ) : (
          <div className="p-6">
            <h2 className="text-3xl font-bold mb-6">
              Welcome, {user?.name}! 👋
            </h2>

            {cats.length === 0 ? (
              <div className="bg-gray-800 rounded-lg shadow p-8 text-center">
                <p className="text-xl text-gray-400 mb-4">
                  You don't have any cats yet!
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg"
                >
                  Add Your First Cat
                </button>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-900 rounded-lg shadow p-4">
                    <p className="text-gray-400 text-sm">Total Cats</p>
                    <p className="text-3xl font-bold text-violet-500">
                      {cats.length}
                    </p>
                  </div>
                  <div className="bg-gray-900 rounded-lg shadow p-4">
                    <p className="text-gray-400 text-sm">Upcoming Visits</p>
                    <p className="text-3xl font-bold text-cyan-500">
                      {cats.reduce(
                        (acc, cat) =>
                          acc +
                          (cat.visits?.filter(
                            (v) =>
                              !v.completed && new Date(v.date) >= new Date(),
                          ).length || 0),
                        0,
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-900 rounded-lg shadow p-4">
                    <p className="text-gray-400 text-sm">Active Reminders</p>
                    <p className="text-3xl font-bold text-orange-500">
                      {cats.reduce(
                        (acc, cat) =>
                          acc +
                          (cat.reminders?.filter((r) => !r.completed).length ||
                            0),
                        0,
                      )}
                    </p>
                  </div>
                </div>
                {/* Upcoming Birthdays */}
                {getUpcomingBirthdays().length > 0 && (
                  <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-orange-500">
                      🎂 Upcoming Birthdays
                    </h3>
                    <div className="space-y-3">
                      {getUpcomingBirthdays().map((birthday) => (
                        <div
                          key={birthday.cat.id}
                          onClick={() => handleCatSelect(birthday.cat.id)}
                          className="bg-gray-900 flex items-center justify-between p-3 rounded cursor-pointer hover:bg-gray-700 border-l-4 border-orange-500"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🎂</span>
                            <div>
                              <p className="font-semibold text-white">
                                {birthday.cat.name}
                              </p>
                              <p className="text-sm text-gray-400">
                                Turning {birthday.turningAge}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-orange-400">
                            {birthday.daysUntil === 0
                              ? "Today! 🎉"
                              : `in ${birthday.daysUntil} day${birthday.daysUntil !== 1 ? "s" : ""}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Missed Events */}
                {missedEvents.length > 0 && (
                  <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 text-pink-500">
                      ⚠️ Missed Events
                    </h3>
                    <div className="space-y-3">
                      {(showAllMissed
                        ? missedEvents
                        : missedEvents.slice(0, 3)
                      ).map((event, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleCatSelect(event.cat.id)}
                          className="flex items-center justify-between p-3 rounded cursor-pointer hover:bg-gray-700 bg-gray-900 border-l-4 border-pink-500"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {event.type === "visit" ? "📅" : "⏰"}
                            </span>
                            <div>
                              <p className="font-semibold text-white">
                                {event.cat.name}
                              </p>
                              <p className="text-sm text-gray-400">
                                {event.title}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-pink-500 font-bold">
                            ⚠️ {event.date.toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    {missedEvents.length > 3 && (
                      <button
                        onClick={() => setShowAllMissed(!showAllMissed)}
                        className="text-violet-400 text-sm hover:underline mt-3"
                      >
                        {showAllMissed
                          ? "Show less"
                          : `Show all ${missedEvents.length} missed events`}
                      </button>
                    )}
                  </div>
                )}

                {/* Upcoming Events */}
                <div className="bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-4 text-cyan-500">
                    📅 Upcoming Events
                  </h3>
                  {upcomingEvents.length === 0 ? (
                    <p className="text-gray-400">No upcoming events</p>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {(showAllUpcoming
                          ? upcomingEvents
                          : upcomingEvents.slice(0, 3)
                        ).map((event, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleCatSelect(event.cat.id)}
                            className="bg-gray-900 flex items-center justify-between p-3 rounded cursor-pointer hover:bg-gray-700 border-l-4 border-cyan-500"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {event.type === "visit" ? "📅" : "⏰"}
                              </span>
                              <div>
                                <p className="font-semibold text-white">
                                  {event.cat.name}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {event.title}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-400">
                              {event.date.toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                      {upcomingEvents.length > 3 && (
                        <button
                          onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                          className="text-violet-400 text-sm hover:underline mt-3"
                        >
                          {showAllUpcoming
                            ? "Show less"
                            : `Show all ${upcomingEvents.length} upcoming events`}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Cat Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-white">Add New Cat</h2>
            <AddCatForm
              onCancel={() => setShowAddModal(false)}
              onCatSave={(newCat: Cat) => {
                setCats([...cats, newCat]);
                setShowAddModal(false);
                navigate(`/cats/${newCat.id}`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
