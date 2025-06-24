import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
const YOUTUBE_API_KEY = '';

const MovieDetails = () => {
  const { id, type } = useParams();
  const [details, setDetails] = useState(null);
  const [providers, setProviders] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/${type}/${id}?append_to_response=videos,watch/providers,credits`, {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: API_KEY,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch details');
        const data = await res.json();
        setDetails(data);
        // Watch providers
        const prov = data['watch/providers']?.results?.US || [];
        setProviders(prov.flatrate || prov.rent || prov.buy || []);
        // Trailer
        const yt = data.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer');
        setTrailer(yt ? `https://www.youtube.com/embed/${yt.key}` : null);
      } catch (e) {
        setError('Could not load details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, type]);

  // Placeholder for theme toggle
  const handleThemeToggle = () => {
    document.documentElement.classList.toggle('dark');
  };

  // Placeholder for social share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: details?.title || details?.name,
        url: window.location.href,
      });
    } else {
      window.prompt('Copy this link:', window.location.href);
    }
  };

  // Placeholder for export
  const handleExport = (type) => {
    alert(`Export as ${type} coming soon!`);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><span>Loading...</span></div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!details) return null;

  return (
    <div className="max-w-3xl mx-auto bg-white/10 dark:bg-black/40 rounded-xl p-4 sm:p-8 mt-4 shadow-lg">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-500 hover:underline">&larr; Back</button>
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : '/src/assets/poster.png'}
          alt={details.title || details.name}
          className="w-full max-w-[220px] rounded-lg shadow-lg mx-auto md:mx-0"
        />
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <h2 className="text-2xl font-bold text-amber-600">{details.title || details.name}</h2>
            <button onClick={handleThemeToggle} className="px-3 py-1 rounded bg-gray-700 text-white text-sm">Toggle Theme</button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold">{details.release_date || details.first_air_date}</span>
            <span className="bg-gray-700 text-white px-2 py-1 rounded text-xs">{details.original_language?.toUpperCase()}</span>
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">{details.vote_average?.toFixed(1)}</span>
          </div>
          <p className="text-white/90 mt-2">{details.overview}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {details.genres?.map(g => (
              <span key={g.id} className="bg-amber-200 text-amber-900 px-2 py-1 rounded text-xs">{g.name}</span>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleShare} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Share</button>
            <button onClick={() => handleExport('PDF')} className="px-3 py-1 rounded bg-green-600 text-white text-sm">Export as PDF</button>
            <button onClick={() => handleExport('CSV')} className="px-3 py-1 rounded bg-yellow-600 text-white text-sm">Export as CSV</button>
          </div>
          {/* Watch Providers */}
          {providers.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-white mb-1">Available On:</h4>
              <div className="flex flex-wrap gap-2">
                {providers.map((prov, idx) => (
                  <span key={idx} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                    {prov.logo_path && <img src={`https://image.tmdb.org/t/p/w45${prov.logo_path}`} alt={prov.provider_name} className="w-5 h-5 inline" />} {prov.provider_name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Trailer */}
      {trailer && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-2">Trailer</h3>
          <div className="aspect-w-16 aspect-h-9 w-full max-w-2xl mx-auto">
            <iframe
              src={trailer}
              title="Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-64 rounded-lg"
            ></iframe>
          </div>
        </div>
      )}
      {/* Cast Section */}
      {details.credits?.cast?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-2">Cast</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-600">
            {details.credits.cast.slice(0, 15).map(actor => (
              <div key={actor.cast_id || actor.credit_id} className="flex flex-col items-center min-w-[80px] max-w-[100px]">
                <img
                  src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '/src/assets/poster.png'}
                  alt={actor.name}
                  className="w-16 h-16 rounded-full object-cover shadow-md mb-1 border-2 border-amber-400"
                />
                <span className="text-xs text-white text-center truncate w-full">{actor.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails; 