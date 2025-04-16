# Room 305 - Movie & TV Streaming App

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://305.windsurf.build)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-online-blue)](https://305.windsurf.build)

A modern, feature-rich movie and TV show streaming application built with React and Vite. The app offers an immersive browsing experience with trailer previews, content streaming, and advanced filtering options. Powered by the TMDB API.

![Room 305 App](https://github.com/user-attachments/assets/735db41e-6337-453e-b99b-29b538e74387)


---

## 🚀 Live Demo

Try it now: [https://305.windsurf.build](https://305.windsurf.build)

---

## ✨ Features

- **Comprehensive Media Library**: Browse trending and top-rated movies and TV shows.
- **Advanced Search**: Find content by title, with immediate results.
- **Powerful Filtering**: Filter content by genres, ratings, and languages.
- **Trailer Integration**: Watch trailers directly within the app interface.
- **Content Streaming**: Stream full movies and TV episodes with season/episode selection.
- **Alternative Sources**: Automatic fallback to alternative streaming sources if primary fails.
- **Responsive Design**: Works seamlessly across desktop and mobile devices.
- **Dual Themes**: Toggle between "Fire Devil" and "Black & White" visual modes.

---

## 🛠️ Technology Stack

- **React**: UI library for building the interface
- **Vite**: Fast and modern build tool
- **TMDB API**: Source for movie and TV show data
- **React Router**: For application routing
- **React Player**: YouTube integration for trailers

---

## ⚡ Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shreyanshtri26/SorcererSyntax-stream.git
   cd SorcererSyntax-stream
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a `.env` file in the project root with your TMDB API key:**
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment

The app is production-ready and can be deployed on Netlify, Vercel, Railway, or any static hosting provider.

- **Netlify:**
  - Connect your repo and set the build command to `npm run build`, publish directory to `dist`.
- **Vercel:**
  - Import the project, set up environment variables, and deploy.
- **Railway:**
  - Use `railway link` and `railway up` for deployment.
- **Manual:**
  - Run `npm run build` and deploy the `dist` folder to your static host.

The latest deployment is available at: [https://305.windsurf.build](https://305.windsurf.build)

---

## 📚 Usage

- **Browse Content**: Scroll through trending and top-rated sections on the homepage.
- **Search**: Use the search bar to find specific movies or TV shows.
- **Filter Content**: Click the filter icon to refine results by genre, rating, or language.
- **Watch Trailers**: Click the "Trailer" button on any content card to watch its trailer.
- **Stream Content**: Click on any content card to open the player for full content streaming.
- **TV Show Navigation**: Select seasons and episodes using the dropdown menus when watching TV shows.
- **Theme Toggle**: Switch between themes using the toggle button in the top-right corner.

---

## 🔑 API Configuration

This application requires a TMDB API key to function. Get your API key by:

1. Creating an account at [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Going to your account settings and selecting the API section
3. Requesting an API key for developer use

Add it to your `.env` file as shown above.

---

## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

---

## 🛟 FAQ & Troubleshooting

- **Q: The app doesn't load data?**
  - A: Ensure your TMDB API key is valid and present in `.env`.
- **Q: Build fails on deploy?**
  - A: Check your environment variables and Node.js version (`.node-version` file included).
- **Q: How do I change the theme?**
  - A: Use the toggle button in the top-right corner of the app.

For more help, open an issue in this repository.

---

## 📬 Contact

- **Author:** Shreyansh Tripathi
- **GitHub:** [shreyanshtri26](https://github.com/shreyanshtri26)
- **Demo:** [https://305.windsurf.build](https://305.windsurf.build)

---

## 📖 Acknowledgments

- Movie and TV show data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/)
- This application is for educational purposes only
