import { Link } from "react-router-dom";
import type { Cat } from "../types";

interface CatCardProps {
  cat: Cat;
  onDelete?: (catId: number) => void;
}

export default function CatCard({ cat, onDelete }: CatCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to detail page
    
    if (!window.confirm(`Are you sure you want to delete ${cat.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/cats/${cat.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        onDelete?.(cat.id);
      } else {
        alert('Failed to delete cat');
      }
    } catch (error) {
      console.error('Error deleting cat:', error);
      alert('Failed to delete cat');
    }
  };

  return (
    <Link to={`/cats/${cat.id}`} className="block">
      <div className="border rounded-lg p-4 hover:shadow-lg transition relative">
        <h2 className="text-xl font-bold">{cat.name}</h2>
        <p className="text-gray-600">Age: {cat.age}</p>
        {cat.breed && <p className="text-gray-600">Breed: {cat.breed}</p>}
        
        {onDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Delete
          </button>
        )}
      </div>
    </Link>
  );
}