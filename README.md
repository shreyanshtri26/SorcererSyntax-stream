# Room 305 - Movie & TV Streaming App

A modern, feature-rich movie and TV show streaming application built with React and Vite that leverages the TMDB API for data. The app offers an immersive browsing experience with trailer previews, content streaming, and advanced filtering options.

![Room 305 App](screenshot.png)

## Features

- **Comprehensive Media Library**: Browse trending and top-rated movies and TV shows.
- **Advanced Search**: Find content by title, with immediate results.
- **Powerful Filtering**: Filter content by genres, ratings, and languages.
- **Trailer Integration**: Watch trailers directly within the app interface.
- **Content Streaming**: Stream full movies and TV episodes with season/episode selection.
- **Alternative Sources**: Automatic fallback to alternative streaming sources if primary fails.
- **Responsive Design**: Works seamlessly across desktop and mobile devices.
- **Dual Themes**: Toggle between "Fire Devil" and "Black & White" visual modes.

## Technology Stack

- **React**: UI library for building the interface
- **Vite**: Fast and modern build tool
- **TMDB API**: Source for movie and TV show data
- **React Router**: For application routing
- **React Player**: YouTube integration for trailers

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/shreyanshtri26/SorcererSyntax-stream.git
   cd SorcererSyntax-stream
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the project root with your TMDB API key:
   ```
   VITE_TMDB_API_KEY=your_tmdb_api_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Usage

- **Browse Content**: Scroll through trending and top-rated sections on the homepage.
- **Search**: Use the search bar to find specific movies or TV shows.
- **Filter Content**: Click the filter icon to refine results by genre, rating, or language.
- **Watch Trailers**: Click the "Trailer" button on any content card to watch its trailer.
- **Stream Content**: Click on any content card to open the player for full content streaming.
- **TV Show Navigation**: Select seasons and episodes using the dropdown menus when watching TV shows.
- **Theme Toggle**: Switch between themes using the toggle button in the top-right corner.

## API Configuration

This application requires a TMDB API key to function. Get your API key by:

1. Creating an account at [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Going to your account settings and selecting the API section
3. Requesting an API key for developer use

## Acknowledgments

- Movie and TV show data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/)
- This application is for educational purposes only

