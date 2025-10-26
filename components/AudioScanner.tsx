
import React, { useState } from 'react';
import ScanIcon from './icons/ScanIcon';
import UploadIcon from './icons/UploadIcon';

interface AudioScannerProps {
    onScan: (audioFile: File) => Promise<void>;
    loading: boolean;
}

const AudioScanner: React.FC<AudioScannerProps> = ({ onScan, loading }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setError("Please select an audio file to scan.");
            return;
        }
        setError(null);
        onScan(selectedFile).then(() => {
            // Clear form on successful submission
            setSelectedFile(null);
            
            // Clear the actual file input value
            const fileInput = document.getElementById('audio-scan-upload') as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }
        });
    };
    
    return (
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Scan Audio File for Threats</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="audio-scan-upload" className="block text-sm font-medium text-gray-300 mb-1">1. Select Audio File</label>
                    <label
                        htmlFor="audio-scan-upload"
                        className="flex items-center space-x-2 w-full px-3 py-2 transition bg-gray-900 border border-gray-600 rounded-md appearance-none cursor-pointer hover:border-gray-500 focus:outline-none"
                    >
                        <UploadIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-400 truncate">
                            {selectedFile ? selectedFile.name : 'Select a file...'}
                        </span>
                    </label>
                    <input type="file" id="audio-scan-upload" accept="audio/*" className="hidden" onChange={handleFileChange} />
                </div>
                
                {error && <p className="text-sm text-red-400">{error}</p>}

                <button 
                    type="submit" 
                    className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-indigo-800 disabled:cursor-not-allowed"
                    disabled={!selectedFile || loading}
                >
                    <ScanIcon className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Analyzing...' : 'Scan Audio'}
                </button>
            </form>
        </div>
    );
};

export default AudioScanner;