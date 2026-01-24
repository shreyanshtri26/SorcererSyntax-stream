import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    getTrendingMovies,
    getTrendingTVShows,
    getTopRatedMovies,
    getTopRatedTVShows
} from '../api/api';
import { MediaGridSkeleton } from '../components/SkeletonLoader';

// We need to impart the MediaGrid component or move it to a shared file. 
// For now, assuming MediaGrid is still in App.jsx or needs to be shared.
// Ideally, MediaGrid should be its own component. 
// I will create a temporary internal version if I can't move it yet, 
// BUT the plan says "Refactor App.jsx structure". 
// To avoid "MediaGrid is not defined", I should probably extract MediaGrid to a file first 
// OR define it here if it's small.
// Looking at App.jsx, MediaGrid is small, but MediaItem is large.
// I will import them from App or (better) move them to components.
// For this step, I will ASSUME I can move MediaGrid and MediaItem to a separate file 
// OR simpler: I'll duplicate the logic for a "Strict UI Preservation" 
// and then clean up. 
// UNLESS I move MediaGrid/Item to `src/components` first. 
// That makes the most sense.

// Let's check if MediaGrid exists in components?
// Checked `src/components`, it has 14 children. 
// I'll assume I need to create `src/components/MediaGrid.jsx` and `src/components/MediaItem.jsx` 
// to properly share them between pages.

// WAIT. The plan said "extract major sections". 
// If I leave MediaGrid in App.jsx, I can't import it easily here without circular depends if App imports HomePage.

// REVISED PLAN FOR THIS STEP: 
// 1. Create `src/components/MediaItem.jsx` (extracted from App.jsx)
// 2. Create `src/components/MediaGrid.jsx` (extracted from App.jsx)
// 3. Then create HomePage.jsx using those.

import MediaGrid from '../components/MediaGrid';

const HomePage = ({ onMediaClick, getSectionTitle }) => {
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [trendingTV, setTrendingTV] = useState([]);
    const [topMovies, setTopMovies] = useState([]);
    const [topTV, setTopTV] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
                    getTrendingMovies(),
                    getTrendingTVShows(),
                    getTopRatedMovies(),
                    getTopRatedTVShows()
                ]);
                setTrendingMovies(trendMovies || []);
                setTrendingTV(trendTV || []);
                setTopMovies(topRatedMovies || []);
                setTopTV(topRatedTV || []);
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

    return (
        <motion.div
            className="home-page"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {isLoading ? (
                <>
                    <div id="trending-movies">
                        <h2 className="section-title">{getSectionTitle("Trending Movies")}</h2>
                        <MediaGridSkeleton count={20} />
                    </div>
                    <div id="trending-tv">
                        <h2 className="section-title">{getSectionTitle("Trending TV Shows")}</h2>
                        <MediaGridSkeleton count={20} />
                    </div>
                </>
            ) : (
                <>
                    <div id="trending-movies">
                        <h2 className="section-title">{getSectionTitle("Trending Movies")}</h2>
                        <MediaGrid
                            items={trendingMovies}
                            type="movie"
                            onMediaClick={onMediaClick}
                        />
                    </div>

                    <div id="trending-tv">
                        <h2 className="section-title">{getSectionTitle("Trending TV Shows")}</h2>
                        <MediaGrid
                            items={trendingTV}
                            type="tv"
                            onMediaClick={onMediaClick}
                        />
                    </div>

                    <div id="top-movies">
                        <h2 className="section-title">{getSectionTitle("Top Rated Movies")}</h2>
                        <MediaGrid
                            items={topMovies}
                            type="movie"
                            onMediaClick={onMediaClick}
                        />
                    </div>

                    <div id="top-tv">
                        <h2 className="section-title">{getSectionTitle("Top Rated TV Shows")}</h2>
                        <MediaGrid
                            items={topTV}
                            type="tv"
                            onMediaClick={onMediaClick}
                        />
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default HomePage;
