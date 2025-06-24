import React, { useState, useEffect } from 'react';

const truncateText =(text, limit) => {
  const words = text.split(' ');
  return words.length > limit ? words.slice(0, limit).join(' ') + '...' : text;
}

const MovieCard = ({
  movie: { id, title, name, overview, poster_path, vote_average, original_language, release_date },
  actors = [],
  imdbRating,
  rtRating,
  onAddToWatchlist
}) => {
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('movie_watchlist');
    if (data) {
      const list = JSON.parse(data);
      setInWatchlist(!!list.find(item => item.id === id));
    }
  }, [id]);

  const toggleOverview = () => {
    setShowFullOverview(!showFullOverview);
  }

  const handleAddToWatchlist = async () => {
    setAdding(true);
    if (onAddToWatchlist) {
      await onAddToWatchlist();
    }
    setInWatchlist(true);
    setAdding(false);
  };

  return (
    <div className="movie-card bg-dark-100 text-amber-50 dark:bg-gray-800 rounded-2xl shadow-inner shadow-light-100/10 overflow-hidden transition-transform duration-300 hover:scale-105">
      <img className='w-full h-auto'
        src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : './src/assets/poster.png' }
        alt={title}
        />
        <h3 className='text-lg font-bold  m-2'>{ title || name || 'Unknown Title' }</h3>
        <p>
          {showFullOverview ? overview : truncateText(overview, 20)}
          {overview.length > 20 && (
            <span className="text-blue-500 cursor-pointer" onClick={toggleOverview}>
              {showFullOverview ? 'Show Less' : 'Show More'}
            </span>
          )}
        </p>
      <div className="movie-overview flex gap-2 items-center align-middle">
        <div className='rating flex gap-2 items-center align-middle'>
            <img src="./src/assets/icon.png" alt="star icon" className='w-4 h-4 m-3' />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
        </div>
        {imdbRating && (
          <div className="flex items-center gap-1">
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg" alt="IMDb" className="w-8 h-4" />
            <span>{imdbRating}</span>
          </div>
        )}
        {rtRating && (
          <div className="flex items-center gap-1">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5b/Rotten_Tomatoes.svg" alt="Rotten Tomatoes" className="w-4 h-4" />
            <span>{rtRating}</span>
          </div>
        )}
        <span>.</span>
        <p className='lang'> {original_language}</p>
        <span>.</span>
        <p className='year'>{release_date ? release_date.split('-')[0] : 'N/A'}</p>
      </div>
      <div className="cast mt-2">
        <span className="font-semibold">Actors:</span>
        <span>
          {actors.length > 0 ? actors.map((member, idx) => (
            <span key={idx}>
              {member.name}{idx < actors.length - 1 ? ', ' : ''}
            </span>
          )) : ' N/A'}
        </span>
      </div>
      {onAddToWatchlist && (
        <button
          className={`mt-2 px-3 py-1 rounded font-semibold transition-all duration-200 flex items-center gap-2 ${inWatchlist ? 'bg-green-600 text-white opacity-80 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          onClick={handleAddToWatchlist}
          disabled={inWatchlist || adding}
        >
          {adding ? (
            <svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          ) : inWatchlist ? (
            <>
              <span>&#10003;</span> In Watchlist
            </>
          ) : (
            'Add to Watchlist'
          )}
        </button>
      )}
    </div>
  );
};

export default MovieCard;