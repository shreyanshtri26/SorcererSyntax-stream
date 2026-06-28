import React from 'react';

const CategoryFilterPills = ({ categories, selectedCategory, onSelectCategory }) => {
  if (!categories || categories.length === 0) return null;
  return (
    <div className="inline-filter-pills">
      {categories.map(cat => (
        <button
          key={cat}
          className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat)}
        >
          {cat === 'all' ? '⭐ All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilterPills;
