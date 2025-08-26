export default function ModalPhim({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 bg-opacity-0">
      <div className="bg-white rounded shadow-lg relative min-w-[350px] ">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-white text-3xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
