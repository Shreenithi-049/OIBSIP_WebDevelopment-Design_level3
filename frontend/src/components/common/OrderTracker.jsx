const statusSteps = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];
const statusIcons = ['📋', '👨‍🍳', '🛵', '✅'];

const OrderTracker = ({ status }) => {
  const currentIdx = statusSteps.indexOf(status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0">
          <div
            className="h-full bg-primary transition-all duration-700"
            style={{ width: `${(currentIdx / (statusSteps.length - 1)) * 100}%` }}
          />
        </div>

        {statusSteps.map((step, idx) => (
          <div key={step} className="flex flex-col items-center z-10 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500 ${
              idx <= currentIdx
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white border-gray-300 text-gray-400'
            }`}>
              {statusIcons[idx]}
            </div>
            <p className={`text-xs mt-2 font-medium text-center leading-tight ${
              idx <= currentIdx ? 'text-primary' : 'text-gray-400'
            }`}>
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTracker;
