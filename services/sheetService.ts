
import { Product } from '../types';

export const fetchProductsFromSheet = async (scriptUrl: string): Promise<Product[]> => {
  try {
    const response = await fetch(`${scriptUrl}?action=read`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching from sheet:", error);
    throw error;
  }
};

export const syncProductsToSheet = async (scriptUrl: string, products: Product[]): Promise<boolean> => {
  try {
    // Al usar Content-Type text/plain, evitamos que el navegador haga una petición OPTIONS (preflight)
    // que Google Apps Script no maneja correctamente. El script debe parsear el body.
    const response = await fetch(`${scriptUrl}?action=writeBatch`, {
      method: 'POST',
      body: JSON.stringify({ products }),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error syncing to sheet:", error);
    return false;
  }
};
