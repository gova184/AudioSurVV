
import React from 'react';
import { Alert } from '../types';
import AlertCard from './AlertCard';
import ThreatChart from './ThreatChart';

interface DashboardProps {
    alerts: Alert[];
    onDeleteAlert: (id: string) => void;
    sortOrder: 'newest' | 'oldest' | 'threat';
    onSortOrderChange: (order: 'newest' | 'oldest' | 'threat') => void;
    filterKeyword: string;
    onFilterKeywordChange: (keyword: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    alerts, 
    onDeleteAlert,
    sortOrder,
    onSortOrderChange,
    filterKeyword,
    onFilterKeywordChange,
}) => {
    return (
        <div className="bg-gray-800/50 rounded-lg p-6 h-full shadow-lg border border-gray-700 flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-white">Real-Time Alerts</h2>
            </div>
            
            <ThreatChart alerts={alerts} />
            
            {/* Filter and Sort Controls */}
            <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-gray-700">
                <div className="flex-grow">
                    <label htmlFor="filter-keyword" className="sr-only">Filter by keyword</label>
                    <input
                        type="text"
                        id="filter-keyword"
                        placeholder="Filter by keyword..."
                        value={filterKeyword}
                        onChange={(e) => onFilterKeywordChange(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex-shrink-0">
                    <label htmlFor="sort-order" className="sr-only">Sort alerts</label>
                    <select
                        id="sort-order"
                        value={sortOrder}
                        onChange={(e) => onSortOrderChange(e.target.value as 'newest' | 'oldest' | 'threat')}
                        className="w-full sm:w-auto bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="threat">Threat: High to Low</option>
                    </select>
                </div>
            </div>
           
            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                {alerts.length === 0 ? (
                     <div className="text-center py-10 px-4 bg-gray-900/50 rounded-lg h-full flex items-center justify-center">
                        <p className="text-gray-400">
                            {filterKeyword 
                                ? `No alerts match "${filterKeyword}".`
                                : 'No alerts have been recorded.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alerts.map(alert => (
                            <AlertCard key={alert.id} alert={alert} onDelete={onDeleteAlert} />
                        ))}
                    </div>
                 )}
            </div>
        </div>
    );
};

export default Dashboard;