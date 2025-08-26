import React from "react";

const BlogFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex gap-4 flex-warp mb-6">
      {categories.map((category) => (
        <button
          key={category}
          className={`px-4 py-2 rounded-full border transition ${
            selectedCategory === category
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default BlogFilter;
