import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
let model = null;

export const initGemini = (apiKey) => {
    try {
        genAI = new GoogleGenerativeAI(apiKey);
        // User requested gemini-3-flash-preview
        model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        localStorage.setItem("gemini_api_key", apiKey);
        return true;
    } catch (e) {
        console.error("Failed to initialize Gemini", e);
        return false;
    }
};

export const getStoredKey = () => {
    return localStorage.getItem("gemini_api_key");
}

export const startChatSession = (history = []) => {
    if (!model) throw new Error("Gemini not initialized");
    return model.startChat({
        history: history,
        generationConfig: {
            maxOutputTokens: 8000,
        },
    });
};

export const generateContent = async (prompt) => {
    if (!model) {
        throw new Error("Gemini not initialized");
    }

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (e) {
        console.error("Generation failed", e);
        throw e;
    }
};

export const generateContentWithImage = async (prompt, imageBase64, mimeType = "image/png") => {
    if (!model) throw new Error("Gemini not initialized");

    // For images, we might want to use a more capable model if flash struggles, but flash is generally good for multimodal too.
    // Ensure the model selection in init supports vision if separate. 1.5-flash supports it.

    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType
        }
    };

    try {
        const result = await model.generateContent([prompt, imagePart]);
        return result.response.text();
    } catch (e) {
        console.error("Multimodal generation failed", e);
        throw e;
    }
}
