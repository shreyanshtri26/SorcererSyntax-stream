import React, { Suspense, forwardRef } from 'react';
import { motion } from 'framer-motion';
import MusicHub from '../contexts/MusicHub';

const MusicPage = forwardRef(({ currentTheme }, ref) => {
    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
    };

    return (
        <motion.div
            className="music-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Suspense fallback={<div className="loading-text">Loading Music Hub...</div>}>
                <MusicHub
                    currentTheme={currentTheme}
                    ref={ref}
                />
            </Suspense>
        </motion.div>
    );
});

export default MusicPage;
