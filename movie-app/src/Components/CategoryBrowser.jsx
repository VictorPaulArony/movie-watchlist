import React from 'react';

const CategoryBrowser = ({ searchType, onCategoryChange, selectedCategory }) => {
  const movieCategories = [
    { id: 'popular', name: 'Popular', icon: '🔥' },
    { id: 'top_rated', name: 'Top Rated', icon: '⭐' },
    { id: 'upcoming', name: 'Upcoming', icon: '📅' },
    { id: 'now_playing', name: 'Now Playing', icon: '🎬' },
    { id: 'trending', name: 'Trending', icon: '📈' }
  ];

  const tvCategories = [
    { id: 'popular', name: 'Popular', icon: '🔥' },
    { id: 'top_rated', name: 'Top Rated', icon: '⭐' },
    { id: 'on_the_air', name: 'On The Air', icon: '📺' },
    { id: 'airing_today', name: 'Airing Today', icon: '📅' },
    { id: 'trending', name: 'Trending', icon: '📈' }
  ];

  const categories = searchType === 'movie' ? movieCategories : tvCategories;

  const handleCategoryClick = (category) => {
    onCategoryChange(category);
  };

  const clearCategory = () => {
    onCategoryChange(null);
  };

  return (
    <div className="category-browser-container mb-6">
      <div className="flex flex-wrap items-center gap-3 justify-center">
        <span className="text-white font-semibold text-lg">Browse by Category:</span>
        
        {/* Clear Category Button */}
        <button
          onClick={clearCategory}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            selectedCategory === null
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
          }`}
        >
          All {searchType === 'movie' ? 'Movies' : 'TV Shows'}
        </button>

        {/* Category Buttons */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedCategory?.id === category.id
                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:scale-105'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Selected Category Display */}
      {selectedCategory && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 backdrop-blur-sm border border-blue-600/30 rounded-lg px-4 py-2">
            <span className="text-blue-400 font-semibold">
              Currently viewing: {selectedCategory.name} {searchType === 'movie' ? 'Movies' : 'TV Shows'}
            </span>
            <button
              onClick={clearCategory}
              className="text-blue-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryBrowser; 