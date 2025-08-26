import React from "react";

const BlogCategoryTabs = ({ categories, active, onChange }) => {
  return (
    <div className="flex space-x-4 overflow-x-auto mb-6 border-b pb-2">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`pb-1 border-b-2 ${
            cat === active
              ? "border-blue-500 text-blue-600 font-semibold"
              : "border-transparent text-gray-600"
          }`}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default BlogCategoryTabs;
