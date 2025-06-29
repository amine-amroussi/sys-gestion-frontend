const MetricCard = ({ title, value, icon, loading }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-[17px]  font-bold text-gray-600">{title}</h3>
      </div>

      <div>
        <p className="text-2xl font-bold">{loading ? "Loading..." : value}</p>
      </div>
    </div>
  );
};

export default MetricCard;
