import React from "react";
import { Link } from "react-router-dom";

const BlogCard = ({ blog }) => {
  return (
    <div className="bg-white shadow rounded overflow-hidden">
      <img
        src={blog.thumbnail}
        alt={blog.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3">{blog.description}</p>
        <div className="mt-2 text-right">
          <Link
            to={`/blog/${blog.id}`}
            className="text-blue-500 hover:underline"
          >
            Đọc thêm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
