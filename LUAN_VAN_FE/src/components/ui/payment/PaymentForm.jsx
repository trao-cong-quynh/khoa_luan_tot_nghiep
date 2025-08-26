import React from "react";

const PaymentForm = ({ formData, handleChange, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Họ và tên */}
      <div>
        <label
          className="block text-black text-sm font-bold mb-2"
          htmlFor="fullName"
        >
          Họ và tên: <span className="text-red-500">*</span>
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>
      {/* Số điện thoại */}
      <div>
        <label
          className="block text-black text-sm font-bold mb-2"
          htmlFor="phone"
        >
          Số điện thoại: <span className="text-red-500">*</span>
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
          id="phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>
      {/* Email */}
      <div>
        <label
          className="block text-black text-sm font-bold mb-2"
          htmlFor="email"
        >
          Email: <span className="text-red-500">*</span>
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      {/* Checkboxes */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="agreeAge"
            name="agreeAge"
            checked={formData.agreeAge}
            onChange={handleChange}
            className="form-checkbox text-[var(--color-hover)] rounded"
          />
          <label htmlFor="agreeAge" className="ml-2 text-black">
            Đảm bảo mua vé đúng số tuổi quy định
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="agreeTerms"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleChange}
            className="form-checkbox text-[var(--color-hover)] rounded"
            required
          />
          <label htmlFor="agreeTerms" className="ml-2 text-black">
            Đồng ý với
            <a
              href="#"
              className="text-[var(--color-hover)] hover:underline ml-1"
            >
              điều khoản
            </a>
            của Cinestar.
          </label>
        </div>
      </div>
      {/* Tiếp tục button */}
      <button
        type="submit"
        className="w-full font-bold py-3 px-4 rounded transition cursor-pointer"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "black",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "var(--color-hover)";
          e.target.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "var(--color-primary)";
          e.target.style.color = "black";
        }}
      >
        TIẾP TỤC
      </button>
    </form>
  );
};

export default PaymentForm;
