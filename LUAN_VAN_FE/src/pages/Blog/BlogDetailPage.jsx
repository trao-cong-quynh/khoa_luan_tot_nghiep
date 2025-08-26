import React from "react";
import { useParams } from "react-router-dom";

const BlogDetailPage = () => {
  const { id } = useParams();

  // Dummy detail (thay thế bằng API sau)
  const blog = {
    id,
    title: `Chi tiết Blog ${id}`,
    thumbnail:
      "https://www.galaxycine.vn/media/2025/1/13/top-phim-dang-ra-rap-nhat-2025--phan-1-8_1736752027012.jpg",
    content: `Nội dung chi tiết của bài viết blog ${id}... `,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <img
        src={blog.thumbnail}
        alt={blog.title}
        className="w-full mb-6 rounded"
      />
      <div className="prose max-w-none">
        <p>{blog.content}</p>
      </div>
    </div>
  );
};

export default BlogDetailPage;
