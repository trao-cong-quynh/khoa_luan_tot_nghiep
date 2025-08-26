import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const RevenueLineChart = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Doanh thu theo tháng</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#60a5fa" />
          {/* <Line
            type="monotone"
            dataKey="revenue"
            stroke="#ef4444"
            strokeWidth={2}
          /> */}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueLineChart;
