import React from "react";

const MovieRevenueTable = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Doanh thu theo phim</h3>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-4 ">Tên phim</th>
            <th className="py-4">Tổng vé bán ra</th>
            <th className="py-4">Tổng doanh thu</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((movie, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-blue-600 font-medium">
                  {movie.name}
                </td>
                <td className="px-4 py-2">{movie.sold}</td>
                <td className="px-4 py-2">
                  {movie.revenue.toLocaleString("vi-VN")}₫
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
                Không có dữ liệu phim nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MovieRevenueTable;
