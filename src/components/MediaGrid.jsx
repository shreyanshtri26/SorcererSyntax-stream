import React, { useState, useEffect, useRef } from 'react';
import MediaItem from './MediaItem';

const MediaGrid = ({ items = [], type, onMediaClick, currentTheme = 'devil', fillCompleteRows = true }) => {
    const gridRef = useRef(null);
    const [columnCount, setColumnCount] = useState(0);

    useEffect(() => {
        if (!fillCompleteRows) return;

        const updateCols = () => {
            if (!gridRef.current) return;
            const gridComputed = window.getComputedStyle(gridRef.current);
            const gridTemplateColumns = gridComputed.getPropertyValue('grid-template-columns');
            if (gridTemplateColumns) {
                const cols = gridTemplateColumns.trim().split(/\s+/).length;
                if (cols > 0 && cols !== columnCount) {
                    setColumnCount(cols);
                }
            }
        };

        updateCols();

        const observer = new ResizeObserver(() => {
            updateCols();
        });

        if (gridRef.current) {
            observer.observe(gridRef.current);
        }

        window.addEventListener('resize', updateCols);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateCols);
        };
    }, [fillCompleteRows, columnCount, items.length]);

    // APIs occasionally repeat a title within a page; drop repeats so keys stay unique
    let displayItems = items.filter((item, i, arr) => arr.findIndex(o => o.id === item.id) === i);
    // When fillCompleteRows is true, slice items to a multiple of columns so all rows are completely filled
    if (fillCompleteRows && columnCount > 1 && displayItems.length > columnCount) {
        const fullRowsCount = Math.floor(displayItems.length / columnCount) * columnCount;
        if (fullRowsCount >= columnCount) {
            displayItems = displayItems.slice(0, fullRowsCount);
        }
    }

    return (
        <div className="media-grid" ref={gridRef}>
            {displayItems.length > 0 ? (
                displayItems.map(item => (
                    <MediaItem
                        key={item.id}
                        item={item}
                        type={type}
                        onClick={onMediaClick}
                        currentTheme={currentTheme}
                    />
                ))
            ) : (
                <p className="no-results-message">No results found. Try adjusting your search criteria.</p>
            )}
        </div>
    );
};

export default MediaGrid;

