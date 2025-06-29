import { useRevenue } from '@/store/revenueStore';
import moment from 'moment';

const RevenueDisplay = () => {
  const { revenueState } = useRevenue();
  const { totalRevenue, period, startDate, endDate, loading, error } = revenueState;

  const getPeriodLabel = () => {
    switch (period) {
      case 'today': return "Aujourd'hui";
      case 'lastWeek': return 'Dernière semaine';
      case 'last15Days': return 'Derniers 15 jours';
      case 'lastMonth': return 'Dernier mois';
      case 'custom': return `Du ${moment(startDate).format('DD/MM/YYYY')} au ${moment(endDate).format('DD/MM/YYYY')}`;
      default: return '';
    }
  };

  if (loading) return <div className="text-center text-gray-500">Chargement...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Revenus {getPeriodLabel()}</h2>
      <p className="text-3xl font-semibold text-blue-600">
        {totalRevenue} MAD
      </p>
    </div>
  );
};

export default RevenueDisplay;