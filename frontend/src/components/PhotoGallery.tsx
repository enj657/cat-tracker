import { useState } from "react";
import type { Photo } from "../types";

interface PhotoGalleryProps {
  catId: number;
  photos?: Photo[];
  onPhotosUpdated: (updated: Photo[]) => void;
}

export default function PhotoGallery({
  catId,
  photos = [],
  onPhotosUpdated,
}: PhotoGalleryProps) {
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (uploadMode === "file" && !selectedFile) {
      return alert("Please choose a file.");
    }
    if (uploadMode === "url" && !imageUrl) {
      return alert("Please enter an image URL.");
    }

    setUploading(true);

    try {
      let res;

      if (uploadMode === "file") {
        const formData = new FormData();
        formData.append("photo[image]", selectedFile!);
        formData.append("photo[caption]", caption);

        res = await fetch(`http://localhost:3000/cats/${catId}/photos`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
      } else {
        res = await fetch(`http://localhost:3000/cats/${catId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            photo: {
              image_url: imageUrl,
              caption: caption,
            },
          }),
        });
      }

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const newPhoto = await res.json();
      onPhotosUpdated([...photos, newPhoto]);

      // Reset form
      setSelectedFile(null);
      setImageUrl("");
      setCaption("");
    } catch (error) {
      console.error("Error adding photo:", error);
      alert("Failed to add photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getPhotoUrl = (photo: Photo) => {
    return photo.display_url || photo.image_url;
  };
  return (
    <div className="p-4 border rounded mt-4">
      <h2 className="text-xl font-semibold mb-2">Photo Gallery</h2>

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="border rounded overflow-hidden cursor-pointer hover:opacity-80 transition"
              onClick={() => setLightboxImage(getPhotoUrl(photo))}
            >
              <img
                src={getPhotoUrl(photo)}
                alt={photo.caption || "Cat photo"}
                className="w-full h-32 object-cover"
              />
              {photo.caption && (
                <p className="text-sm p-1 text-center bg-gray-100">
                  {photo.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-4">No photos yet. Add one below!</p>
      )}

      {/* Upload Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setUploadMode("file")}
          className={`px-3 py-1 rounded ${
            uploadMode === "file"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setUploadMode("url")}
          className={`px-3 py-1 rounded ${
            uploadMode === "url"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Use URL
        </button>
      </div>

      {/* Add Photo Form */}
      <div className="flex flex-col sm:flex-row gap-2 items-end">
        {uploadMode === "file" ? (
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Choose Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="border p-2 rounded w-full"
            />
          </div>
        ) : (
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              className="border p-2 rounded w-full"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        )}

        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">
            Caption (optional)
          </label>
          <input
            type="text"
            placeholder="Caption"
            className="border p-2 rounded w-full"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? "Adding..." : "Add Photo"}
        </button>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300"
            >
              x
            </button>
            <img
              src={lightboxImage}
              alt="Full size"
              className="max-w-full max-h-screen object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
