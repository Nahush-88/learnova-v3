
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";

// Ensure API_KEY is set in the environment variables
// For example, in a .env file: API_KEY=your_gemini_api_key
// In a production environment, this should be securely managed.
const apiKey = "AIzaSyDyxfu9_I8Mr5xlVdm-sW8Z8lb7PSKVNEA";
if (!apiKey) {
  // In a real app, you might want to show this error to the user or log it more robustly.
  // For this example, we'll throw an error if the key is missing during development/build.
  // In the browser, process.env.API_KEY might not be directly available without a build tool like Vite or Webpack.
  // For a pure client-side app without a build step, the API key would need to be hardcoded or fetched,
  // but hardcoding is NOT recommended for production.
  // This SPA assumes process.env.API_KEY is made available (e.g. by a build tool replacing it).
  console.error("API_KEY for Gemini is not set. Please set the API_KEY environment variable.");
  // To avoid breaking the app immediately if API_KEY is not set during development in some setups:
  // We will let it try and fail at the API call level to show the error in UI.
}

const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY" }); // Provide a fallback to avoid immediate crash if undefined

/**
 * Generates text content using the Gemini API.
 * @param prompt The text prompt.
 * @param systemInstruction Optional system instruction for the model.
 * @param modelName The model to use.
 * @returns The generated text.
 */
export const generateText = async (
  prompt: string,
  systemInstruction?: string,
  modelName: string = 'gemini-2.5-flash-preview-04-17'
): Promise<string> => {
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured. Please contact support or check your setup.");
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      ...(systemInstruction && { config: { systemInstruction } }),
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini API (generateText) error:", error);
    // Try to provide a more user-friendly error message
    if (error.message && error.message.includes("API key not valid")) {
        throw new Error("The Gemini API key is invalid or not authorized. Please check your API key.");
    }
    if (error.message && error.message.includes("fetch")) { // General network error
        throw new Error("A network error occurred while contacting the AI service. Please check your internet connection and try again.");
    }
    throw new Error(error.message || "An unknown error occurred while generating text with Gemini.");
  }
};

/**
 * Generates text content based on a prompt and an image using the Gemini API.
 * @param prompt The text prompt.
 * @param imageBase64 The base64 encoded image data (without data URI prefix).
 * @param mimeType The MIME type of the image (e.g., 'image/png', 'image/jpeg').
 * @param systemInstruction Optional system instruction for the model.
 * @param modelName The model to use.
 * @returns The generated text.
 */
export const generateTextAndImage = async (
  prompt: string,
  imageBase64: string,
  mimeType: string,
  systemInstruction?: string,
  modelName: string = 'gemini-2.5-flash-preview-04-17' // Ensure this model supports multimodal
): Promise<string> => {
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured. Please contact support or check your setup.");
  }
  try {
    const imagePart: Part = {
      inlineData: {
        mimeType: mimeType,
        data: imageBase64,
      },
    };
    const textPart: Part = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [textPart, imagePart] }, // Order might matter, usually text first or interleaved
      ...(systemInstruction && { config: { systemInstruction } }),
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini API (generateTextAndImage) error:", error);
    if (error.message && error.message.includes("API key not valid")) {
        throw new Error("The Gemini API key is invalid or not authorized. Please check your API key.");
    }
    if (error.message && error.message.includes("fetch")) {
        throw new Error("A network error occurred while contacting the AI service. Please check your internet connection and try again.");
    }
    throw new Error(error.message || "An unknown error occurred while processing the image and text with Gemini.");
  }
};
