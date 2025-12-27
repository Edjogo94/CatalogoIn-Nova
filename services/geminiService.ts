
import { GoogleGenAI, Type } from "@google/genai";
import { EnrichmentResponse } from "../types";

export const enrichProductData = async (productNames: string[]): Promise<EnrichmentResponse> => {
  try {
    // Intentamos obtener la clave. Si no existe, devolvemos datos vacíos sin lanzar error fatal.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "") {
      console.warn("API_KEY no configurada. El catálogo funcionará con datos básicos.");
      return { products: [] };
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
                  features: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["originalIndex", "name", "category", "description", "features"]
              }
            }
          },
          required: ["products"]
        }
      }
    });

    if (!response || !response.text) {
      throw new Error("Respuesta de IA vacía");
    }

    return JSON.parse(response.text) as EnrichmentResponse;
  } catch (error) {
    console.error("Error en servicio Gemini:", error);
    return { products: [] };
  }
};
