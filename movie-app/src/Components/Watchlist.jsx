import React, { useEffect, useState } from 'react';
import MovieCard from './MovieCard';

const WATCHLIST_KEY = 'movie_watchlist';

const getWatchlist = () => {
  const data = localStorage.getItem(WATCHLIST_KEY);
  return data ? JSON.parse(data) : [];
};

const setWatchlist = (list) => {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
};

const Watchlist = () => {
  const [watchlist, setWatchlistState] = useState([]);

  useEffect(() => {
    setWatchlistState(getWatchlist());
  }, []);

  const removeFromWatchlist = (id) => {
    const updated = watchlist.filter(item => item.id !== id);
    setWatchlistState(updated);
    setWatchlist(updated);
  };

  const toggleWatched = (id) => {
    const updated = watchlist.map(item =>
      item.id === id ? { ...item, watched: !item.watched } : item
    );
    setWatchlistState(updated);
    setWatchlist(updated);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4 text-amber-50">My Watchlist</h2>
      {watchlist.length === 0 ? (
        <p className="text-white">Your watchlist is empty.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {watchlist.map((movie) => (
            <li key={movie.id} className="relative">
              <MovieCard movie={movie} actors={movie.actors} imdbRating={movie.imdbRating} rtRating={movie.rtRating} />
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                <button
                  className={`px-2 py-1 rounded text-xs font-bold ${movie.watched ? 'bg-green-600 text-white' : 'bg-gray-300 text-black'}`}
                  onClick={() => toggleWatched(movie.id)}
                >
                  {movie.watched ? 'Watched' : 'Mark as Watched'}
                </button>
                <button
                  className="px-2 py-1 rounded text-xs font-bold bg-red-600 text-white"
                  onClick={() => removeFromWatchlist(movie.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Watchlist; 