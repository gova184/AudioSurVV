
import React from 'react';
import { Alert } from '../types';
import { THREAT_RATING_STYLES } from '../constants';
import TrashIcon from './icons/TrashIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface AlertCardProps {
    alert: Alert;
    onDelete: (id: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onDelete }) => {
    const styles = THREAT_RATING_STYLES[alert.threatRating];

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent any parent onClick events
        if (alert.analysisState !== 'preliminary') {
            onDelete(alert.id);
        }
    };

    const isAnalyzing = alert.analysisState === 'preliminary';

    return (
        <div className={`border-l-4 ${styles.border} ${styles.bg} p-5 rounded-r-lg shadow-md transition-all duration-300 hover:shadow-xl ${isAnalyzing ? 'opacity-70 animate-pulse' : 'opacity-100'}`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${styles.label}`}>
                        {alert.threatRating.toUpperCase()} THREAT
                    </span>
                    <div className="relative group">
                        <h3 className="text-xl font-semibold text-white mt-2 cursor-help">
                            Keyword Detected: <span className={styles.text}>{alert.keywordDetected}</span>
                        </h3>
                        <div className="absolute bottom-full left-0 mb-2 w-max max-w-lg p-3 bg-gray-950 border border-gray-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible z-20 pointer-events-none">
                            <h5 className="font-bold text-gray-300 mb-2 border-b border-gray-700 pb-1">Full Transcript</h5>
                            <p className="text-sm text-gray-400 font-mono whitespace-pre-wrap">
                                {alert.fullTranscript}
                            </p>
                            <div className="absolute top-full left-6 -ml-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-950"></div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-xs text-gray-400 text-right">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                        <br/>
                        {new Date(alert.timestamp).toLocaleDateString()}
                    </div>
                    <button 
                        onClick={handleDelete}
                        className="text-gray-500 hover:text-red-400 transition-colors duration-200 disabled:text-gray-700 disabled:cursor-not-allowed"
                        aria-label="Delete alert"
                        disabled={isAnalyzing}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {alert.audioSrc && (
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-1">Recorded Audio</h4>
                        <audio controls src={alert.audioSrc} className="w-full h-10">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
                <div>
                    <h4 className="font-semibold text-gray-300 mb-1 flex items-center gap-2">
                        Semantic Summary
                        {isAnalyzing && (
                            <SpinnerIcon className="w-4 h-4 text-indigo-400" />
                        )}
                    </h4>
                    <p className={`text-sm leading-relaxed ${isAnalyzing ? 'text-gray-400 italic' : 'text-gray-300'}`}>
                        {alert.semanticSummary}
                    </p>
                    {alert.slangDetected && alert.slangDetected.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-700/50">
                            <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Slang / Code Words Identified</h5>
                            <dl className="text-sm">
                                {alert.slangDetected.map((slang, index) => (
                                    <div key={index} className="grid grid-cols-3 gap-2 py-1">
                                        <dt className="col-span-1 font-mono text-indigo-300 bg-gray-900/50 px-2 py-0.5 rounded-md text-center self-center">{slang.term}</dt>
                                        <dd className="col-span-2 text-gray-300 self-center">{slang.meaning}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-300 mb-1">Full Transcript</h4>
                    <p className="text-gray-400 text-sm bg-gray-900/50 p-3 rounded-md font-mono whitespace-pre-wrap">
                        {alert.fullTranscript}
                    </p>
                </div>
                {alert.englishTranslation && alert.englishTranslation.trim().toLowerCase() !== alert.fullTranscript.trim().toLowerCase() && (
                    <div>
                        <h4 className="font-semibold text-gray-300 mb-1">English Translation</h4>
                        <p className="text-gray-400 text-sm bg-gray-900/50 p-3 rounded-md font-mono whitespace-pre-wrap">
                            {alert.englishTranslation}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertCard;