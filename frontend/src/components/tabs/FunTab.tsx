import { useState } from "react";
import type { Cat } from "../../types";
import PhotoGallery from "../PhotoGallery";
import type { Photo } from "../../types";

interface FunTabProps {
  cat: Cat;
  onPhotosUpdated: (photos: Photo[]) => void;
}

const CAT_FACTS = [
  "Cats spend 70% of their lives sleeping — that's about 13–16 hours a day!",
  "A cat's hearing is much more sensitive than a dog's or a human's.",
  "Cats have a special organ called the Jacobson's organ that lets them 'taste' smells.",
  "A group of cats is called a clowder.",
  "Cats can't taste sweetness — they lack the taste receptors for it.",
  "A cat's nose print is unique, just like a human fingerprint.",
  "Cats have 230 bones in their body — humans only have 206.",
  "When cats slow blink at you, it's a sign of love and trust.",
  "Cats can jump up to six times their own length.",
  "Ancient Egyptians shaved their eyebrows as a sign of mourning when their cat died.",
  "Cats have a third eyelid called the nictitating membrane.",
  "The average cat can run at about 30 mph in short bursts.",
  "Cats can rotate their ears 180 degrees.",
  "A cat's purr vibrates at 25–50 Hz, which may promote bone healing.",
  "Cats have whiskers on the back of their front legs too!",
  "House cats share 95.6% of their genetic makeup with tigers.",
  "Cats have an extra organ that allows them to sense water direction.",
  "Kittens can't see or hear when they're born — they rely entirely on their mother.",
  "A cat's brain is 90% similar to a human's brain.",
  "Cats are one of the only animals that don't need to drink much water if they eat wet food.",
];

export default function FunTab({ cat, onPhotosUpdated }: FunTabProps) {
  const [factIndex, setFactIndex] = useState(
    () => Math.floor(Math.random() * CAT_FACTS.length)
  );

  const getRandomFact = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * CAT_FACTS.length);
    } while (newIndex === factIndex);
    setFactIndex(newIndex);
  };

  // Birthday countdown
  const getBirthdayInfo = () => {
    if (!cat.birthday) return null;
    const birthDate = new Date(cat.birthday + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const daysUntil = Math.ceil(
      (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const ageInDays = Math.floor(
      (today.getTime() - new Date(cat.birthday + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24)
    );

    const turningAge = nextBirthday.getFullYear() - birthDate.getFullYear();

    return { daysUntil, ageInDays, turningAge };
  };

  const birthdayInfo = getBirthdayInfo();

  // Cat Stats
  const totalVisits = (cat.visits || []).length;
  const completedReminders = (cat.reminders || []).filter((r) => r.completed).length;
  const totalPhotos = (cat.photos || []).length;
  const upcomingReminders = (cat.reminders || []).filter(
    (r) => !r.completed
  ).length;

  // Photo highlights: prioritize profile photo, then most recent
  const profilePhoto = (cat.photos || []).find((p) => p.profile_photo);
  const highlightPhotos = profilePhoto
    ? [profilePhoto, ...(cat.photos || []).filter((p) => !p.profile_photo).slice(0, 3)]
    : (cat.photos || []).slice(0, 4);

  const getPhotoUrl = (photo: Photo) => photo.display_url || photo.image_url;

  return (
    <div className="space-y-6">
      {/* Birthday Countdown */}
      {birthdayInfo && (
        <div
          className={`rounded-xl p-5 relative overflow-hidden ${
            birthdayInfo.daysUntil === 0
              ? "bg-linear-to-br from-orange-900 to-pink-900 border border-orange-500"
              : "bg-linear-to-br from-gray-800 to-gray-900 border border-gray-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl mb-2">
                {birthdayInfo.daysUntil === 0 ? "🎉" : "🎂"}
              </div>
              <h3 className="font-bold text-xl text-white">
                {birthdayInfo.daysUntil === 0
                  ? `Happy Birthday, ${cat.name}! 🎉`
                  : `Birthday Countdown`}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Turning {birthdayInfo.turningAge} on{" "}
                {new Date(
                  new Date().getFullYear(),
                  new Date(cat.birthday! + "T00:00:00").getMonth(),
                  new Date(cat.birthday! + "T00:00:00").getDate()
                ).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </p>
            </div>
            {birthdayInfo.daysUntil > 0 && (
              <div className="text-right">
                <p className="text-5xl font-black text-orange-400">
                  {birthdayInfo.daysUntil}
                </p>
                <p className="text-gray-400 text-sm">
                  day{birthdayInfo.daysUntil !== 1 ? "s" : ""} away
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cat Stats */}
      <div className="bg-gray-800 rounded-xl p-5">
        <h3 className="font-bold text-lg mb-4 text-white">🐾 Cat Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {birthdayInfo && (
            <div className="bg-gray-900 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-cyan-400">
                {birthdayInfo.ageInDays.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Days Old</p>
            </div>
          )}
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-violet-400">{totalVisits}</p>
            <p className="text-xs text-gray-500 mt-1">Vet Visits</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-green-400">
              {completedReminders}
            </p>
            <p className="text-xs text-gray-500 mt-1">Tasks Done</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-orange-400">
              {upcomingReminders}
            </p>
            <p className="text-xs text-gray-500 mt-1">Active Reminders</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-pink-400">{totalPhotos}</p>
            <p className="text-xs text-gray-500 mt-1">Photos</p>
          </div>
        </div>
      </div>

      {/* Fun Fact Generator */}
      <div className="bg-linear-to-br from-violet-900/50 to-cyan-900/50 border border-violet-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-white">🧠 Cat Fact</h3>
          <button
            onClick={getRandomFact}
            className="text-xs bg-violet-700 hover:bg-violet-600 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            New Fact ✨
          </button>
        </div>
        <p className="text-gray-200 leading-relaxed text-sm">
          {CAT_FACTS[factIndex]}
        </p>
      </div>

      {/* Photo Highlights */}
      {highlightPhotos.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-5">
          <h3 className="font-bold text-lg mb-4 text-white">📸 Photo Highlights</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {highlightPhotos.map((photo, i) => (
              <div
                key={photo.id}
                className={`rounded-xl overflow-hidden relative ${
                  i === 0 ? "col-span-2 h-56" : "h-36"
                }`}
              >
                <img
                  src={getPhotoUrl(photo)}
                  alt={photo.caption || cat.name}
                  className="w-full h-full object-cover"
                />
                {photo.profile_photo && (
                  <div className="absolute top-2 left-2 bg-black/60 text-yellow-400 text-xs px-2 py-1 rounded-full">
                    ⭐ Profile
                  </div>
                )}
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Photo Gallery */}
      <div>
        <h3 className="font-bold text-lg mb-3 text-white">Manage Photos</h3>
        <PhotoGallery
          catId={cat.id}
          photos={cat.photos}
          onPhotosUpdated={onPhotosUpdated}
        />
      </div>
    </div>
  );
}