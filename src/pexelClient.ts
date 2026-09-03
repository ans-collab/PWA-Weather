export class PexelClient {
    static async getRandomImage(query: string): Promise<string | null> {
        const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

        if (!apiKey || !query.trim()) {
            return null;
        }

        try {
            const response = await fetch(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
                {
                    headers: {
                        Authorization: apiKey,
                    },
                },
            );

            if (!response.ok) {
                return null;
            }

            const data: { photos?: Array<{ src?: { landscape?: string } }> } = await response.json();
            return data.photos?.[0]?.src?.landscape ?? null;
        } catch {
            return null;
        }
    }
}