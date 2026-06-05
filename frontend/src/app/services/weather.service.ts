import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WeatherLocation {
  lat: number;
  lon: number;
  timezone: string;
  country: string;
  city?: string;
  region?: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  feels_like?: number;
  wind_speed: number;
  wind_direction: number;
  condition_code: string;
  icon: string;
  humidity?: number;
  uv_index?: number;
  visibility?: number;
  pressure?: number;
}

export interface HourData {
  time: string;
  temperature: number;
  feels_like: number;
  precipitation_probability: number;
  wind_speed: number;
  humidity: number;
  condition_code: string;
  icon: string;
  uv_index: number;
}

export interface DailyData {
  date: string;
  temp_max: number;
  temp_min: number;
  condition_code: string;
  icon: string;
  precipitation_probability: number;
  precipitation_sum?: number;
  wind_max?: number;
  sunrise?: string;
  sunset?: string;
}

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly?: HourData[];
  daily?: DailyData[];
  ai_summary?: string;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getWeatherByCoords(
    lat: number,
    lon: number,
    days = 7,
  ): Observable<WeatherData> {
    const params = new HttpParams()
      .set('lat', lat)
      .set('lon', lon)
      .set('days', days);
    return this.http.get<WeatherData>(`${this.api}/weather`, { params });
  }

  getAutoLocation(): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.api}/geo`);
  }

  searchCity(query: string): Observable<any[]> {
    return this.http.get<any[]>('https://nominatim.openstreetmap.org/search', {
      params: new HttpParams()
        .set('q', query)
        .set('format', 'json')
        .set('limit', '5'),
    });
  }
}
