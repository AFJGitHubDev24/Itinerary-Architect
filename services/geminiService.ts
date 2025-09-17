import { GoogleGenAI } from "@google/genai";
import type { UserPreferences, Itinerary, GroundingChunk } from '../types';
import { AppError } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Generates a single image based on a prompt.
 * @param prompt The prompt for image generation.
 * @returns A base64 data URL of the image, or undefined if failed.
 */
async function generateDayImage(prompt: string): Promise<string | undefined> {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return undefined;
  } catch (error) {
    console.error("Image generation failed:", error);
    // Fail gracefully for a single image, don't block the whole itinerary
    return undefined;
  }
}

export async function generateItinerary(preferences: UserPreferences): Promise<{ itinerary: Itinerary | null, citations: GroundingChunk[] }> {
  const prompt = `
    You are an expert travel planner called 'Itinerary Architect'. Your task is to create a detailed, day-by-day travel itinerary based on the user's preferences.
    Use Google Search to find real-time information like opening hours, popular local spots, and addresses to make the itinerary as accurate and practical as possible.

    User Preferences:
    - Destination: ${preferences.destination}
    - Travel Dates: ${preferences.dates}
    - Budget: ${preferences.budget}
    - Interests: ${preferences.interests.join(', ')}
    - Travel Style: ${preferences.travelStyle}
    - Tone of Voice: ${preferences.tone}

    Please generate a complete itinerary. 
    
    The language and descriptions throughout the itinerary must adopt a **${preferences.tone}** tone of voice. For example, a 'Friendly' tone should be conversational and welcoming, while a 'Professional' tone should be more formal and direct.
    
    The pace and type of activities must reflect the user's specified **Travel Style**. For example, a 'Relaxed' style should have fewer activities per day with more downtime, while an 'Adventurous' style might include hiking or other outdoor activities.
    
    The suggestions for dining, accommodation, and activities must align with the user's **Budget**. For 'Budget-friendly', suggest affordable eateries, free attractions, and economical lodging. For 'Luxury', recommend fine dining, exclusive tours, and high-end hotels. For 'Moderate', provide a balanced mix.

    For each activity, provide a time, a title, a short and engaging description, a location or address if applicable, and categorize it into one of the following types: "Food", "Sightseeing", "Accommodation", "Travel", "Activity".
    **If a physical location or address exists, you MUST also provide its geographic coordinates as \`latitude\` and \`longitude\` numeric properties.**
    
    **Crucially, for any 'Accommodation' activity, the 'title' must be the name of a specific, real hotel that fits the budget, and the 'location' must be its full physical address to ensure map links work correctly.**

    The final output must be a single JSON object. Do not include any text, markdown formatting (like \`\`\`json), or any other characters before or after the JSON object. Just the raw JSON. The JSON schema should be:
    {
      "tripTitle": "string",
      "days": [
        {
          "day": "number",
          "title": "string",
          "activities": [
            {
              "time": "string",
              "title": "string",
              "type": "'Food' | 'Sightseeing' | 'Accommodation' | 'Travel' | 'Activity'",
              "description": "string",
              "location": "string (optional)",
              "latitude": "number (optional)",
              "longitude": "number (optional)"
            }
          ]
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    if (!response.candidates || response.candidates.length === 0 || !response.text) {
        const blockReason = response.promptFeedback?.blockReason;
        if (blockReason) {
            const message = `The request was blocked because it violates our safety policies (${blockReason}). Please modify your request and try again.`;
            throw new AppError(message, "Content Policy Violation");
        }
        throw new AppError("The AI returned an empty response. This might be due to a temporary issue or safety filters. Please try rephrasing your request.", "Empty Response from AI");
    }

    let jsonText = response.text.trim();
    
    // The model might still wrap the JSON in markdown, so we extract it.
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1];
    }

    if (!jsonText) {
        throw new AppError("The AI returned an empty response after processing. Please try again.", "Empty Response from AI");
    }
    
    let itinerary: Itinerary | null = null;
    try {
        itinerary = JSON.parse(jsonText) as Itinerary;
    } catch(e) {
        console.error("Failed to parse JSON response:", jsonText);
        throw new AppError("The AI returned a response that was not in the expected format. We're working on making this more reliable. Please try generating the trip again.", "Invalid AI Response");
    }

    // After successfully generating the text itinerary, generate images for each day.
    if (itinerary) {
      const imagePromises = itinerary.days.map(day => {
        const activityTitles = day.activities.map(a => a.title).slice(0, 3).join(', ');
        const imagePrompt = `A beautiful, vibrant, photorealistic travel photograph of ${preferences.destination}, capturing the essence of a day focused on "${day.title}" with activities like ${activityTitles}. Cinematic lighting, high detail, 16:9 aspect ratio.`;
        return generateDayImage(imagePrompt);
      });

      const imageUrls = await Promise.all(imagePromises);

      itinerary.days.forEach((day, index) => {
        if (imageUrls[index]) {
          day.headerImageUrl = imageUrls[index];
        }
      });
    }
    
    const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

    return { itinerary, citations };
  } catch (error) {
     if (error instanceof AppError) {
        // Re-throw custom errors to be caught by the UI component
        throw error;
    }
    
    console.error("Error generating itinerary:", error);

    if (error instanceof Error) {
        if (error.message.includes("API key")) {
            throw new AppError("The AI service is not configured correctly. Please check that the API key is valid.", "Configuration Error");
        }
        if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('failed to fetch')) {
             throw new AppError("Could not connect to the AI service. Please check your internet connection and try again.", "Connection Error");
        }
    }
    // Fallback for any other errors
    throw new AppError("An unexpected error occurred while generating your itinerary. Please try again later.", "Service Error");
  }
}