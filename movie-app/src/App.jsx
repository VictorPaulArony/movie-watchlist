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
import Pagination from './Components/Pagination';
import { Routes, Route } from 'react-router-dom';
import MovieDetails from './Components/MovieDetails';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [heroItem, setHeroItem] = useState(null);

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

  const fetchMovies = async (query = '', type = searchType, genre = selectedGenre, category = selectedCategory, page = currentPage) => {
    setLoading(true);
    setErrorMessage('');
    try {
      let endpoint;
      
      if (query) {
        endpoint = `${API_BASE_URL}/search/${type}?query=${encodeURI(query)}&page=${page}`;
      } else if (genre) {
        endpoint = `${API_BASE_URL}/discover/${type}?with_genres=${genre.id}&sort_by=popularity.desc&page=${page}`;
      } else if (category) {
        if (category.id === 'trending') {
          endpoint = `${API_BASE_URL}/trending/${type}/week?page=${page}`;
        } else if (category.id === 'popular') {
          endpoint = `${API_BASE_URL}/${type}/popular?page=${page}`;
        } else if (category.id === 'top_rated') {
          endpoint = `${API_BASE_URL}/${type}/top_rated?page=${page}`;
        } else if (category.id === 'upcoming' && type === 'movie') {
          endpoint = `${API_BASE_URL}/movie/upcoming?page=${page}`;
        } else if (category.id === 'now_playing' && type === 'movie') {
          endpoint = `${API_BASE_URL}/movie/now_playing?page=${page}`;
        } else if (category.id === 'on_the_air' && type === 'tv') {
          endpoint = `${API_BASE_URL}/tv/on_the_air?page=${page}`;
        } else if (category.id === 'airing_today' && type === 'tv') {
          endpoint = `${API_BASE_URL}/tv/airing_today?page=${page}`;
        } else {
          endpoint = `${API_BASE_URL}/${type}/popular?page=${page}`;
        }
      } else {
        endpoint = `${API_BASE_URL}/discover/${type}?sort_by=popularity.desc&page=${page}`;
      }

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setTotalPages(data.total_pages ? Math.min(data.total_pages, 500) : 1); // TMDB max 500
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
      setSelectedGenre(null);
      setSelectedCategory(null);
      setCurrentPage(1);
      fetchMovies(debouncedSearchTerm, activeTab, null, null, 1);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'movie' || activeTab === 'tv') {
      setCurrentPage(1);
      fetchMovies(debouncedSearchTerm, searchType, selectedGenre, selectedCategory, 1);
    }
  }, [debouncedSearchTerm, selectedGenre, selectedCategory]);

  useEffect(() => {
    if (activeTab === 'movie' || activeTab === 'tv') {
      fetchMovies(debouncedSearchTerm, searchType, selectedGenre, selectedCategory, currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  // Fetch most popular movie/tv for hero section
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const endpoint = `${API_BASE_URL}/${searchType}/popular?page=1`;
        const response = await fetch(endpoint, API_OPTIONS);
        if (!response.ok) return;
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setHeroItem(data.results[0]);
        }
      } catch {}
    };
    fetchHero();
  }, [searchType]);

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
      {/* Full-bleed Hero Section */}
      {heroItem && (
        <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] max-w-none mb-0 z-20">
          <div className="relative w-full overflow-hidden shadow-xl bg-black/60">
            <img
              src={heroItem.backdrop_path ? `https://image.tmdb.org/t/p/original${heroItem.backdrop_path}` : heroItem.poster_path ? `https://image.tmdb.org/t/p/w500${heroItem.poster_path}` : '/src/assets/poster.png'}
              alt={heroItem.title || heroItem.name}
              className="w-full h-[320px] sm:h-[420px] md:h-[520px] object-cover object-center opacity-70"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 sm:px-8">
              <h1 className="text-4xl sm:text-6xl font-extrabold text-white drop-shadow-lg text-center mb-4 tracking-tight">
                Movie Shop
              </h1>
              <h2 className="text-xl sm:text-3xl font-bold text-white drop-shadow mb-2 text-center max-w-2xl">
                {heroItem.title || heroItem.name}
              </h2>
              <p className="text-white/90 text-base sm:text-lg max-w-2xl line-clamp-3 mb-4 text-center">{heroItem.overview}</p>
              <div className="flex gap-2 items-center mb-4">
                <span className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold">{heroItem.release_date || heroItem.first_air_date}</span>
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">{heroItem.vote_average?.toFixed(1)}</span>
              </div>
              <div>
                <a
                  href={`/details/${searchType}/${heroItem.id}`}
                  className="inline-block px-6 py-2 bg-amber-600 text-white font-semibold rounded-lg shadow hover:bg-amber-700 transition text-lg"
                >
                  View Details
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
      <div className='container relative z-10 px-2 sm:px-4 -mt-8 sm:-mt-16'>
        <div className='content-wrapper pt-2 sm:pt-6 md:pt-10'>
          <Routes>
            <Route path="/" element={
              <>
                <header className='flex flex-col items-center gap-4 w-full'>
                  <div className="flex flex-wrap gap-2 sm:gap-4 items-center mb-2 w-full justify-center">
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold w-full sm:w-auto ${activeTab === 'movie' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                      onClick={() => { setActiveTab('movie'); }}
                    >
                      Movies
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold w-full sm:w-auto ${activeTab === 'tv' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                      onClick={() => { setActiveTab('tv'); }}
                    >
                      TV Shows
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold w-full sm:w-auto ${activeTab === 'watchlist' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                      onClick={() => setActiveTab('watchlist')}
                    >
                      My Watchlist
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold w-full sm:w-auto ${activeTab === 'recommendations' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
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
                                className='w-full max-w-[80px] sm:max-w-[100px] md:max-w-[150px] h-auto rounded-lg shadow-lg'
                                src={movie.poster_url ? `https://image.tmdb.org/t/p/w500${movie.poster_url}` : './src/assets/poster.png'}
                                alt={movie.title}
                              />
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    <section className='all-movies'>
                      <h2 className='mt-5 p-5 text-2xl sm:text-3xl font-bold text-center text-amber-50'>
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
                        <>
                        <ul className='bg-dark-100 text-black grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                          {movies.map((movie) => (
                            <MovieCard key={movie.id || movie.title || movie.name} movie={movie} actors={movie.actors} imdbRating={movie.imdbRating} rtRating={movie.rtRating} onAddToWatchlist={() => addToWatchlist(movie)} />
                          ))}
                        </ul>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </>
                      )}
                    </section>
                  </>
                )}
              </>
            } />
            <Route path="/details/:type/:id" element={<MovieDetails />} />
          </Routes>
        </div>
      </div>
    </main>
  );
}

export default App;