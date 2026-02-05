import { useState } from "react";
import type { Photo } from "../types";

interface PhotoGalleryProps {
  catId: number;
  photos?: Photo[];
  onPhotosUpdated: (updated: Photo[]) => void;
}

export default function PhotoGallery({ catId, photos = [], onPhotosUpdated }: PhotoGalleryProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please choose a file.");
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("caption", caption);

    try {
      const res = await fetch(`http://localhost:3000/cats/${catId}/photos`, {
        method: "POST",
        body: formData,
      });
      const newPhoto = await res.json();
      onPhotosUpdated([...photos, newPhoto]);
      setSelectedFile(null);
      setCaption("");
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

  return (
    <div className="p-4 border rounded mt-4">
      <h2 className="text-xl font-semibold mb-2">Photo Gallery</h2>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {photos.map((photo) => (
          <div key={photo.id} className="border rounded overflow-hidden">
            <img src={photo.image_url} alt={photo.caption} className="w-full h-32 object-cover" />
            {photo.caption && <p className="text-sm p-1 text-center">{photo.caption}</p>}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="border p-2 rounded w-full sm:w-auto"
        />
        <input
          type="text"
          placeholder="Caption (optional)"
          className="border p-2 rounded w-full sm:w-auto"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <button
          onClick={handleUpload}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Upload
        </button>
      </div>
    </div>
  );
}
