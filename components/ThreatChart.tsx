import React, { useMemo } from 'react';
import { Alert, ThreatRating } from '../types';
import { THREAT_RATING_STYLES } from '../constants';

interface ThreatChartProps {
    alerts: Alert[];
}

const ThreatChart: React.FC<ThreatChartProps> = ({ alerts }) => {
    const threatCounts = useMemo(() => {
        const counts = {
            [ThreatRating.HIGH]: 0,
            [ThreatRating.MEDIUM]: 0,
            [ThreatRating.LOW]: 0,
        };
        alerts.forEach(alert => {
            if (counts[alert.threatRating] !== undefined) {
                counts[alert.threatRating]++;
            }
        });
        return counts;
    }, [alerts]);

    const totalAlerts = alerts.length;
    
    const chartData = [
        { level: ThreatRating.HIGH, count: threatCounts[ThreatRating.HIGH], styles: THREAT_RATING_STYLES[ThreatRating.HIGH] },
        { level: ThreatRating.MEDIUM, count: threatCounts[ThreatRating.MEDIUM], styles: THREAT_RATING_STYLES[ThreatRating.MEDIUM] },
        { level: ThreatRating.LOW, count: threatCounts[ThreatRating.LOW], styles: THREAT_RATING_STYLES[ThreatRating.LOW] },
    ];

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg mb-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Threat Level Overview</h3>
            {totalAlerts === 0 ? (
                <p className="text-gray-400 text-center py-4">No data available to display chart.</p>
            ) : (
                <div className="space-y-3">
                    {chartData.map(({ level, count, styles }) => {
                        const percentage = totalAlerts > 0 ? (count / totalAlerts) * 100 : 0;
                        return (
                            <div key={level} className="flex items-center gap-2">
                                <span className="w-16 text-sm font-medium text-gray-300 flex-shrink-0">{level}</span>
                                <div className="flex-1 bg-gray-700 rounded-full h-5">
                                    <div
                                        className={`${styles.label.split(' ')[0]} h-5 rounded-full flex items-center justify-end pr-2`}
                                        style={{ width: `${percentage}%`, transition: 'width 0.5s ease-in-out' }}
                                    >
                                        <span className="text-xs font-bold text-white mix-blend-difference">
                                            {count}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ThreatChart;
