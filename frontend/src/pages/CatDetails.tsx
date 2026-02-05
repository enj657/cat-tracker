import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Cat } from "../types";
import VisitList from "../components/VisitList";
import ReminderList from "../components/ReminderList";
import PhotoGallery from "../components/PhotoGallery";

export default function CatDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cat, setCat] = useState<Cat | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/cats/${id}`)
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

      <h1 className="text-3xl font-bold mb-2">{cat.name}</h1>
      <p>Age: {cat.age}</p>
      {cat.breed && <p>Breed: {cat.breed}</p>}

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
