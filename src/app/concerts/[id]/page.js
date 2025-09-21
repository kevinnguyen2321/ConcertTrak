"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import LoginForm from "../../components/LoginForm";
import EditConcertForm from "../../components/EditConcertForm";

export default function ConcertDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOwner =
    concert?.userProfileId && user?.id && concert.userProfileId === user.id;

  useEffect(() => {
    if (user && params.id) {
      fetchConcert();
    }
  }, [user, params.id]);

  const fetchConcert = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/concerts/${params.id}`);
      const result = await response.json();

      if (result.success) {
        setConcert(result.data);
      } else {
        setError(result.error || "Failed to fetch concert");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  const getRatingStars = (rating) => {
    if (!rating) return "No rating";
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setSaveSuccess(false);
    setError("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveSuccess(false);
    setError("");
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      setError("");

      const concertId = parseInt(params.id);
      const response = await fetch(`/api/concerts/${concertId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setShowDeleteModal(false);
        // Redirect to my-shows page with success message
        router.push("/my-shows?deleted=true");
      } else {
        setError(result.error || "Failed to delete concert");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handleSaveChanges = async (editFormData) => {
    try {
      setSaving(true);
      setError("");

      const concertId = parseInt(params.id);

      // Filter out empty artists
      const validArtists = editFormData.artists.filter(
        (artist) => artist.artistId && artist.role
      );

      if (validArtists.length === 0) {
        setError("Please add at least one artist");
        setSaving(false);
        return;
      }

      // Coerce types before sending
      const concertData = {
        ...editFormData,
        rating:
          editFormData.rating === "" ? null : parseInt(editFormData.rating, 10),
        artists: validArtists,
      };

      const response = await fetch(`/api/concerts/${concertId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(concertData),
      });

      const result = await response.json();

      if (result.success) {
        setConcert(result.data);
        setIsEditing(false);
        setSaveSuccess(true);
        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to update concert");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <LoginForm />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading concert details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Concert
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchConcert}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!concert) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-24 h-24 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Concert Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The concert you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Concert Details
            </h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Concert successfully saved!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isEditing ? (
          <EditConcertForm
            concert={concert}
            user={user}
            onSave={handleSaveChanges}
            onCancel={handleCancelEdit}
            saving={saving}
            error={error}
          />
        ) : (
          /* View Mode */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Concert Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{concert.venue}</h2>
                  <p className="text-blue-100 text-lg">{concert.city}</p>
                  <p className="text-blue-200 text-sm mt-1">
                    {formatDate(concert.date)}
                  </p>
                </div>
                <div className="text-right">
                  {concert.rating && (
                    <div className="mb-4">
                      <div className="text-2xl text-yellow-300">
                        {getRatingStars(concert.rating)}
                      </div>
                      <p className="text-blue-100 text-sm">
                        {concert.rating}/5 rating
                      </p>
                    </div>
                  )}
                  {/* Edit and Delete Actions */}
                  {isOwner && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleEditClick}
                        className="p-2 text-blue-100 hover:text-white hover:bg-blue-800 rounded-lg transition-colors"
                        title="Edit concert"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        className="p-2 text-blue-100 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
                        title="Delete concert"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {concert.userProfile.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {concert.userProfile.displayName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Added on {formatDate(concert.createdAt)}
                  </p>
                </div>
              </div>

              {/* Artists */}
              {concert.concertArtists && concert.concertArtists.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Artists
                  </h4>
                  <div className="grid gap-3">
                    {concert.concertArtists.map((concertArtist, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {concertArtist.artist.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {concertArtist.artist.name}
                            </h5>
                            {concertArtist.role && (
                              <p className="text-sm text-gray-600">
                                {concertArtist.role}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {concert.notes && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Notes
                  </h4>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-gray-700 leading-relaxed">
                      "{concert.notes}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom padding to account for fixed navbar */}
      <div className="h-20"></div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Concert
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this concert? This action cannot
                be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
