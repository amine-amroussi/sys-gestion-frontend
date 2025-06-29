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

const PurchaseChart = () => {
  const { revenueState } = useRevenue();
  const { purchasesByDate, period } = revenueState;

  const labels = Object.keys(purchasesByDate).sort();
  const data = labels.map((date) => purchasesByDate[date]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Achats par jour (MAD)',
        data,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Tendances des achats (${period})` },
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Achats (MAD)' }, beginAtZero: true },
    },
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PurchaseChart;