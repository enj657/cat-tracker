import type { Cat } from "../types";

interface CatCardProps {
  cat: Cat;
}

export default function CatCard({ cat }: CatCardProps) {
  return (
    <div
      className="p-4 border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition"
      onClick={() => (window.location.href = `/cats/${cat.id}`)}
    >
      <h2 className="text-xl font-semibold mb-2">{cat.name}</h2>
      <p className="text-gray-600">Age: {cat.age}</p>
      {cat.breed && <p className="text-gray-600">Breed: {cat.breed}</p>}
    </div>
  );
}
