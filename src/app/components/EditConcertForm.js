"use client";

import { useState } from "react";

export default function EditConcertForm({
  concert,
  user,
  onSave,
  onCancel,
  saving,
  error,
}) {
  const [editFormData, setEditFormData] = useState({
    date: concert.date.slice(0, 16),
    venue: concert.venue,
    city: concert.city,
    rating: concert.rating || "",
    notes: concert.notes || "",
    userProfileId: user.id,
    artists:
      concert.concertArtists?.map((ca) => ({
        name: ca.artist.name,
        role: ca.role,
        genres: [],
      })) || [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArtistChange = (index, field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      artists: prev.artists.map((artist, i) =>
        i === index ? { ...artist, [field]: value } : artist
      ),
    }));
  };

  const addArtist = () => {
    setEditFormData((prev) => ({
      ...prev,
      artists: [...prev.artists, { name: "", role: "", genres: [] }],
    }));
  };

  const removeArtist = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      artists: prev.artists.filter((_, i) => i !== index),
    }));
  };

  const addArtistGenre = (index, rawValue) => {
    const value = (rawValue || "").trim().toLowerCase();
    if (!value) return;

    // Optional validation - only allow letters, spaces, numbers, and common genre characters
    if (!/^[a-z0-9][a-z0-9 &/+'-]*$/i.test(value)) {
      return;
    }

    setEditFormData((prev) => ({
      ...prev,
      artists: prev.artists.map((artist, i) =>
        i === index
          ? {
              ...artist,
              genres: artist.genres?.includes(value)
                ? artist.genres
                : [...(artist.genres || []), value],
            }
          : artist
      ),
    }));
  };

  const removeArtistGenre = (index, genreIndex) => {
    setEditFormData((prev) => ({
      ...prev,
      artists: prev.artists.map((artist, i) =>
        i === index
          ? {
              ...artist,
              genres: artist.genres.filter((_, gi) => gi !== genreIndex),
            }
          : artist
      ),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editFormData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
        <h2 className="text-2xl font-bold">Edit Concert</h2>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              name="date"
              value={editFormData.date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue *
            </label>
            <input
              type="text"
              name="venue"
              value={editFormData.venue}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={editFormData.city}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <select
              name="rating"
              value={editFormData.rating}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Select rating</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Great</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={editFormData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Artists */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Artists *
            </label>
            {editFormData.artists?.map((artist, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
              >
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Artist Name"
                    value={artist.name}
                    onChange={(e) =>
                      handleArtistChange(index, "name", e.target.value)
                    }
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g., Headliner)"
                    value={artist.role}
                    onChange={(e) =>
                      handleArtistChange(index, "role", e.target.value)
                    }
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  {editFormData.artists.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArtist(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 whitespace-nowrap"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Genres (optional) */}
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    Genres (optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a genre and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArtistGenre(index, e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  {(artist.genres || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {artist.genres.map((genre, genreIndex) => (
                        <span
                          key={genreIndex}
                          className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                        >
                          {genre}
                          <button
                            type="button"
                            onClick={() => removeArtistGenre(index, genreIndex)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                            aria-label={`Remove ${genre}`}
                            title={`Remove ${genre}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addArtist}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Add Artist
            </button>
          </div>

          {/* Error Message */}
          {error && <div className="text-red-600 text-sm">{error}</div>}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
