import React, { useState, useEffect } from 'react';
import Search from './Components/Search.jsx';
import './App.css';
import Spinner from './Components/Spinner.jsx';
import MovieCard from './Components/MovieCard.jsx';
import { useDebounce } from 'react-use'
import Appwrite from './appwrite.jsx';
import { getTopSearches } from './appwrite.jsx';
import Watchlist from './Components/Watchlist';
import RecommendationEngine from './Components/RecommendationEngine';
import GenreFilter from './Components/GenreFilter';
import CategoryBrowser from './Components/CategoryBrowser';

function App() {

  //application sates hooks
  const [movies, setMovies] = useState([]);
  const [searchItem, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isloading, setLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [topSearches, setTopSearches] = useState([]);
  const [searchType, setSearchType] = useState('movie'); // 'movie' or 'tv'
  const [activeTab, setActiveTab] = useState('movie'); // 'movie', 'tv', 'watchlist', 'recommendations'
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useDebounce(() => setDebouncedSearchTerm(searchItem), 500, [searchItem]);

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const API_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
  const API_OPTIONS = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: API_KEY,
    },
  }

  const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
  const OMDB_BASE_URL = 'https://www.omdbapi.com/';

  // Helper to fetch OMDb data for a movie or TV show
  const fetchOmdbData = async (title, year) => {
    if (!title) return null;
    const url = `${OMDB_BASE_URL}?t=${encodeURIComponent(title)}${year ? `&y=${year}` : ''}&apikey=${OMDB_API_KEY}`;
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.json();
      if (data.Response === 'False') return null;
      return data;
    } catch {
      return null;
    }
  };

  const fetchMovies = async (query = '', type = searchType, genre = selectedGenre, category = selectedCategory) => {
    setLoading(true);
    setErrorMessage('');
    try {
      let endpoint;
      
      if (query) {
        // Search endpoint
        endpoint = `${API_BASE_URL}/search/${type}?query=${encodeURI(query)}`;
      } else if (genre) {
        // Genre-based discovery endpoint
        endpoint = `${API_BASE_URL}/discover/${type}?with_genres=${genre.id}&sort_by=popularity.desc`;
      } else if (category) {
        // Category-based endpoint
        if (category.id === 'trending') {
          endpoint = `${API_BASE_URL}/trending/${type}/week`;
        } else if (category.id === 'popular') {
          endpoint = `${API_BASE_URL}/${type}/popular`;
        } else if (category.id === 'top_rated') {
          endpoint = `${API_BASE_URL}/${type}/top_rated`;
        } else if (category.id === 'upcoming' && type === 'movie') {
          endpoint = `${API_BASE_URL}/movie/upcoming`;
        } else if (category.id === 'now_playing' && type === 'movie') {
          endpoint = `${API_BASE_URL}/movie/now_playing`;
        } else if (category.id === 'on_the_air' && type === 'tv') {
          endpoint = `${API_BASE_URL}/tv/on_the_air`;
        } else if (category.id === 'airing_today' && type === 'tv') {
          endpoint = `${API_BASE_URL}/tv/airing_today`;
        } else {
          // Fallback to popular
          endpoint = `${API_BASE_URL}/${type}/popular`;
        }
      } else {
        // Default popular content endpoint
        endpoint = `${API_BASE_URL}/discover/${type}?sort_by=popularity.desc`;
      }

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (!data.response === false) {
        setErrorMessage('Failed to fetch results: ' + data.Error);
        setMovies([]);
        return;
      }
      // Fetch OMDb data for each movie/TV show
      const moviesWithOmdb = await Promise.all(
        (data.results || []).map(async (movie) => {
          const omdbData = await fetchOmdbData(movie.title || movie.name, movie.release_date ? movie.release_date.split('-')[0] : undefined);
          let actors = [];
          let imdbRating = null;
          let rtRating = null;
          if (omdbData) {
            // Actors is a comma-separated string
            actors = omdbData.Actors ? omdbData.Actors.split(',').map(name => ({ name: name.trim() })) : [];
            imdbRating = omdbData.imdbRating && omdbData.imdbRating !== 'N/A' ? omdbData.imdbRating : null;
            if (omdbData.Ratings) {
              const rt = omdbData.Ratings.find(r => r.Source === 'Rotten Tomatoes');
              rtRating = rt ? rt.Value : null;
            }
          }
          return { ...movie, actors, imdbRating, rtRating };
        })
      );
      setMovies(moviesWithOmdb);

      if (query && data.results.length > 0) {
        await Appwrite(query, data.results[0]);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTopSearches();
      setTopSearches(movies);
    } catch (error) {
      console.error('Error fetching top searches:', error);
    }
  };

  // Handle genre selection
  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setSelectedCategory(null); // Clear category when genre is selected
    // Clear search when genre is selected
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedGenre(null); // Clear genre when category is selected
    // Clear search when category is selected
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  useEffect(() => {
    if (activeTab === 'movie' || activeTab === 'tv') {
      setSearchType(activeTab);
      // Reset filters when switching between movie and tv
      setSelectedGenre(null);
      setSelectedCategory(null);
      fetchMovies(debouncedSearchTerm, activeTab, null, null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'movie' || activeTab === 'tv') {
      fetchMovies(debouncedSearchTerm, searchType, selectedGenre, selectedCategory);
    }
  }, [debouncedSearchTerm, selectedGenre, selectedCategory]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  // Add to watchlist helper
  const WATCHLIST_KEY = 'movie_watchlist';
  const getWatchlist = () => {
    const data = localStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
  };
  const setWatchlist = (list) => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  };
  const addToWatchlist = (movie) => {
    const current = getWatchlist();
    if (!current.find(item => item.id === movie.id)) {
      const updated = [...current, { ...movie, watched: false }];
      setWatchlist(updated);
    }
  };

  return (
    <main className="App">
      {/* Blur Background */}
      <div className="blur-background">
        <div className="blur-overlay"></div>
      </div>
      <div className='container relative z-10'>
        <div className='content-wrapper'>
          <header className='flex flex-col items-center gap-4'>
            <div className='image-container'>
              {/* <img
                src='/src/assets/poster.png'
                alt='poster'
                className='w-90 max-w-full h-auto rounded-lg shadow-lg'
              /> */}
            </div>
            <div className='text-container backdrop-blur-sm bg-white/30 dark:bg-black/30 p-6 rounded-xl'>
              <h1 className='text-5xl font-bold text-center text-amber-600'>Movie Shop</h1>
            </div>
            <div className="flex gap-4 items-center mb-2">
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'movie' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => { setActiveTab('movie'); }}
              >
                Movies
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'tv' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => { setActiveTab('tv'); }}
              >
                TV Shows
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'watchlist' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => setActiveTab('watchlist')}
              >
                My Watchlist
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'recommendations' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => setActiveTab('recommendations')}
              >
                Recommendations
              </button>
            </div>
            {activeTab !== 'watchlist' && activeTab !== 'recommendations' && (
              <Search searchItem={searchItem} setSearchTerm={setSearchTerm} searchType={searchType} />
            )}
          </header>

          {activeTab === 'watchlist' ? (
            <Watchlist />
          ) : activeTab === 'recommendations' ? (
            <RecommendationEngine />
          ) : (
            <>
              {/* Category Browser Component */}
              <CategoryBrowser 
                searchType={searchType} 
                onCategoryChange={handleCategoryChange} 
                selectedCategory={selectedCategory}
              />
              
              {/* Genre Filter Component */}
              <GenreFilter 
                searchType={searchType} 
                onGenreChange={handleGenreChange} 
                selectedGenre={selectedGenre}
              />
              
              {topSearches.length > 0 && !selectedGenre && !selectedCategory && !debouncedSearchTerm && (
                <section className='top-searches mx-0 my-auto p-4'>
                  <h2 className='text-xl md:text-2xl mb-4 font-bold text-center text-white'>Top Searches</h2>
                  <ul className='flex flex-wrap gap-2 justify-center md:gap-4 lg:flex-nowrap'>
                    {topSearches.map((movie, index) => (
                      <li key={movie.id || index} className='flex flex-row gap-1 items-center'>
                        <span className='text-2xl md:text-4xl font-extrabold text-amber-600'>{index + 1}</span>
                        <img
                          className='w-full max-w-[100px] md:max-w-[150px] h-auto rounded-lg shadow-lg'
                          src={movie.poster_url ? `https://image.tmdb.org/t/p/w500${movie.poster_url}` : './src/assets/poster.png'}
                          alt={movie.title}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <section className='all-movies'>
                <h2 className='mt-5 p-5 text-3xl font-bold text-center text-amber-50'>
                  {selectedGenre 
                    ? `${selectedGenre.name} ${activeTab === 'movie' ? 'Movies' : 'TV Shows'}`
                    : selectedCategory
                      ? `${selectedCategory.name} ${activeTab === 'movie' ? 'Movies' : 'TV Shows'}`
                      : debouncedSearchTerm 
                        ? `Search Results for "${debouncedSearchTerm}"`
                        : `All ${activeTab === 'movie' ? 'Movies' : 'TV Shows'}`
                  }
                </h2>
                {isloading ? (
                  <><Spinner /></>
                ) : errorMessage ? (
                  <p className='text-red-500 text-center'>Error {errorMessage}</p>
                ) : (
                  <ul className='bg-dark-100 text-black grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    {movies.map((movie) => (
                      <MovieCard key={movie.id || movie.title || movie.name} movie={movie} actors={movie.actors} imdbRating={movie.imdbRating} rtRating={movie.rtRating} onAddToWatchlist={() => addToWatchlist(movie)} />
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;