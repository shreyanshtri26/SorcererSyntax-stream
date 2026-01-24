import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPageButtons = 5; // Max number buttons shown (e.g., 1 ... 4 5 6 ... 10)

    // Always show Previous button
    pageNumbers.push({ type: 'prev', number: currentPage - 1, disabled: currentPage === 1 });

    if (totalPages <= maxPageButtons) {
        // Show all page numbers if total pages are few
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push({ type: 'page', number: i });
        }
    } else {
        // Logic for many pages with ellipses
        const leftEllipsisThreshold = 3; // Show ellipsis if current page is > 3
        const rightEllipsisThreshold = totalPages - 2; // Show ellipsis if current page is < Total - 2

        // Always show page 1
        pageNumbers.push({ type: 'page', number: 1 });

        // Show left ellipsis if needed
        if (currentPage > leftEllipsisThreshold + 1) {
            pageNumbers.push({ type: 'ellipsis' });
        }

        // Determine middle page numbers
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        // Adjust range if near the beginning
        if (currentPage <= leftEllipsisThreshold) {
            startPage = 2;
            endPage = Math.min(maxPageButtons - 1, totalPages - 1); // e.g. show 2, 3, 4
        }
        // Adjust range if near the end
        else if (currentPage >= rightEllipsisThreshold) {
            startPage = Math.max(2, totalPages - (maxPageButtons - 2)); // e.g. show 110, 111
            endPage = totalPages - 1;
        }

        // Add the middle page numbers
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push({ type: 'page', number: i });
        }

        // Show right ellipsis if needed
        if (currentPage < rightEllipsisThreshold - 1) {
            pageNumbers.push({ type: 'ellipsis' });
        }

        // Always show last page
        pageNumbers.push({ type: 'page', number: totalPages });
    }

    // Always show Next button
    pageNumbers.push({ type: 'next', number: currentPage + 1, disabled: currentPage === totalPages });

    return (
        <nav className="pagination-nav">
            <ul className="pagination">
                {pageNumbers.map((item, index) => (
                    <li key={index} className={`page-item ${item.number === currentPage && item.type === 'page' ? 'active' : ''} ${item.disabled ? 'disabled' : ''} ${item.type === 'ellipsis' ? 'ellipsis disabled' : ''}`}>
                        {item.type === 'prev' && (
                            <button className="page-link" onClick={() => onPageChange(item.number)} disabled={item.disabled}>
                                &laquo; Prev
                            </button>
                        )}
                        {item.type === 'next' && (
                            <button className="page-link" onClick={() => onPageChange(item.number)} disabled={item.disabled}>
                                Next &raquo;
                            </button>
                        )}
                        {item.type === 'ellipsis' && (
                            <span className="page-link">...</span>
                        )}
                        {item.type === 'page' && (
                            <button className="page-link" onClick={() => onPageChange(item.number)}>
                                {item.number}
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Pagination;
