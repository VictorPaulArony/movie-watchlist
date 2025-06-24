# Movie Watchlist Application

A modern React-based movie watchlist application with advanced recommendation engine capabilities.

## Features

### 🎬 **Movie & TV Show Discovery**
- Search for movies and TV shows using TMDB API
- Browse popular content with detailed information
- Real-time search with debounced input
- Support for both movies and TV shows

### 🎭 **Genre-Based Filtering & Category Browsing**
- **Genre Filtering**: Filter movies and TV shows by specific genres
- **Category Browsing**: Browse content by categories like Popular, Top Rated, Upcoming, etc.
- **Dynamic Content**: Different categories for movies (Upcoming, Now Playing) and TV shows (On The Air, Airing Today)
- **Interactive UI**: Visual genre and category buttons with smooth transitions
- **Smart Filtering**: Automatically clears search when filters are applied

### 📋 **Watchlist Management**
- Add movies to personal watchlist
- Mark movies as watched/unwatched
- Remove movies from watchlist
- Persistent storage using localStorage

### 🧠 **AI-Powered Recommendation Engine**
- **Personalized Recommendations**: Get movie suggestions based on your watchlist preferences
- **Multi-Strategy Algorithm**: Uses genre, actor, year, and similar movie analysis
- **Preference Analysis**: Visual charts showing your movie preferences
- **Scoring System**: Each recommendation gets a personalized score
- **Real-time Updates**: Recommendations refresh as your watchlist changes

### 📊 **Advanced Analytics**
- Genre preference analysis
- Actor popularity tracking
- Year preference distribution
- Rating pattern analysis
- Interactive preference charts

### 🎨 **Modern UI/UX**
- Responsive design with Tailwind CSS
- Dark theme with amber accents
- Smooth animations and transitions
- Mobile-friendly interface

## Genre & Category Features

The application now includes comprehensive filtering and browsing capabilities:

### **Genre Filtering**
- **Movie Genres**: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, Horror, Mystery, Romance, Sci-Fi, Thriller, War, Western
- **TV Show Genres**: Action & Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Kids, Mystery, News, Reality, Sci-Fi & Fantasy, Soap, Talk, War & Politics, Western
- **Visual Feedback**: Selected genres are highlighted with amber color and scale effect
- **Easy Clearing**: One-click option to clear genre filters

### **Category Browsing**
- **Movies**: Popular, Top Rated, Upcoming, Now Playing, Trending
- **TV Shows**: Popular, Top Rated, On The Air, Airing Today, Trending
- **Icons**: Each category has a distinctive emoji icon for easy recognition
- **Smart Categories**: Different categories available based on content type (movie vs TV show)

### **Filter Interaction**
- **Mutual Exclusion**: Genre and category filters work independently (selecting one clears the other)
- **Search Integration**: Filters automatically clear search terms for better UX
- **Dynamic Headers**: Page headers update to show current filter/category selection
- **Responsive Design**: All filter components work seamlessly on mobile and desktop

## Recommendation Engine Features

The application includes a sophisticated recommendation engine that:

- **Analyzes your watchlist** to understand your preferences
- **Uses multiple strategies** for finding relevant movies
- **Provides visual insights** into your movie taste
- **Scores recommendations** based on your preferences
- **Updates in real-time** as you modify your watchlist

For detailed information about the recommendation engine, see [RECOMMENDATION_ENGINE.md](./RECOMMENDATION_ENGINE.md).

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- TMDB API key
- OMDb API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd movie-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_OMDB_API_KEY=your_omdb_api_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## API Keys

### TMDB API
1. Go to [TMDB](https://www.themoviedb.org/)
2. Create an account and request an API key
3. Add the API key to your `.env` file

### OMDb API
1. Go to [OMDb API](http://www.omdbapi.com/)
2. Request a free API key
3. Add the API key to your `.env` file

## Usage

1. **Browse Movies/TV Shows**: Use the Movies and TV Shows tabs to discover content
2. **Filter by Genre**: Use the genre filter buttons to browse content by specific genres
3. **Browse by Category**: Use category buttons to explore Popular, Top Rated, Upcoming content, etc.
4. **Search**: Use the search bar to find specific movies or shows
5. **Add to Watchlist**: Click the "Add to Watchlist" button on any movie card
6. **Manage Watchlist**: Go to "My Watchlist" to manage your saved movies
7. **Get Recommendations**: Visit the "Recommendations" tab for personalized suggestions

## Technology Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **APIs**: TMDB API, OMDb API
- **State Management**: React Hooks
- **Icons**: React Icons
- **Utilities**: React Use

## Project Structure

```
src/
├── Components/
│   ├── MovieCard.jsx          # Movie display component
│   ├── Search.jsx             # Search functionality
│   ├── Watchlist.jsx          # Watchlist management
│   ├── RecommendationEngine.jsx # AI recommendation system
│   ├── PreferenceChart.jsx    # Preference visualization
│   ├── GenreFilter.jsx        # Genre-based filtering
│   ├── CategoryBrowser.jsx    # Category browsing
│   └── Spinner.jsx            # Loading component
├── App.jsx                    # Main application component
├── appwrite.jsx              # API integration
└── main.jsx                  # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for movie data
- [OMDb API](http://www.omdbapi.com/) for additional movie information
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
