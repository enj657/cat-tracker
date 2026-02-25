import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Cat } from "../types";
import AddCatForm from "../components/AddCatForm";
import DailyLifeTab from "../components/tabs/DailyLifeTab";
import FunTab from "../components/tabs/FunTab";
import MedicalTab from "../components/tabs/MedicalTab";

type TabId = "daily" | "fun" | "medical";

const TABS: { id: TabId; label: string; icon: string; desc: string }[] = [
  { id: "daily", label: "Daily Life", icon: "🏠", desc: "Routines & reminders" },
  { id: "fun", label: "Fun", icon: "✨", desc: "Stats & highlights" },
  { id: "medical", label: "Medical", icon: "🏥", desc: "Health & visits" },
];

interface CatDetailsProps {
  onUpdate?: () => void;
}

export default function CatDetails({ onUpdate }: CatDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const [cat, setCat] = useState<Cat | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("daily");

  useEffect(() => {
    fetch(`http://localhost:3000/cats/${id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setCat)
      .catch(console.error);
  }, [id]);

  // Tab + edit state reset is handled by the key={id} on this component
  // in SidebarDashboard — React fully remounts when the cat changes.

  if (!cat) {
    return (
      <div className="p-6 flex items-center gap-3 text-gray-400">
        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        Loading...
      </div>
    );
  }

  // Profile photo
  const profilePhoto = cat.photos?.find((p) => p.profile_photo);
  const photoUrl = profilePhoto
    ? profilePhoto.display_url || profilePhoto.image_url
    : null;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Cat Header Card */}
      {isEditing ? (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-bold mb-4 text-white">Edit {cat.name}</h2>
          <AddCatForm
            cat={cat}
            onCancel={() => setIsEditing(false)}
            onCatSave={(updatedCat) => {
              setCat(updatedCat);
              setIsEditing(false);
              onUpdate?.();
            }}
          />
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl shadow mb-6 overflow-hidden">
          {/* Header with photo strip */}
          <div className="flex items-center gap-4 p-5">
            {/* Profile photo / avatar */}
            <div className="shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={cat.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-violet-500"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-4xl ring-2 ring-violet-500">
                  🐱
                </div>
              )}
            </div>

            {/* Cat info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-white truncate">
                {cat.name}
              </h1>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {cat.birthday && (
                  <>
                    <span className="text-gray-400 text-sm">
                      {(() => {
                        const birth = new Date(cat.birthday);
                        const today = new Date();
                        let age = today.getFullYear() - birth.getFullYear();
                        const m = today.getMonth() - birth.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                        return `${age} year${age !== 1 ? "s" : ""} old`;
                      })()}
                    </span>
                    <span className="text-gray-600 text-sm hidden sm:inline">·</span>
                    <span className="text-gray-400 text-sm">
                      Born {new Date(cat.birthday + "T00:00:00").toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </>
                )}
                {cat.breed && (
                  <>
                    <span className="text-gray-600 text-sm hidden sm:inline">·</span>
                    <span className="text-gray-400 text-sm">{cat.breed}</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="shrink-0 bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 relative py-3 px-2 rounded-xl text-center transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-gray-800 ring-2 ring-violet-500 shadow-lg"
                : "bg-gray-800/50 hover:bg-gray-800/80"
            }`}
          >
            {activeTab === tab.id && (
              <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-linear-to-r from-violet-500 to-cyan-500" />
            )}
            <div className="text-xl mb-0.5">{tab.icon}</div>
            <div
              className={`text-sm font-bold ${
                activeTab === tab.id ? "text-white" : "text-gray-400"
              }`}
            >
              {tab.label}
            </div>
            <div className="text-xs text-gray-500 hidden sm:block">{tab.desc}</div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "daily" && (
          <DailyLifeTab
            cat={cat}
            onRemindersUpdated={(updated) =>
              setCat({ ...cat, reminders: updated })
            }
          />
        )}
        {activeTab === "fun" && (
          <FunTab
            cat={cat}
            onPhotosUpdated={(updated) => {
              setCat({ ...cat, photos: updated });
              onUpdate?.();
            }}
          />
        )}
        {activeTab === "medical" && (
          <MedicalTab
            cat={cat}
            onVisitsUpdated={(updated) => setCat({ ...cat, visits: updated })}
            onWeightsUpdated={(updated) => setCat({ ...cat, weights: updated })}
          />
        )}
      </div>
    </div>
  );
}