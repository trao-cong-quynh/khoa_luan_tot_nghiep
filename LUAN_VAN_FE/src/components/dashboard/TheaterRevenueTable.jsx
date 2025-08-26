import React from "react";

const TheaterRevenueTable = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Doanh thu theo rạp</h3>
      <table className="w-full text-left border-collapse">
        <thead className="">
          <tr className="border-b">
            <th className="px-4 py-2 font-semibold">Rạp chiếu</th>
            <th className="px-4 py-2 font-semibold">Tổng vé bán ra</th>
            <th className="px-4 py-2 font-semibold">Tổng doanh thu</th>
          </tr>
        </thead>
        <tbody>
          {data.map((theater, index) => (
            <tr key={index} className="border-t hover:bg-gray-50 bg-white">
              <td className="px-4 py-2 text-blue-600 font-medium">
                {theater.name}
              </td>
              <td className="px-4 py-2">{theater.sold}</td>
              <td className="px-4 py-2">
                {theater.revenue.toLocaleString("vi-VN")}₫
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TheaterRevenueTable;
