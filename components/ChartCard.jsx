const ChartCard = ({ title, children, loading }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {loading ? (
        <div className="text-center text-gray-500">Loading chart...</div>
      ) : (
        <div className="h-64">{children}</div>
      )}
    </div>
  );
};

export default ChartCard;