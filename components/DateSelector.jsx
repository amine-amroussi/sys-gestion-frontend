'use client';
import { useState } from 'react';
import { useRevenue } from '@/store/revenueStore';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateSelector = () => {
  const { setPeriod, setCustomDates, revenueState } = useRevenue();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  const handleCustomDateSubmit = () => {
    if (startDate && endDate && moment(startDate).isBefore(moment(endDate))) {
      setCustomDates(moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'));
    } else {
      toast.error('Veuillez sélectionner des dates valides.');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <select
        className="border rounded p-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={revenueState.period}
        onChange={handlePeriodChange}
      >
        <option value="today">Aujourd'hui</option>
        <option value="lastWeek">Dernière semaine</option>
        <option value="last15Days">Derniers 15 jours</option>
        <option value="lastMonth">Dernier mois</option>
        <option value="custom">Personnalisé</option>
      </select>
      {revenueState.period === 'custom' && (
        <div className="flex items-center space-x-2">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border rounded p-2 text-gray-700"
            placeholderText="Date de début"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border rounded p-2 text-gray-700"
            placeholderText="Date de fin"
          />
          <button
            onClick={handleCustomDateSubmit}
            className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600"
          >
            Appliquer
          </button>
        </div>
      )}
    </div>
  );
};

export default DateSelector;