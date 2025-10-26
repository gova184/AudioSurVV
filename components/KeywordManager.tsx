
import React, { useState } from 'react';
import { Keyword, ThreatRating, AudioSample } from '../types';
import { THREAT_RATING_OPTIONS, THREAT_RATING_STYLES } from '../constants';
import PlusIcon from './icons/PlusIcon';
import UploadIcon from './icons/UploadIcon';
import TrashIcon from './icons/TrashIcon';
import { fileToDataUrl } from '../utils/fileUtils';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface KeywordManagerProps {
    keywords: Keyword[];
    onAddKeyword: (keyword: Keyword) => void;
    onDeleteKeyword: (id: string) => void;
}

const KeywordManager: React.FC<KeywordManagerProps> = ({ keywords, onAddKeyword, onDeleteKeyword }) => {
    const [newKeyword, setNewKeyword] = useState('');
    const [rating, setRating] = useState<ThreatRating>(ThreatRating.LOW);
    const [samples, setSamples] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [expandedKeywordId, setExpandedKeywordId] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileList = Array.from(e.target.files);
            if (fileList.length + samples.length > 5) {
                setError("You can upload a maximum of 5 audio samples.");
            } else {
                setSamples(prev => [...prev, ...fileList]);
                setError(null);
            }
        }
    };
    
    const removeSample = (index: number) => {
        setSamples(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword.trim()) {
            setError("Keyword term cannot be empty.");
            return;
        }
        if (samples.length !== 5) {
            setError("You must upload exactly 5 audio samples.");
            return;
        }

        try {
            const audioSamples: AudioSample[] = await Promise.all(
                samples.map(async (file, index) => {
                    const audioSrc = await fileToDataUrl(file);
                    return {
                        id: `s-${Date.now()}-${index}`,
                        name: file.name,
                        audioSrc: audioSrc,
                    };
                })
            );

            const newKeywordObject: Keyword = {
                id: `kw-${Date.now()}`,
                term: newKeyword,
                initialRating: rating,
                samples: audioSamples,
            };
            onAddKeyword(newKeywordObject);

            // Reset form
            setNewKeyword('');
            setRating(ThreatRating.LOW);
            setSamples([]);
            setError(null);
        } catch (err) {
            setError("Failed to process audio files. Please try again.");
            console.error("Error creating keyword with audio samples:", err);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-4">Keyword Management</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                    <label htmlFor="keyword" className="block text-sm font-medium text-gray-300 mb-1">New Keyword</label>
                    <input
                        type="text"
                        id="keyword"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="e.g., package, emergency"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-300 mb-1">Initial Threat Rating</label>
                    <select
                        id="rating"
                        value={rating}
                        onChange={(e) => setRating(e.target.value as ThreatRating)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {THREAT_RATING_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Audio Samples ({samples.length}/5)</label>
                    <label htmlFor="audio-upload" className="flex justify-center w-full h-24 px-4 transition bg-gray-900 border-2 border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-500 focus:outline-none">
                        <span className="flex items-center space-x-2">
                            <UploadIcon className="w-6 h-6 text-gray-500" />
                            <span className="font-medium text-gray-500">
                                Drop files to attach, or <span className="text-indigo-400 underline">browse</span>
                            </span>
                        </span>
                        <input type="file" id="audio-upload" multiple accept="audio/*" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>
                {samples.length > 0 && (
                     <div className="grid grid-cols-1 gap-2 text-sm">
                        {samples.map((sample, index) => (
                             <div key={index} className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                                <span className="text-gray-300 truncate">{sample.name}</span>
                                <button type="button" onClick={() => removeSample(index)} className="text-red-400 hover:text-red-300">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                             </div>
                        ))}
                     </div>
                )}
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button type="submit" className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Keyword
                </button>
            </form>
            
            <h3 className="text-lg font-semibold text-white border-t border-gray-700 pt-4">Defined Keywords</h3>
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto pr-2 -mr-2">
                {keywords.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No keywords defined yet.</p>
                ) : (
                    keywords.map(kw => {
                         const styles = THREAT_RATING_STYLES[kw.initialRating];
                         const isExpanded = expandedKeywordId === kw.id;
                         return (
                            <div key={kw.id} className="bg-gray-700/50 rounded-lg transition-all duration-300">
                                <div 
                                    className="flex justify-between items-center p-3 cursor-pointer"
                                    onClick={() => setExpandedKeywordId(isExpanded ? null : kw.id)}
                                >
                                    <div>
                                        <span className="font-bold text-white">{kw.term}</span>
                                        <span className={`ml-3 px-2 py-0.5 text-xs font-semibold rounded-full ${styles.label}`}>
                                            {kw.initialRating}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400">{kw.samples.length} samples</span>
                                        <button onClick={(e) => { e.stopPropagation(); onDeleteKeyword(kw.id); }} className="text-gray-400 hover:text-red-400 transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="p-3 border-t border-gray-600">
                                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Audio Samples</h4>
                                        <ul className="space-y-2">
                                            {kw.samples.map(sample => (
                                                <li key={sample.id} className="flex flex-col sm:flex-row items-center justify-between bg-gray-900/70 p-2 rounded gap-2">
                                                    <span className="text-sm text-gray-300 truncate w-full sm:w-auto" title={sample.name}>{sample.name}</span>
                                                    {sample.audioSrc ? (
                                                        <audio controls src={sample.audioSrc} className="h-8 w-full sm:w-auto max-w-xs"></audio>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 italic pr-2">(Audio not available)</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default KeywordManager;
