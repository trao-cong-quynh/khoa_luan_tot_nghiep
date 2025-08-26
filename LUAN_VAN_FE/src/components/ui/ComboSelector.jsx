import React, { useState, useEffect } from "react";
import { useGetDVAnUongUS } from "../../api/homePage/queries";
import { imagePhim } from "../../Utilities/common";

function ComboSelector({ onComboSelect }) {
  const [quantities, setQuantities] = useState({});

  const { data: concessionsData, isLoading, error } = useGetDVAnUongUS();

  console.log("ComboSelector - concessionsData from API:", concessionsData);

  const fetchedCombos = concessionsData?.data?.concessions || [];

  useEffect(() => {
    const initialQuantities = {};
    fetchedCombos.forEach((c) => {
      initialQuantities[c.concession_id] = 0;
    });
    setQuantities(initialQuantities);
  }, [fetchedCombos]);

  const handleChange = (id, delta) => {
    setQuantities((prev) => {
      const next = { ...prev };
      next[id] = Math.max(0, (next[id] || 0) + delta);
      return next;
    });
  };

  useEffect(() => {
    console.log("ComboSelector - quantities changed:", quantities);
    onComboSelect(quantities);
  }, [quantities, onComboSelect]);

  console.log("ComboSelector - fetchedCombos before map:", fetchedCombos);
  const groups = Array.from(new Set(fetchedCombos.map((c) => c.category)));

  if (isLoading) return <div>Đang tải danh sách bắp nước...</div>;
  if (error) return <div>Lỗi khi tải danh sách bắp nước: {error.message}</div>;

  return (
    <div className="w-full mx-auto sm:py-8 md:py-10">
      <h2
        className="text-center text-xl sm:text-2xl font-bold mb-4"
        style={{ color: "var(--color-showtime-bg)" }}
      >
        CHỌN BẮP NƯỚC
      </h2>
      {groups.map((group) => (
        <div key={group} className="mb-8">
          <h3 className="text-center text-base sm:text-lg font-semibold mb-6 text-gray-700 uppercase">
            {group}
          </h3>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {fetchedCombos
                .filter((c) => c.category === group)
                .map((comboItem) => (
                  <div
                    key={comboItem.concession_id}
                    className="flex bg-gradient-to-br bg-white rounded-xl shadow-md p-4 items-center gap-4 w-full"
                  >
                    <img
                      src={
                        comboItem.image_url
                          ? `${imagePhim}${comboItem.image_url}`
                          : "https://via.placeholder.com/150"
                      }
                      alt={comboItem.concession_name}
                      className="w-28 h-28 object-contain rounded"
                    />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="font-bold text-base uppercase text-primary-custom">
                        {comboItem.concession_name}
                      </div>
                      <div className="whitespace-pre-line text-sm text-primary-custom">
                        {comboItem.description || "Mô tả đang cập nhật"}
                      </div>
                      <div className="font-semibold text-primary-custom">
                        {(() => {
                          const priceValue = parseFloat(comboItem.unit_price);
                          return isNaN(priceValue)
                            ? "Giá không xác định"
                            : `${priceValue.toLocaleString()} VND`;
                        })()}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            handleChange(comboItem.concession_id, -1)
                          }
                          className="w-8 h-8 rounded bg-gray-300 text-xl font-bold text-gray-700 hover:bg-gray-400 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-primary-custom">
                          {quantities[comboItem.concession_id] || 0}
                        </span>
                        <button
                          onClick={() =>
                            handleChange(comboItem.concession_id, 1)
                          }
                          className="w-8 h-8 rounded bg-gray-300 text-xl font-bold text-gray-700 hover:bg-gray-400 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ComboSelector;
