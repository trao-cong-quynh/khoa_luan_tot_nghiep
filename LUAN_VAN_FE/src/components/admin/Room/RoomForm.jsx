import React, { useState, useEffect } from "react";

const RoomForm = ({ onSubmit, onCancel, initialData }) => {
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [totalRows, setTotalRows] = useState("");
  const [totalColumns, setTotalColumns] = useState("");

  const roomTypes = [
    { value: "thường", label: "Phòng thường" },
    { value: "vip", label: "Phòng VIP" },
  ];

  useEffect(() => {
    if (initialData) {
      setRoomName(initialData.room_name || "");
      setRoomType(initialData.room_type || "");
      setTotalRows(initialData.total_rows?.toString() || "");
      setTotalColumns(initialData.total_columns?.toString() || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      room_name: roomName,
      room_type: roomType,
      total_rows: parseInt(totalRows),
      total_columns: parseInt(totalColumns),
    });
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {initialData ? "Chỉnh sửa phòng chiếu" : "Tạo phòng chiếu"}
        </h2>
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl font-bold cursor-pointer"
        >
          &times;
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="roomName"
              className="block text-sm font-medium text-gray-700"
            >
              Nhập tên phòng chiếu
            </label>
            <input
              type="text"
              id="roomName"
              name="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Nhập tên phòng chiếu"
              required
            />
          </div>

          <div>
            <label
              htmlFor="roomType"
              className="block text-sm font-medium text-gray-700"
            >
              * Loại phòng chiếu
            </label>
            <select
              id="roomType"
              name="roomType"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            >
              <option value="">Chọn loại phòng</option>
              {roomTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="totalRows"
              className="block text-sm font-medium text-gray-700"
            >
              * Số hàng
            </label>
            <input
              type="number"
              id="totalRows"
              name="totalRows"
              value={totalRows}
              onChange={(e) => setTotalRows(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Nhập số hàng"
              min="1"
              max="50"
              required
            />
          </div>

          <div>
            <label
              htmlFor="totalColumns"
              className="block text-sm font-medium text-gray-700"
            >
              * Số cột
            </label>
            <input
              type="number"
              id="totalColumns"
              name="totalColumns"
              value={totalColumns}
              onChange={(e) => setTotalColumns(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Nhập số cột"
              min="1"
              max="50"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {initialData ? "Cập nhật" : "Lưu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
