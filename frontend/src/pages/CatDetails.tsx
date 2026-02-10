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
      credentials: 'include',
    })
      .then((res) => res.json())
      .then(setCat)
      .catch(console.error);
  }, [id]);

  if (!cat) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/")}
        className="text-blue-600 underline mb-4"
      >
        ← Back to Dashboard
      </button>

      {isEditing ? (
        <div className="bg-gray-600 p-6 rounded-lg shadow mb-6">
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{cat.name}</h1>
              <p>Age: {cat.age}</p>
              {cat.breed && <p>Breed: {cat.breed}</p>}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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