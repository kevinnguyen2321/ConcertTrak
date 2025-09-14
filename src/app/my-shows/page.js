"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function MyShowsPage() {
  const { user } = useAuth();
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchConcerts();
    }
  }, [user]);

  const fetchConcerts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/concerts?userProfileId=${user.id}`);
      const result = await response.json();

      if (result.success) {
        setConcerts(result.data);
      } else {
        setError(result.error || "Failed to fetch concerts");
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRatingStars = (rating) => {
    if (!rating) return "No rating";
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view your shows
          </h1>
          <p className="text-gray-600">
            You need to be logged in to see your concert history.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your shows...</p>
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
            Error Loading Shows
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchConcerts}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
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
          <h1 className="text-3xl font-bold text-gray-900">My Shows</h1>
          <p className="text-gray-600 mt-2">
            {concerts.length === 0
              ? "No concerts yet"
              : `${concerts.length} concert${
                  concerts.length === 1 ? "" : "s"
                } found`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {concerts.length === 0 ? (
          <div className="text-center py-12">
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No concerts yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start tracking your concerts by adding your first show!
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Add Your First Concert
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {concerts.map((concert) => (
              <div
                key={concert.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Concert Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {concert.venue}
                      </h3>
                      <p className="text-gray-600">{concert.city}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(concert.date)}
                      </p>
                    </div>
                    {concert.rating && (
                      <div className="text-right">
                        <div className="text-lg text-yellow-500">
                          {getRatingStars(concert.rating)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {concert.rating}/5 rating
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Artists */}
                  {concert.concertArtists &&
                    concert.concertArtists.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Artists
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {concert.concertArtists.map(
                            (concertArtist, index) => (
                              <div
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                              >
                                <span className="font-medium">
                                  {concertArtist.artist.name}
                                </span>
                                {concertArtist.role && (
                                  <span className="ml-1 text-blue-600">
                                    ({concertArtist.role})
                                  </span>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Notes */}
                  {concert.notes && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {concert.notes}
                      </p>
                    </div>
                  )}

                  {/* Concert Meta */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-xs text-gray-500">
                      Added on {formatDate(concert.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom padding to account for fixed navbar */}
      <div className="h-20"></div>
    </div>
  );
}
