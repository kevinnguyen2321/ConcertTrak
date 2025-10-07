"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function CreateConcertModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: "",
    venue: "",
    city: "",
    rating: "",
    notes: "",
    artists: [{ name: "", role: "", genres: [] }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArtistChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      artists: prev.artists.map((artist, i) =>
        i === index ? { ...artist, [field]: value } : artist
      ),
    }));
  };

  const addArtist = () => {
    setFormData((prev) => ({
      ...prev,
      artists: [...prev.artists, { name: "", role: "", genres: [] }],
    }));
  };

  const removeArtist = (index) => {
    setFormData((prev) => ({
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

    setFormData((prev) => ({
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
    setFormData((prev) => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Filter out empty artists
      const validArtists = formData.artists.filter(
        (artist) => artist.name && artist.role
      );

      // Validate at least one artist exists
      if (validArtists.length === 0) {
        setError("Please add at least one artist (name + role)");
        setIsSubmitting(false);
        return;
      }

      const concertData = {
        date: formData.date,
        venue: formData.venue,
        city: formData.city,
        rating: formData.rating ? parseInt(formData.rating) : null,
        notes: formData.notes || null,
        userProfileId: user.id,
        artists: validArtists,
      };

      const response = await fetch("/api/concerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(concertData),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form and close modal
        setFormData({
          date: "",
          venue: "",
          city: "",
          rating: "",
          notes: "",
          artists: [{ name: "", role: "", genres: [] }],
        });
        onClose();
        // Call the success callback to show success message on home page
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || "Failed to create concert");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Add New Concert
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
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
              value={formData.venue}
              onChange={handleInputChange}
              required
              placeholder="e.g., Madison Square Garden"
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
              value={formData.city}
              onChange={handleInputChange}
              required
              placeholder="e.g., New York"
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
              value={formData.rating}
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
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any notes about the concert..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Artists */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Artists *
            </label>
            {formData.artists.map((artist, index) => (
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
                  {formData.artists.length > 1 && (
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

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Concert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
