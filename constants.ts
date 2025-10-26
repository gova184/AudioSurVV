import { ThreatRating } from './types';

export const THREAT_RATING_OPTIONS = [
    ThreatRating.LOW,
    ThreatRating.MEDIUM,
    ThreatRating.HIGH,
];

export const THREAT_RATING_STYLES: { [key in ThreatRating]: { bg: string; text: string; border: string; label: string; } } = {
    [ThreatRating.HIGH]: {
        bg: 'bg-red-900/50',
        text: 'text-red-300',
        border: 'border-red-500',
        label: 'bg-red-500 text-white'
    },
    [ThreatRating.MEDIUM]: {
        bg: 'bg-yellow-900/50',
        text: 'text-yellow-300',
        border: 'border-yellow-500',
        label: 'bg-yellow-500 text-gray-900'
    },
    [ThreatRating.LOW]: {
        bg: 'bg-green-900/50',
        text: 'text-green-300',
        border: 'border-green-500',
        label: 'bg-green-500 text-gray-900'
    },
};
