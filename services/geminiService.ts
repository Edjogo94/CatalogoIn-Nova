
import { GoogleGenAI, Type } from "@google/genai";
import { EnrichmentResponse } from "../types";

export const enrichProductData = async (productNames: string[]): Promise<EnrichmentResponse> => {
  try {
    const apiKey = process.env.API_KEY || "";
    if (!apiKey) {
      console.warn("API_KEY no encontrada en process.env");
      throw new Error("No API Key");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Actúa como un experto en marketing digital. Mejora la siguiente lista de productos para un catálogo premium en Colombia.
    Para cada producto, proporciona un nombre atractivo, categoría (Hogar, Belleza y Cuidado, Tecnología, Cocina, Organización, Herramientas), descripción corta y 3 beneficios.
    Lista: ${productNames.map((name, index) => `${index}: ${name}`).join(", ")}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalIndex: { type: Type.INTEGER },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  features: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["originalIndex", "name", "category", "description", "price", "features"]
              }
            }
          },
          required: ["products"]
        }
      }
    });

    if (!response || !response.text) {
      throw new Error("Respuesta vacía de Gemini");
    }

    return JSON.parse(response.text) as EnrichmentResponse;
  } catch (error) {
    console.error("Error en enrichProductData:", error);
    // Devolvemos una estructura vacía para que el frontend no rompa
    return { products: [] };
  }
};
