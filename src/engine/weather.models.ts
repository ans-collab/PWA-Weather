export interface IWeatherData {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    current_units: {
        time: string;
        interval: string;
        temperature_2m: string;
        relative_humidity_2m: string;
        apparent_temperature: string;
        weather_code: string;
        wind_speed_10m: string;
    };
    current: {
        time: string;
        interval: number;
        temperature_2m: number;
        relative_humidity_2m: number;
        apparent_temperature: number;
        weather_code: number;
        wind_speed_10m: number;
    };
    hourly_units: {
        time: string;
        temperature_2m: string;
        precipitation_probability: string;
        precipitation: string;
        weather_code: string;
    };
    hourly: {
        time: string[];
        temperature_2m: number[];
        precipitation_probability: number[];
        precipitation: number[];
        weather_code: number[];
    };
    daily_units: {
        time: string;
        weather_code: string;
        temperature_2m_max: string;
        temperature_2m_min: string;
        precipitation_probability_max: string;
    };
    daily: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_probability_max: number[];
    };
}