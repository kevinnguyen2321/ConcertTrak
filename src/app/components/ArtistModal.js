"use client";

export default function ArtistModal({ artist, isOpen, onClose }) {
  if (!isOpen || !artist) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* Close button */}
        <div className="flex justify-end mb-4">
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

        {/* Artist Image */}
        <div className="flex justify-center mb-6">
          {artist.imageUrl ? (
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className="w-32 h-32 rounded-full object-cover shadow-lg"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-4xl font-bold">
                {artist.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Artist Name */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          {artist.name}
        </h2>

        {/* Genres */}
        {artist.artistGenres && artist.artistGenres.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {artist.artistGenres.map((ag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full"
                >
                  {ag.genre.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Close
        </button>
      </div>
    </div>
  );
}
