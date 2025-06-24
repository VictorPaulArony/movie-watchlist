import React, { useState, useEffect } from 'react';

const GenreFilter = ({ searchType, onGenreChange, selectedGenre }) => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const API_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
  const API_OPTIONS = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: API_KEY,
    },
  };

  // Fetch genres based on content type (movie or tv)
  const fetchGenres = async (type) => {
    setLoading(true);
    try {
      const endpoint = `${API_BASE_URL}/genre/${type}/list`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }
      const data = await response.json();
      setGenres(data.genres || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
      setGenres([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres(searchType);
  }, [searchType]);

  const handleGenreClick = (genre) => {
    onGenreChange(genre);
  };

  const clearFilter = () => {
    onGenreChange(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="genre-filter-container mb-6">
      <div className="flex flex-wrap items-center gap-3 justify-center">
        <span className="text-white font-semibold text-lg">Filter by Genre:</span>
        
        {/* Clear Filter Button */}
        <button
          onClick={clearFilter}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            selectedGenre === null
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
          }`}
        >
          All {searchType === 'movie' ? 'Movies' : 'TV Shows'}
        </button>

        {/* Genre Buttons */}
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleGenreClick(genre)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedGenre?.id === genre.id
                ? 'bg-amber-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:scale-105'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Selected Genre Display */}
      {selectedGenre && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-600/20 backdrop-blur-sm border border-amber-600/30 rounded-lg px-4 py-2">
            <span className="text-amber-400 font-semibold">
              Currently viewing: {selectedGenre.name}
            </span>
            <button
              onClick={clearFilter}
              className="text-amber-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenreFilter; 