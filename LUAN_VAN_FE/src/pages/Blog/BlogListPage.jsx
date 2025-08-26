import React, { useState, useEffect } from "react";
import BlogCard from "../../components/blog/BlogCard";
import BlogFilter from "../../components/blog/BlogFilter";
import BlogPagination from "../../components/blog/BlogPagination";
import BlogCategoryTabs from "../../components/blog/BlogCategoryTabs";

const dummyBlogs = [...Array(10)].map((_, i) => ({
  id: i + 1,
  title: `Blog tiêu đề ${i + 1}`,
  thumbnail:
    "https://www.galaxycine.vn/media/2025/1/13/top-phim-dang-ra-rap-nhat-2025--phan-1-8_1736752027012.jpg",
  description: "Đây là mô tả ngắn cho bài viết blog.",
}));

const categories = ["Tất cả", "Review", "Tin tức", "Trailer"];

const BlogListPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;

  const filteredBlogs =
    selectedCategory === "Tất cả"
      ? dummyBlogs
      : dummyBlogs.filter((blog) => blog.category === selectedCategory);

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tin tức phim</h1>
      <BlogCategoryTabs
        categories={categories}
        active={selectedCategory}
        onChange={setSelectedCategory}
      />
      <div className="grid md:grid-cols-3 gap-6">
        {paginatedBlogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
      <BlogPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default BlogListPage;
