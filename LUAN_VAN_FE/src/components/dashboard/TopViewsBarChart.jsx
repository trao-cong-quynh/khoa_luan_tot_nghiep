import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TopViewsBarChart = ({
  data,
  title,
  dataKey,
  color,
  xAxisTick,
  xAxisDataKey,
}) => {
  const yourDesiredName = "Số vé:";

  // Hàm tùy chỉnh nội dung Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0];
      let displayText = dataItem.name;

      if (dataItem.name === "sold" || dataItem.name === "views") {
        displayText = yourDesiredName;
      }
      return (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>{label}</p>
          <p style={{ margin: "0" }}>{`${displayText} : ${dataItem.value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Hàm để rút gọn tên (ví dụ: giới hạn 20 ký tự)
  const formatXAxisTick = (tickItem) => {
    const maxLength = 10; // Đặt độ dài tối đa mong muốn
    if (tickItem && tickItem.length > maxLength) {
      return tickItem.substring(0, maxLength - 3) + "...";
    }
    return tickItem;
  };

  return (
    <div className="bg-white p-4 rounded shadow ml-2">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisDataKey}
            tick={xAxisTick || { fontSize: 10 }}
            tickFormatter={
              xAxisDataKey === "name" ? formatXAxisTick : undefined
            } // Chỉ áp dụng cho dataKey là "name"
            interval="preserveStartEnd" // Giúp tránh các nhãn bị chồng chéo
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} fill={color} barSize={100} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopViewsBarChart;
