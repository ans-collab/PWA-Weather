import { ILocationData } from "../engine/location.models";

export class LocationClient {
    static getCurrentLocation(): Promise<GeolocationPosition | null> {
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

    static getGeoLocation(longitude: string, latitude: string): Promise<ILocationData> {
        return new Promise(async (resolve, reject) => {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await response.json();
            resolve({
                address: {
                    city: data.address.town || "",
                    state: data.address.state || "",
                    country: data.address.country || ""
                }
            });
        });
    }
}