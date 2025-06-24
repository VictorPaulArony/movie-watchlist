# Movie Recommendation Engine

## Overview

The Movie Recommendation Engine is a sophisticated AI-powered system that analyzes user preferences from their watchlist and provides personalized movie recommendations. It uses multiple recommendation strategies and machine learning concepts to deliver highly relevant suggestions.

## Features

### 🎯 **Multi-Strategy Recommendation System**

The engine employs four different recommendation strategies:

1. **Genre-Based Recommendations**
   - Analyzes user's preferred genres from watchlist
   - Finds popular movies in those genres
   - Considers user's average rating preferences

2. **Actor-Based Recommendations**
   - Identifies favorite actors from watchlist
   - Searches for movies featuring those actors
   - Prioritizes highly-rated films

3. **Year-Based Recommendations**
   - Analyzes preferred release years
   - Finds movies from similar time periods
   - Maintains temporal consistency

4. **Similar Movie Recommendations**
   - Uses high-rated movies from watchlist as seeds
   - Finds similar movies using TMDB's similar movies API
   - Leverages collaborative filtering concepts

### 📊 **Advanced Preference Analysis**

The system analyzes multiple aspects of user preferences:

- **Genre Preferences**: Tracks which genres appear most in watchlist
- **Actor Preferences**: Identifies frequently appearing actors
- **Year Preferences**: Analyzes preferred release years
- **Rating Patterns**: Calculates average ratings and preferences
- **Watch History**: Tracks watched vs unwatched movies

### 🎨 **Visual Preference Charts**

Interactive charts showing:
- Genre preference bars with percentages
- Actor popularity rankings
- Year preference distribution
- Statistical summaries

### 🏆 **Scoring System**

Each recommendation gets a personalized score based on:
- Genre match (weight: 10x)
- Actor match (weight: 15x)
- Year preference (weight: 5x)
- Rating similarity (weight: 10x)

### 🔄 **Real-time Updates**

- Recommendations refresh automatically when watchlist changes
- Manual refresh button for immediate updates
- Live preference analysis updates

## Technical Implementation

### Data Sources

- **TMDB API**: Primary movie database
- **OMDb API**: Additional rating data (IMDb, Rotten Tomatoes)
- **Local Storage**: User watchlist and preferences

### Algorithms Used

1. **Content-Based Filtering**
   - Genre matching
   - Actor matching
   - Year-based filtering

2. **Collaborative Filtering**
   - Similar movies based on high-rated films
   - User preference clustering

3. **Hybrid Approach**
   - Combines multiple strategies
   - Weighted scoring system
   - Duplicate removal and ranking

### Performance Optimizations

- Cached genre mapping
- Efficient API calls with pagination
- Debounced preference analysis
- Lazy loading of movie details

## Usage

### For Users

1. **Add Movies to Watchlist**: Start by adding movies you like to your watchlist
2. **Mark as Watched**: Mark movies you've watched to improve recommendations
3. **Navigate to Recommendations**: Click the "Recommendations" tab
4. **View Analysis**: See detailed preference analysis and charts
5. **Get Recommendations**: Browse personalized movie suggestions
6. **Add to Watchlist**: Click to add recommended movies to your watchlist

### For Developers

The recommendation engine is modular and can be extended:

```javascript
// Add new recommendation strategies
const newStrategy = async (preferences) => {
  // Custom recommendation logic
  return recommendations;
};

// Customize scoring weights
const customScoring = (movie, preferences) => {
  // Custom scoring algorithm
  return score;
};
```

## API Integration

### Required Environment Variables

```env
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_OMDB_API_KEY=your_omdb_api_key
```

### API Endpoints Used

- `GET /discover/movie` - Genre and actor-based recommendations
- `GET /search/person` - Actor search
- `GET /movie/{id}/similar` - Similar movies
- `GET /genre/movie/list` - Genre mapping
- `GET /movie/{id}` - Movie details with credits

## Future Enhancements

### Planned Features

1. **Machine Learning Integration**
   - User behavior analysis
   - Predictive modeling
   - A/B testing for recommendations

2. **Advanced Filtering**
   - Director preferences
   - Language preferences
   - Runtime preferences

3. **Social Features**
   - Friend recommendations
   - Community ratings
   - Shared watchlists

4. **Personalization**
   - Mood-based recommendations
   - Time-of-day preferences
   - Seasonal recommendations

### Technical Improvements

1. **Performance**
   - Recommendation caching
   - Background processing
   - Progressive loading

2. **Accuracy**
   - More sophisticated scoring algorithms
   - User feedback integration
   - Continuous learning

## Contributing

To contribute to the recommendation engine:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This recommendation engine is part of the Movie Watchlist application and follows the same licensing terms. 