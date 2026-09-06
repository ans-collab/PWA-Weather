import { IPexelData } from "../engine/pexel.models";

export class PexelClient {
  static async getRandomImage(query: string): Promise<IPexelData | null> {
    const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

    if (!apiKey || !query.trim()) {
      console.error("PexelClient: API key or query is missing.", apiKey, query);
      return null;
    }

    try {
      const response: Response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=1`,
        {
          headers: {
            Authorization: apiKey,
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      const data: IPexelData = await response.json();
      return data;
    } catch {
      return null;
    }
  }
}
