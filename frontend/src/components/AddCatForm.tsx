import { useState } from "react";
import type { Cat } from "../types";

interface AddCatFormProps {
  cat?: Cat;
  onCancel?: () => void;
  onCatSave?: (cat: Cat) => void;
}

export default function AddCatForm({ cat, onCancel, onCatSave }: AddCatFormProps) {
  const [formData, setFormData] = useState({
    name: cat?.name || "",
    age: cat?.age || "",
    breed: cat?.breed || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = cat ? "PATCH" : "POST";
    const url = cat
      ? `http://localhost:3000/cats/${cat.id}`
      : "http://localhost:3000/cats";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: 'include',  // Add this!
        body: JSON.stringify({ cat: formData }),
      });
      const data = await res.json();

      onCatSave?.(data);
    } catch (error) {
      console.error("Error saving cat:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4">
      <input name="name" placeholder="Name" onChange={handleChange} value={formData.name} required className="w-full p-2 border rounded"/>
      <input name="age" type="number" placeholder="Age" onChange={handleChange} value={formData.age} required className="w-full p-2 border rounded"/>
      <input name="breed" placeholder="Breed" onChange={handleChange} value={formData.breed} className="w-full p-2 border rounded"/>
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Save</button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="bg-gray-300 text-black px-4 py-2 rounded-md">Cancel</button>
        )}
      </div>
    </form>
  );
}