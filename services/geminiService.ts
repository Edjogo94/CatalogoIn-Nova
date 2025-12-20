
import { GoogleGenAI, Type } from "@google/genai";
import { EnrichmentResponse } from "../types";

export const enrichProductData = async (productNames: string[]): Promise<EnrichmentResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Actúa como un experto en marketing digital. Mejora la siguiente lista de productos para un catálogo premium en Colombia.
  Para cada producto en la lista, mantén su posición (índice) y proporciona:
  1. originalIndex: El número de posición en la lista (empezando desde 0).
  2. name: Un nombre comercial atractivo basado en el original.
  3. category: Una de estas: [Hogar, Belleza y Cuidado, Tecnología, Cocina, Organización, Herramientas].
  4. description: Una frase vendedora de máximo 100 caracteres.
  5. price: Un precio sugerido realista en COP (Pesos Colombianos) mayorista.
  6. features: 3 beneficios clave.
  
  Lista de productos: ${productNames.map((name, index) => `${index}: ${name}`).join(", ")}`;

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

  return JSON.parse(response.text) as EnrichmentResponse;
};
