export interface IWeatherData {
    current: {
        time: Date;
        temperature_2m: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
        weather_code: number
        apparent_temperature: number;
    }
}