import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WeatherData {
  location: { name: string; region: string; country: string; lat: number; lon: number; localtime: string };
  current: {
    temp_c: number; temp_f: number; feelslike_c: number;
    condition: { text: string; icon: string; code: number };
    wind_kph: number; wind_dir: string;
    humidity: number; uv: number; vis_km: number;
    precip_mm: number; pressure_mb: number;
  };
  forecast: { forecastday: ForecastDay[] };
  ai_summary?: string;
}

export interface ForecastDay {
  date: string;
  day: {
    maxtemp_c: number; mintemp_c: number;
    condition: { text: string; icon: string; code: number };
    totalprecip_mm: number; daily_chance_of_rain: number;
    avghumidity: number; uv: number;
  };
  hour: HourData[];
}

export interface HourData {
  time: string; temp_c: number;
  condition: { text: string; icon: string; code: number };
  chance_of_rain: number; humidity: number;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getWeatherByCoords(lat: number, lon: number, days = 7): Observable<WeatherData> {
    const params = new HttpParams()
      .set('lat', lat).set('lon', lon).set('days', days);
    return this.http.get<WeatherData>(`${this.api}/weather`, { params });
  }

  getAutoLocation(): Observable<any> {
    return this.http.get(`${this.api}/geo`);
  }

  searchCity(query: string): Observable<any> {
    // Use Nominatim (free, no key needed) for geocoding
    return this.http.get(`https://nominatim.openstreetmap.org/search`, {
      params: new HttpParams()
        .set('q', query).set('format', 'json').set('limit', '5')
    });
  }
}
