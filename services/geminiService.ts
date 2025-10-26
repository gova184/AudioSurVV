
import { GoogleGenAI, Type } from "@google/genai";
import { Keyword, GeminiAnalysisResponse, ThreatRating, InitialScanResponse, DeepAnalysisResponse } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Please provide it for the app to function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });


// Helper function to convert a File object to a GoogleGenerativeAI.Part object.
async function fileToGenerativePart(file: File) {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type
        },
    };
}


/**
 * Tier 1: Fast, low-latency analysis for immediate feedback.
 * Uses a fast model to transcribe, find a keyword, and give a preliminary rating.
 */
export const performInitialScan = async (audioFile: File): Promise<InitialScanResponse> => {
    const model = 'gemini-2.5-flash-lite';
    
    const systemInstruction = `You are a fast audio processor. Your task is to quickly transcribe the audio and identify the most significant keyword or topic. 
Also, provide a preliminary threat rating ('High', 'Medium', 'Low') based on the initial transcription. 
Return ONLY a valid JSON object.`;

    try {
        const audioPart = await fileToGenerativePart(audioFile);
        
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [audioPart, { text: "Transcribe, find keyword, and give preliminary threat rating." }] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                         keyword_detected: {
                            type: Type.STRING,
                            description: "The most significant keyword, phrase, or topic found in the transcript."
                        },
                        threat_rating: {
                            type: Type.STRING,
                            enum: [ThreatRating.HIGH, ThreatRating.MEDIUM, ThreatRating.LOW],
                            description: "The preliminary assessed threat rating.",
                        },
                        full_transcript: {
                            type: Type.STRING,
                            description: "The full transcript that was analyzed."
                        },
                    },
                    required: ["keyword_detected", "threat_rating", "full_transcript"],
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as InitialScanResponse;
        
        if (!result.full_transcript) {
            result.full_transcript = "[Transcription not provided by model]";
        }

        return result;

    } catch (error) {
        console.error("Error calling Gemini API for initial scan:", error);
        throw new Error("Failed to get a valid initial analysis from the Gemini API.");
    }
};

/**
 * Tier 2: Deep, contextual analysis using a powerful model with thinking enabled.
 * Takes a transcript and provides a final rating and detailed summary.
 */
export const performDeepAnalysis = async (transcript: string): Promise<DeepAnalysisResponse> => {
    const model = 'gemini-2.5-pro';

    const systemInstruction = `You are an expert AI security analyst for "AudioSurv". You have been given an audio transcript. 
Perform a deep contextual analysis. Your task is to: 
1. Provide a final, highly accurate threat rating ('High', 'Medium', 'Low'). 
2. Write a detailed semantic summary explaining the context, intent, tone, and any detected slang or code words.
3. Translate the full transcript into English. If it is already in English, return the original transcript.
Return ONLY a valid JSON object.`;

    const userPrompt = `Analyze the following transcript: "${transcript}"`;

     try {
        const response = await ai.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
                systemInstruction,
                thinkingConfig: { thinkingBudget: 32768 },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        threat_rating: {
                            type: Type.STRING,
                            enum: [ThreatRating.HIGH, ThreatRating.MEDIUM, ThreatRating.LOW],
                            description: "The final, most accurate threat rating.",
                        },
                        semantic_summary: {
                            type: Type.STRING,
                            description: "A detailed summary of the context, intent, and reasoning for the assigned threat rating."
                        },
                        english_translation: {
                            type: Type.STRING,
                            description: "An English translation of the original transcript. If the transcript is already in English, this is the same as the original transcript."
                        }
                    },
                    required: ["threat_rating", "semantic_summary", "english_translation"],
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as DeepAnalysisResponse;

    } catch (error) {
        console.error("Error calling Gemini API for deep analysis:", error);
        throw new Error("Failed to get a valid deep analysis from the Gemini API.");
    }
}


export const analyzeAudio = async (keyword: Keyword, transcript: string): Promise<GeminiAnalysisResponse> => {
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `You are an AI security analyst for a system called "AudioSurv".
Your task is to perform a deep contextual analysis of a transcribed audio segment.

**Analysis Required:**
1.  **Semantic Interpretation:** Analyze the full transcript to understand the context, intent, and tone. Decipher modern slang, colloquialisms, and code words. Your analysis should be language-agnostic, but pay special attention to nuances in Indian languages (e.g., Tamil, Telugu, Hindi, Malayalam, Kannada) if present.
2.  **Threat Assessment:** Based on your semantic interpretation, assign a final threat rating. You can either confirm the initial rating or change it if the context suggests a different level of threat. For example, if the keyword is "package" but the context is about a bomb, the threat is high. If it's about a birthday gift, the threat is low.
3.  **Summary:** Provide a concise summary explaining your reasoning for the final threat rating.
4.  **Translation:** Translate the full transcript into English. If the original transcript is already in English, just return the original transcript in the 'english_translation' field.

**Output Format:**
Return a single, valid JSON object that strictly adheres to the provided schema. Do not include any other text, markdown formatting, or explanations outside of the JSON object.`;

    const userPrompt = `**Input Details:**
- **Detected Keyword:** "${keyword.term}"
- **Initial Threat Rating (set by analyst):** "${keyword.initialRating}"
- **Full Audio Transcript:** "${transcript}"`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        threat_rating: {
                            type: Type.STRING,
                            enum: [ThreatRating.HIGH, ThreatRating.MEDIUM, ThreatRating.LOW],
                            description: "The final assessed threat rating.",
                        },
                        semantic_summary: {
                            type: Type.STRING,
                            description: "A brief summary of the context and the reasoning for the assigned threat rating."
                        },
                        full_transcript: {
                            type: Type.STRING,
                            description: "The full transcript that was analyzed."
                        },
                        english_translation: {
                            type: Type.STRING,
                            description: "An English translation of the full transcript. If the original was English, this is the same as the transcript."
                        }
                    },
                    required: ["threat_rating", "semantic_summary", "full_transcript", "english_translation"],
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as GeminiAnalysisResponse;
        
        if (!result.full_transcript) {
            result.full_transcript = transcript;
        }

        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get a valid analysis from the Gemini API.");
    }
};