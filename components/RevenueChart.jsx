import { useRevenue } from '@/store/revenueStore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import moment from 'moment';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const RevenueChart = () => {
  const { revenueState } = useRevenue();
  const { revenueByDate, period } = revenueState;

  const labels = Object.keys(revenueByDate).sort();
  const data = labels.map((date) => revenueByDate[date]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenus par jour (MAD)',
        data,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Tendances des revenus (${period})` },
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Revenus (MAD)' }, beginAtZero: true },
    },
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RevenueChart;