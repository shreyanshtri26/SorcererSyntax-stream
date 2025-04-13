# SorcererSyntax - Movie & TV Streaming App

A modern, feature-rich movie and TV show streaming application built with React and Vite that leverages the TMDB API for data. The app offers an immersive browsing experience with trailer previews, content streaming, themed UI, and advanced filtering options.

![SorcererSyntax App](screenshot.png)

## Features

- **Comprehensive Media Library**: Browse trending and top-rated movies and TV shows.
- **Advanced Search**: Find content by title (movies, TV, people) with theme-integrated instant results.
- **Powerful Filtering**: Filter content by genres, ratings, and languages with a redesigned UI.
- **Trailer Integration**: Watch trailers directly within the app interface via hover previews or modals.
- **Content Streaming**: Stream full movies and TV episodes with season/episode selection (if applicable).
- **Alternative Sources**: Automatic fallback to alternative streaming sources if primary fails.
- **Responsive Design**: Works seamlessly across desktop and mobile devices.
- **Multiple Themes**: Switch between "Devil", "Angel", and "Hannibal" visual themes, each with unique styling.
- **Person Details**: View details about actors/actresses, including their known works.

## Technology Stack

- **React**: UI library for building the interface
- **Vite**: Fast and modern build tool
- **TMDB API**: Source for movie, TV show, and person data
- **React Router**: For application routing
- **Framer Motion**: For animations
- **CSS**: Extensive custom styling for themes and UI elements

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
   *Note:* This project may require Node.js v20.0.0 or higher due to dependencies like `react-router` v7+. Check your Node version with `node -v`.

3. Create a `.env` file in the project root with your TMDB API key:
   ```
   VITE_API_KEY=your_tmdb_api_key
   ```
   *(Note the variable name `VITE_API_KEY`)*

4. Start the development server:
   ```
   npm run dev
   ```

## Usage

- **Browse Content**: Scroll through trending and top-rated sections on the homepage.
- **Search**: Use the search bar for movies, TV shows, or people. Results appear instantly below.
- **Filter Content**: Click the filter icon to open the advanced filtering options.
- **Watch Previews/Trailers**: Hover over media cards for video previews (if available) or click the "Trailer" button in the hover overlay.
- **View Details**: Click on any content card (or search result) to open a modal with details, streaming options, or person information.
- **Theme Toggle**: Switch between themes using the icons in the header.

## API Configuration

This application requires a TMDB API key to function. Get your API key by:

1. Creating an account at [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Going to your account settings and selecting the API section
3. Requesting an API key for developer use

## Acknowledgments

- Movie and TV show data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/)
- This application is for educational purposes only

