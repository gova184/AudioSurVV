
import React, { useState, useEffect, useMemo } from 'react';
import { Keyword, Alert, ThreatRating } from './types';
import { performInitialScan, performDeepAnalysis } from './services/geminiService';
import Header from './components/Header';
import AudioScanner from './components/AudioScanner';
import { fileToDataUrl } from './utils/fileUtils';
import Sidebar from './components/Sidebar';
import AlertCard from './components/AlertCard';

const initialAlerts: Alert[] = [
    {
        id: 'alert-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        keywordDetected: 'emergency',
        threatRating: ThreatRating.HIGH,
        semanticSummary: 'A distress call was identified, indicating a critical situation requiring immediate attention at the main entrance.',
        fullTranscript: 'This is an emergency! We need all units to respond to the main entrance immediately, situation critical.',
        analysisState: 'complete',
    },
    {
        id: 'alert-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        keywordDetected: 'package',
        threatRating: ThreatRating.MEDIUM,
        semanticSummary: 'Unusual conversation regarding a "package" delivery at a non-standard location and time. Context suggests potential illicit activity.',
        fullTranscript: 'Did you get the package? Make sure no one sees you. The drop is behind the old warehouse at midnight.',
        analysisState: 'complete',
        slangDetected: [
            { term: 'package', meaning: 'Illicit item or contraband' },
            { term: 'the drop', meaning: 'The location for a secret exchange' }
        ],
    },
     {
        id: 'alert-4',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutes ago
        keywordDetected: 'package',
        threatRating: ThreatRating.LOW,
        semanticSummary: 'A standard delivery confirmation was detected. No threat identified.',
        fullTranscript: 'Hi, just confirming the package was delivered to the front desk. Please sign for it when you can.',
        analysisState: 'complete',
    },
    {
        id: 'alert-3',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        keywordDetected: 'rendezvous',
        threatRating: ThreatRating.LOW,
        semanticSummary: 'A meeting was scheduled, but the context appears to be a standard business arrangement without any overt threats.',
        fullTranscript: 'Confirming the rendezvous for tomorrow at 10 AM in the conference room to discuss the project proposal.',
        analysisState: 'complete',
    },
];

const App: React.FC = () => {
    const [keywords, setKeywords] = useState<Keyword[]>(() => {
        try {
            const storedKeywords = localStorage.getItem('audioSurvKeywords');
            return storedKeywords ? JSON.parse(storedKeywords) : [];
        } catch (error) {
            console.error("Failed to parse keywords from localStorage", error);
            return [];
        }
    });
    const [alerts, setAlerts] = useState<Alert[]>(() => {
        try {
            const storedAlerts = localStorage.getItem('audioSurvAlerts');
            // Add 'complete' state to legacy alerts
            const parsedAlerts = storedAlerts ? JSON.parse(storedAlerts) : initialAlerts;
            return parsedAlerts.map((a: Alert) => ({ ...a, analysisState: 'complete' }));
        } catch (error) {
            console.error("Failed to parse alerts from localStorage", error);
            return initialAlerts;
        }
    });
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // New state for sorting and filtering
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'threat'>('newest');
    const [filterKeyword, setFilterKeyword] = useState<string>('');

    // Persist alerts to localStorage without audio data
    useEffect(() => {
        try {
            const alertsToStore = alerts.map(({ audioSrc, ...rest }) => rest);
            localStorage.setItem('audioSurvAlerts', JSON.stringify(alertsToStore));
        } catch (error) {
            console.error("Failed to save alerts to localStorage", error);
        }
    }, [alerts]);

    const addKeyword = (keyword: Keyword) => {
        setKeywords(prev => {
            const updatedKeywords = [...prev, keyword];
            try {
                const keywordsToStore = updatedKeywords.map(kw => ({
                    ...kw,
                    samples: kw.samples.map(({ audioSrc, ...restSample }) => restSample)
                }));
                localStorage.setItem('audioSurvKeywords', JSON.stringify(keywordsToStore));
            } catch (error) {
                console.error("Failed to save keywords to localStorage", error);
            }
            return updatedKeywords;
        });
    };

    const deleteKeyword = (id: string) => {
        setKeywords(prev => {
            const updatedKeywords = prev.filter(k => k.id !== id);
            try {
                const keywordsToStore = updatedKeywords.map(kw => ({
                    ...kw,
                    samples: kw.samples.map(({ audioSrc, ...restSample }) => restSample)
                }));
                localStorage.setItem('audioSurvKeywords', JSON.stringify(keywordsToStore));
            } catch (error) {
                console.error("Failed to save keywords to localStorage", error);
            }
            return updatedKeywords;
        });
    };
    
    const deleteAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const handleAudioScan = async (audioFile: File) => {
        setIsScanning(true);
        setError(null);
        
        const tempId = `alert-temp-${Date.now()}`;
        let audioSrc: string | undefined;

        try {
            // Get audio URL first
            audioSrc = await fileToDataUrl(audioFile);

            // --- Tier 1: Initial, Fast Scan ---
            const initialAnalysis = await performInitialScan(audioFile);
            
            const preliminaryAlert: Alert = {
                id: tempId,
                timestamp: new Date().toISOString(),
                keywordDetected: initialAnalysis.keyword_detected,
                threatRating: initialAnalysis.threat_rating,
                fullTranscript: initialAnalysis.full_transcript,
                semanticSummary: 'Performing deep semantic analysis...',
                audioSrc,
                analysisState: 'preliminary',
            };
            
            // Add preliminary alert to UI immediately
            setAlerts(prev => [preliminaryAlert, ...prev]);

            // --- Tier 2: Deep Analysis ---
            const deepAnalysis = await performDeepAnalysis(initialAnalysis.full_transcript);

            // Update the alert with the deep analysis results
            setAlerts(prev => prev.map(alert => 
                alert.id === tempId 
                    ? { 
                        ...alert, 
                        id: `alert-${Date.now()}`, // Assign final ID
                        threatRating: deepAnalysis.threat_rating,
                        semanticSummary: deepAnalysis.semantic_summary,
                        englishTranslation: deepAnalysis.english_translation,
                        slangDetected: deepAnalysis.slang_detected,
                        analysisState: 'complete'
                      } 
                    : alert
            ));

        } catch (err) {
            // If something fails, remove the temp alert if it was added
            setAlerts(prev => prev.filter(a => a.id !== tempId));
            setError(err instanceof Error ? err.message : 'An unknown error occurred during the scan.');
        } finally {
            setIsScanning(false);
        }
    };


    // Apply sorting and filtering for the Threat Log in the sidebar
    const displayedAlerts = useMemo(() => {
        let processedAlerts = [...alerts];

        // Filtering
        if (filterKeyword) {
            processedAlerts = processedAlerts.filter(alert =>
                alert.keywordDetected.toLowerCase().includes(filterKeyword.toLowerCase())
            );
        }

        // Sorting
        switch (sortOrder) {
            case 'oldest':
                processedAlerts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                break;
            case 'threat':
                const threatOrder = { [ThreatRating.HIGH]: 0, [ThreatRating.MEDIUM]: 1, [ThreatRating.LOW]: 2 };
                processedAlerts.sort((a, b) => threatOrder[a.threatRating] - threatOrder[b.threatRating]);
                break;
            case 'newest':
            default:
                processedAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                break;
        }

        return processedAlerts;
    }, [alerts, sortOrder, filterKeyword]);

    // Automatically clear error message after a few seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Get the absolute most recent alert for the main dashboard view
    const recentAlert = useMemo(() => {
        const sorted = [...alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return sorted.length > 0 ? sorted[0] : null;
    }, [alerts]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <Sidebar 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                keywords={keywords}
                onAddKeyword={addKeyword}
                onDeleteKeyword={deleteKeyword}
                alerts={displayedAlerts}
                onDeleteAlert={deleteAlert}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                filterKeyword={filterKeyword}
                onFilterKeywordChange={setFilterKeyword}
            />
            <Header onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto flex flex-col gap-8">
                    <AudioScanner onScan={handleAudioScan} loading={isScanning} />
                     <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Most Recent Analysis</h2>
                        {recentAlert ? (
                             <AlertCard alert={recentAlert} onDelete={deleteAlert} />
                        ) : (
                            <div className="text-center py-10 px-4 bg-gray-800/50 rounded-lg">
                                <p className="text-gray-400">Scan an audio file to see the analysis here.</p>
                            </div>
                        )}
                    </div>
                </div>
                {error && (
                    <div className="fixed bottom-4 right-4 bg-red-800 text-white p-4 rounded-lg shadow-lg z-50">
                        <strong>Error:</strong> {error}
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
