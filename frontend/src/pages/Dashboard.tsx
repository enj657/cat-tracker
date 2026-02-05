import { useEffect, useState } from "react";
import AddCatForm from "../components/AddCatForm";
import CatCard from "../components/CatCard";
import type { Cat } from "../types";

export default function Dashboard() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/cats")
      .then((res) => res.json())
      .then(setCats)
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Cats</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          + Add Cat
        </button>
      </div>

      {cats.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {cats.map((cat) => (
            <CatCard key={cat.id} cat={cat} />
          ))}
        </div>
      ) : (
        <p>No cats yet.</p>
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
