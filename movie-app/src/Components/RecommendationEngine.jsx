import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import Spinner from './Spinner';
import PreferenceChart from './PreferenceChart';

const WATCHLIST_KEY = 'movie_watchlist';

const getWatchlist = () => {
  const data = localStorage.getItem(WATCHLIST_KEY);
  return data ? JSON.parse(data) : [];
};

// Genre mapping for better display
const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

const RecommendationEngine = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userPreferences, setUserPreferences] = useState({});
  const [genreMap, setGenreMap] = useState(GENRE_MAP);

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const API_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
  const API_OPTIONS = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: API_KEY,
    },
  };

  // Fetch and cache genre mapping
  const fetchGenreMap = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/genre/movie/list`, API_OPTIONS);
      const data = await response.json();
      const newGenreMap = {};
      data.genres.forEach(genre => {
        newGenreMap[genre.id] = genre.name;
      });
      setGenreMap(newGenreMap);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  // Analyze user preferences from watchlist
  const analyzeUserPreferences = (watchlist) => {
    if (watchlist.length === 0) return {};

    const preferences = {
      genres: {},
      actors: {},
      directors: {},
      years: {},
      ratings: [],
      averageRating: 0,
      totalMovies: watchlist.length,
      watchedMovies: watchlist.filter(movie => movie.watched).length,
      watchlistSize: watchlist.length
    };

    watchlist.forEach(movie => {
      // Analyze genres
      if (movie.genre_ids) {
        movie.genre_ids.forEach(genreId => {
          preferences.genres[genreId] = (preferences.genres[genreId] || 0) + 1;
        });
      }

      // Analyze actors
      if (movie.actors && Array.isArray(movie.actors)) {
        movie.actors.forEach(actor => {
          preferences.actors[actor.name] = (preferences.actors[actor.name] || 0) + 1;
        });
      }

      // Analyze years
      if (movie.release_date) {
        const year = movie.release_date.split('-')[0];
        preferences.years[year] = (preferences.years[year] || 0) + 1;
      }

      // Analyze ratings
      if (movie.imdbRating && movie.imdbRating !== 'N/A') {
        preferences.ratings.push(parseFloat(movie.imdbRating));
      }
    });

    // Calculate average rating
    if (preferences.ratings.length > 0) {
      preferences.averageRating = preferences.ratings.reduce((a, b) => a + b, 0) / preferences.ratings.length;
    }

    return preferences;
  };

  // Calculate recommendation score based on user preferences
  const calculateRecommendationScore = (movie, preferences) => {
    let score = 0;
    
    // Genre match score
    if (movie.genre_ids && preferences.genres) {
      movie.genre_ids.forEach(genreId => {
        if (preferences.genres[genreId]) {
          score += preferences.genres[genreId] * 10;
        }
      });
    }

    // Actor match score
    if (movie.actors && preferences.actors) {
      movie.actors.forEach(actor => {
        if (preferences.actors[actor.name]) {
          score += preferences.actors[actor.name] * 15;
        }
      });
    }

    // Year preference score
    if (movie.release_date && preferences.years) {
      const year = movie.release_date.split('-')[0];
      if (preferences.years[year]) {
        score += preferences.years[year] * 5;
      }
    }

    // Rating score
    if (movie.vote_average && preferences.averageRating) {
      const ratingDiff = Math.abs(movie.vote_average - preferences.averageRating);
      score += Math.max(0, 10 - ratingDiff);
    }

    return score;
  };

  // Generate recommendations based on preferences
  const generateRecommendations = async (preferences) => {
    if (Object.keys(preferences).length === 0) return [];

    setIsLoading(true);
    setError('');

    try {
      const allRecommendations = [];
      
      // Get top genres
      const topGenres = Object.entries(preferences.genres)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([id]) => parseInt(id));

      // Get top actors
      const topActors = Object.entries(preferences.actors)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name]) => name);

      // Get preferred years range
      const years = Object.keys(preferences.years).map(Number);
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);

      // Strategy 1: Recommendations based on top genres
      for (const genreId of topGenres) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&vote_average.gte=${Math.max(6, preferences.averageRating - 1)}&vote_count.gte=100&page=1`,
            API_OPTIONS
          );
          const data = await response.json();
          if (data.results) {
            allRecommendations.push(...data.results.slice(0, 8));
          }
        } catch (error) {
          console.error(`Error fetching genre ${genreId} recommendations:`, error);
        }
      }

      // Strategy 2: Recommendations based on actors
      for (const actorName of topActors) {
        try {
          // First, search for the actor to get their ID
          const searchResponse = await fetch(
            `${API_BASE_URL}/search/person?query=${encodeURIComponent(actorName)}`,
            API_OPTIONS
          );
          const searchData = await searchResponse.json();
          
          if (searchData.results && searchData.results.length > 0) {
            const actorId = searchData.results[0].id;
            const moviesResponse = await fetch(
              `${API_BASE_URL}/discover/movie?with_cast=${actorId}&sort_by=popularity.desc&vote_average.gte=${Math.max(6, preferences.averageRating - 1)}&page=1`,
              API_OPTIONS
            );
            const moviesData = await moviesResponse.json();
            if (moviesData.results) {
              allRecommendations.push(...moviesData.results.slice(0, 5));
            }
          }
        } catch (error) {
          console.error(`Error fetching movies for actor ${actorName}:`, error);
        }
      }

      // Strategy 3: Recommendations based on year range
      try {
        const yearResponse = await fetch(
          `${API_BASE_URL}/discover/movie?primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31&sort_by=popularity.desc&vote_average.gte=${Math.max(6, preferences.averageRating - 1)}&page=1`,
          API_OPTIONS
        );
        const yearData = await yearResponse.json();
        if (yearData.results) {
          allRecommendations.push(...yearData.results.slice(0, 8));
        }
      } catch (error) {
        console.error('Error fetching year-based recommendations:', error);
      }

      // Strategy 4: Similar movies based on high-rated movies in watchlist
      const highRatedMovies = getWatchlist()
        .filter(movie => movie.imdbRating && parseFloat(movie.imdbRating) >= 7.5)
        .slice(0, 3);

      for (const movie of highRatedMovies) {
        try {
          const similarResponse = await fetch(
            `${API_BASE_URL}/movie/${movie.id}/similar?page=1`,
            API_OPTIONS
          );
          const similarData = await similarResponse.json();
          if (similarData.results) {
            allRecommendations.push(...similarData.results.slice(0, 5));
          }
        } catch (error) {
          console.error(`Error fetching similar movies for ${movie.title}:`, error);
        }
      }

      // Remove duplicates and calculate scores
      const uniqueRecommendations = allRecommendations
        .filter((movie, index, self) => 
          index === self.findIndex(m => m.id === movie.id)
        )
        .map(movie => ({
          ...movie,
          recommendationScore: calculateRecommendationScore(movie, preferences)
        }))
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 24);

      // Fetch additional data for each recommendation
      const recommendationsWithDetails = await Promise.all(
        uniqueRecommendations.map(async (movie) => {
          try {
            // Get movie details
            const detailsResponse = await fetch(
              `${API_BASE_URL}/movie/${movie.id}?append_to_response=credits`,
              API_OPTIONS
            );
            const details = await detailsResponse.json();
            
            // Get OMDb data for ratings
            const omdbResponse = await fetch(
              `https://www.omdbapi.com/?t=${encodeURIComponent(movie.title)}&y=${movie.release_date?.split('-')[0]}&apikey=${import.meta.env.VITE_OMDB_API_KEY}`
            );
            const omdbData = await omdbResponse.json();
            
            return {
              ...movie,
              actors: details.credits?.cast?.slice(0, 5).map(actor => ({ name: actor.name })) || [],
              imdbRating: omdbData.imdbRating && omdbData.imdbRating !== 'N/A' ? omdbData.imdbRating : null,
              rtRating: omdbData.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value || null,
              genre_names: details.genres?.map(g => g.name) || [],
              director: details.credits?.crew?.find(person => person.job === 'Director')?.name || null
            };
          } catch (error) {
            console.error(`Error fetching details for movie ${movie.id}:`, error);
            return movie;
          }
        })
      );

      setRecommendations(recommendationsWithDetails);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add to watchlist helper
  const addToWatchlist = (movie) => {
    const current = getWatchlist();
    if (!current.find(item => item.id === movie.id)) {
      const updated = [...current, { ...movie, watched: false }];
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    }
  };

  useEffect(() => {
    fetchGenreMap();
    const watchlist = getWatchlist();
    const preferences = analyzeUserPreferences(watchlist);
    setUserPreferences(preferences);
    
    if (watchlist.length > 0) {
      generateRecommendations(preferences);
    }
  }, []);

  const refreshRecommendations = () => {
    const watchlist = getWatchlist();
    const preferences = analyzeUserPreferences(watchlist);
    setUserPreferences(preferences);
    generateRecommendations(preferences);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-amber-50">Personalized Recommendations</h2>
        <button
          onClick={refreshRecommendations}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Refresh Recommendations
        </button>
      </div>

      {getWatchlist().length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white text-lg mb-4">Your watchlist is empty.</p>
          <p className="text-gray-300">Add some movies to your watchlist to get personalized recommendations!</p>
        </div>
      ) : (
        <>
          {/* User Preferences Summary */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
            <h3 className="text-xl font-semibold text-amber-50 mb-3">Your Preferences Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-white">
              <div>
                <p className="font-semibold">Total Movies: {userPreferences.totalMovies || 0}</p>
                <p className="font-semibold">Watched: {userPreferences.watchedMovies || 0}</p>
                <p className="font-semibold">Average Rating: {userPreferences.averageRating?.toFixed(1) || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Top Genres:</p>
                <p className="text-sm">
                  {Object.entries(userPreferences.genres || {})
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([id, count]) => `${genreMap[id] || `Genre ${id}`} (${count})`)
                    .join(', ')}
                </p>
              </div>
              <div>
                <p className="font-semibold">Favorite Actors:</p>
                <p className="text-sm">
                  {Object.entries(userPreferences.actors || {})
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([name, count]) => `${name} (${count})`)
                    .join(', ')}
                </p>
              </div>
              <div>
                <p className="font-semibold">Preferred Years:</p>
                <p className="text-sm">
                  {Object.entries(userPreferences.years || {})
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([year, count]) => `${year} (${count})`)
                    .join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Preference Chart */}
          <PreferenceChart preferences={userPreferences} genreMap={genreMap} />

          {/* Recommendations */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : recommendations.length > 0 ? (
            <div>
              <h3 className="text-xl font-semibold text-amber-50 mb-4">
                Recommended for You ({recommendations.length} movies)
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.map((movie, index) => (
                  <li key={movie.id} className="relative">
                    <MovieCard 
                      movie={movie} 
                      actors={movie.actors} 
                      imdbRating={movie.imdbRating} 
                      rtRating={movie.rtRating} 
                      onAddToWatchlist={() => addToWatchlist(movie)} 
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold">
                        #{index + 1}
                      </span>
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                        Score: {movie.recommendationScore?.toFixed(0) || 'N/A'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-white text-center">No recommendations available. Try adding more movies to your watchlist!</p>
          )}
        </>
      )}
    </div>
  );
};

export default RecommendationEngine; 