import { ILocationData } from "../engine/location.models";

export class LocationClient {
    // checks if localtion permission is enabled.
    static async isGeolocationEnabled(): Promise<boolean> {
        if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
            return false;
        }

        try {
            const permission = await navigator.permissions.query({ name: "geolocation" });
            return permission.state === "granted";
        } catch {
            return false;
        }
    }

    // gets the current location of the user.
    static async getCurrentLocation(): Promise<GeolocationPosition | null> {
        if (!navigator.geolocation) {
            return null;
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position: GeolocationPosition) => {
                    resolve(position);
                },
                (error: GeolocationPositionError) => {
                    console.error("LocationClient: Error getting current location", error);
                    reject(error);
                }
            );
        });
    }

    // gets the geolocation (city, state) based on the provided longitude and latitude.
    static async getGeoLocation(longitude: string, latitude: string): Promise<ILocationData> {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await response.json();
        return {

            longitude: parseFloat(longitude),
            latitude: parseFloat(latitude),
            address: {
                city: data.address.town || "",
                state: data.address.state || "",
                country: data.address.country || ""
            }
        };
    }

    // gets the geolocation (city, state) based on the provided city and state.
    static async getGeoLocationByCityAndState(city: string, state: string): Promise<ILocationData> {
        const params = new URLSearchParams({
            q: `${city}, ${state}`,
            format: "json",
            addressdetails: "1",
            limit: "1"
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);

        if (!response.ok) {
            throw new Error("Failed to get location by city and state");
        }

        const results = await response.json();
        const data = results[0];
        if (!data) {
            throw new Error(`Location not found for ${city}, ${state}`);
        }

        return {
            longitude: parseFloat(data.lon),
            latitude: parseFloat(data.lat),
            address: {
                city: data.address.city || data.address.town || data.address.village || "",
                state: data.address.state || "",
                country: data.address.country || ""
            }
        };
    }
}