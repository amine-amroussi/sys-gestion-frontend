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

const PaymentChart = () => {
  const { revenueState } = useRevenue();
  const { paymentsByDate, period } = revenueState;

  const labels = Object.keys(paymentsByDate).sort();
  const data = labels.map((date) => paymentsByDate[date]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Paiements aux employés par mois (MAD)',
        data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Tendances des paiements (${period})` },
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Paiements (MAD)' }, beginAtZero: true },
    },
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PaymentChart;