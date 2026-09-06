export interface ILocationData {
    longitude: number;
    latitude: number;
    address: {
        city: string;
        state: string;
        country: string;
    }
}