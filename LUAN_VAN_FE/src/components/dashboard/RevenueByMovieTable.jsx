import React from "react";

const RevenueByMovieTable = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Doanh thu theo phim</h3>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2">Tên phim</th>
            <th className="py-2">Tổng vé bán</th>
            <th className="py-2">Tổng doanh thu</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50">
              <td className="py-2 text-blue-600 cursor-pointer hover:underline">
                {item.name}
              </td>
              <td className="py-2">{item.tickets}</td>
              <td className="py-2">{item.revenue.toLocaleString()}₫</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RevenueByMovieTable;
