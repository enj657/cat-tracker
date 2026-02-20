import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Cat } from "../types";
import VisitList from "../components/VisitList";
import ReminderList from "../components/ReminderList";
import PhotoGallery from "../components/PhotoGallery";
import AddCatForm from "../components/AddCatForm";

export default function CatDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cat, setCat] = useState<Cat | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/cats/${id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setCat)
      .catch(console.error);
  }, [id]);

  if (!cat) return <p>Loading...</p>;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/")}
        className="bg-pink-500 hover:bg-pink-600 text-white rounded px-4 py-2 mb-4 w-full sm:w-auto"
      >
        ← Back to Dashboard
      </button>

      {isEditing ? (
        <div className="bg-gray-600 p-4 sm:p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Edit {cat.name}</h2>
          <AddCatForm
            cat={cat}
            onCancel={() => setIsEditing(false)}
            onCatSave={(updatedCat) => {
              setCat(updatedCat);
              setIsEditing(false);
            }}
          />
        </div>
      ) : (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {cat.name}
              </h1>
              {cat.birthday && (
                <>
                  <p>
                    Age:{" "}
                    {(() => {
                      const birthDate = new Date(cat.birthday);
                      const today = new Date();
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      if (
                        monthDiff < 0 ||
                        (monthDiff === 0 &&
                          today.getDate() < birthDate.getDate())
                      ) {
                        age--;
                      }
                      return `${age} year${age !== 1 ? "s" : ""} old`;
                    })()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Born: {new Date(cat.birthday).toLocaleDateString()}
                  </p>
                </>
              )}
              {cat.breed && <p>Breed: {cat.breed}</p>}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-violet-500 text-white px-4 py-2 rounded hover:bg-violet-600 w-full sm:w-auto"
            >
              Edit
            </button>
          </div>
        </div>
      )}

      <PhotoGallery
        catId={cat.id}
        photos={cat.photos}
        onPhotosUpdated={(updated) => setCat({ ...cat, photos: updated })}
      />
      <VisitList
        catId={cat.id}
        visits={cat.visits || []}
        onVisitsUpdated={(updated) => setCat({ ...cat, visits: updated })}
      />
      <ReminderList
        catId={cat.id}
        reminders={cat.reminders || []}
        onRemindersUpdated={(updated) => setCat({ ...cat, reminders: updated })}
      />
    </div>
  );
}
