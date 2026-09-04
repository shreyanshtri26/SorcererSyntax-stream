import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    getTrendingMoviesMulti,
    getTrendingTVShowsMulti,
    getTopRatedMoviesMulti,
    getTopRatedTVShowsMulti
} from '../api/api';
import { MediaGridSkeleton } from '../components/SkeletonLoader';
import MediaGrid from '../components/MediaGrid';
import HeroBillboard from '../components/HeroBillboard';
import useWatchlist from '../hooks/useWatchlist';

const HomePage = ({ onMediaClick, getSectionTitle, currentTheme = 'devil' }) => {
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [trendingTV, setTrendingTV] = useState([]);
    const [topMovies, setTopMovies] = useState([]);
    const [topTV, setTopTV] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { watchlist } = useWatchlist();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [
                    trendMovies,
                    trendTV,
                    topRatedMovies,
                    topRatedTV
                ] = await Promise.all([
                    getTrendingMoviesMulti(2),
                    getTrendingTVShowsMulti(2),
                    getTopRatedMoviesMulti(2),
                    getTopRatedTVShowsMulti(2)
                ]);
                setTrendingMovies((trendMovies || []).slice(0, 30));
                setTrendingTV((trendTV || []).slice(0, 30));
                setTopMovies((topRatedMovies || []).slice(0, 30));
                setTopTV((topRatedTV || []).slice(0, 30));
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };

    // Combine top trending items for the spotlight billboard
    const spotlightItems = trendingMovies.length > 0 
        ? [...trendingMovies.slice(0, 4), ...trendingTV.slice(0, 3)] 
        : [];

    return (
        <motion.div
            className="home-page"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {/* Ultra-Premium Hero Spotlight Billboard */}
            {!isLoading && spotlightItems.length > 0 && (
                <HeroBillboard
                    items={spotlightItems}
                    onMediaClick={onMediaClick}
                    currentTheme={currentTheme}
                />
            )}

            {/* User's Personal Watchlist (VIP Collection) */}
            {watchlist && watchlist.length > 0 && (
                <div id="user-watchlist-section" className="home-section-container">
                    <div className="section-header-row">
                        <h2 className="section-title">
                            <span className="section-title-icon">⭐</span>
                            My Watchlist <span className="section-count-badge">({watchlist.length})</span>
                        </h2>
                    </div>
                    <MediaGrid
                        items={watchlist}
                        type="movie"
                        onMediaClick={onMediaClick}
                        currentTheme={currentTheme}
                    />
                </div>
            )}

            {isLoading ? (
                <>
                    <div id="trending-movies" className="home-section-container">
                        <h2 className="section-title">{getSectionTitle("Trending Movies")}</h2>
                        <MediaGridSkeleton count={24} />
                    </div>
                    <div id="trending-tv" className="home-section-container">
                        <h2 className="section-title">{getSectionTitle("Trending TV Shows")}</h2>
                        <MediaGridSkeleton count={24} />
                    </div>
                </>
            ) : (
                <>
                    <div id="trending-movies" className="home-section-container">
                        <div className="section-header-row">
                            <h2 className="section-title">
                                <span className="section-title-icon">🎬</span>
                                {getSectionTitle("Trending Movies")}
                            </h2>
                        </div>
                        <MediaGrid
                            items={trendingMovies}
                            type="movie"
                            onMediaClick={onMediaClick}
                            currentTheme={currentTheme}
                        />
                    </div>

                    <div id="trending-tv" className="home-section-container">
                        <div className="section-header-row">
                            <h2 className="section-title">
                                <span className="section-title-icon">📺</span>
                                {getSectionTitle("Trending TV Shows")}
                            </h2>
                        </div>
                        <MediaGrid
                            items={trendingTV}
                            type="tv"
                            onMediaClick={onMediaClick}
                            currentTheme={currentTheme}
                        />
                    </div>

                    <div id="top-movies" className="home-section-container">
                        <div className="section-header-row">
                            <h2 className="section-title">
                                <span className="section-title-icon">🏆</span>
                                {getSectionTitle("Top Rated Movies")}
                            </h2>
                        </div>
                        <MediaGrid
                            items={topMovies}
                            type="movie"
                            onMediaClick={onMediaClick}
                            currentTheme={currentTheme}
                        />
                    </div>

                    <div id="top-tv" className="home-section-container">
                        <div className="section-header-row">
                            <h2 className="section-title">
                                <span className="section-title-icon">💎</span>
                                {getSectionTitle("Top Rated TV Shows")}
                            </h2>
                        </div>
                        <MediaGrid
                            items={topTV}
                            type="tv"
                            onMediaClick={onMediaClick}
                            currentTheme={currentTheme}
                        />
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default HomePage;
