import React from 'react';

const PreferenceChart = ({ preferences, genreMap }) => {
  if (!preferences || Object.keys(preferences).length === 0) {
    return null;
  }

  const topGenres = Object.entries(preferences.genres || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topActors = Object.entries(preferences.actors || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topYears = Object.entries(preferences.years || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const maxGenreCount = Math.max(...topGenres.map(([, count]) => count));
  const maxActorCount = Math.max(...topActors.map(([, count]) => count));
  const maxYearCount = Math.max(...topYears.map(([, count]) => count));

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-amber-50 mb-4">Detailed Preference Analysis</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Genre Preferences */}
        <div>
          <h4 className="text-md font-semibold text-white mb-3">Top Genres</h4>
          <div className="space-y-2">
            {topGenres.map(([id, count]) => (
              <div key={id} className="flex items-center gap-2">
                <div className="w-24 text-sm text-white truncate">
                  {genreMap[id] || `Genre ${id}`}
                </div>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(count / maxGenreCount) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-300 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actor Preferences */}
        <div>
          <h4 className="text-md font-semibold text-white mb-3">Favorite Actors</h4>
          <div className="space-y-2">
            {topActors.map(([name, count]) => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-24 text-sm text-white truncate">
                  {name}
                </div>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(count / maxActorCount) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-300 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Year Preferences */}
        <div>
          <h4 className="text-md font-semibold text-white mb-3">Preferred Years</h4>
          <div className="space-y-2">
            {topYears.map(([year, count]) => (
              <div key={year} className="flex items-center gap-2">
                <div className="w-16 text-sm text-white">
                  {year}
                </div>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(count / maxYearCount) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-300 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-amber-600/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-amber-400">{preferences.totalMovies || 0}</div>
            <div className="text-xs text-gray-300">Total Movies</div>
          </div>
          <div className="bg-blue-600/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-400">{preferences.watchedMovies || 0}</div>
            <div className="text-xs text-gray-300">Watched</div>
          </div>
          <div className="bg-green-600/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">
              {preferences.averageRating ? preferences.averageRating.toFixed(1) : 'N/A'}
            </div>
            <div className="text-xs text-gray-300">Avg Rating</div>
          </div>
          <div className="bg-purple-600/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-400">
              {preferences.ratings ? preferences.ratings.length : 0}
            </div>
            <div className="text-xs text-gray-300">Rated Movies</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceChart; 