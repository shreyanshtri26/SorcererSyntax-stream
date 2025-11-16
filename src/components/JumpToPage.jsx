import React, { useState } from 'react';
import './JumpToPage.css';

const JumpToPage = ({ currentPage, totalPages, onPageChange, currentTheme = 'devil' }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(inputValue, 10);

    if (isNaN(pageNum)) {
      setError('Please enter a valid number');
      return;
    }

    if (pageNum < 1 || pageNum > totalPages) {
      setError(`Page must be between 1 and ${totalPages}`);
      return;
    }

    setError('');
    setInputValue('');
    onPageChange(pageNum);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setError('');
  };

  return (
    <div className={`jump-to-page theme-${currentTheme}`}>
      <form onSubmit={handleSubmit} className="jump-form">
        <label htmlFor="page-jump-input" className="jump-label">
          Jump to page:
        </label>
        <input
          id="page-jump-input"
          type="number"
          min="1"
          max={totalPages}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={`1-${totalPages}`}
          className="jump-input"
          aria-label="Jump to page number"
        />
        <button 
          type="submit" 
          className="jump-button"
          aria-label="Go to page"
        >
          Go
        </button>
      </form>
      {error && <div className="jump-error" role="alert">{error}</div>}
    </div>
  );
};

export default JumpToPage;
