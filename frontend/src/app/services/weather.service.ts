import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    return this.http
      .get<WeatherData>(`${this.api}/weather`, { params })
      .pipe(map((data) => this.withLocalIcons(data)));
  }

  getAutoLocation(): Observable<WeatherData> {
    return this.http
      .get<WeatherData>(`${this.api}/geo`)
      .pipe(map((data) => this.withLocalIcons(data)));
  }

  searchCity(query: string): Observable<any[]> {
    return this.http.get<any[]>('https://nominatim.openstreetmap.org/search', {
      params: new HttpParams()
        .set('q', query)
        .set('format', 'json')
        .set('limit', '5'),
    });
  }

  private withLocalIcons(data: WeatherData): WeatherData {
    return {
      ...data,
      current: data.current
        ? { ...data.current, icon: this.resolveIcon(data.current) }
        : data.current,
      hourly: data.hourly?.map((hour) => ({
        ...hour,
        icon: this.resolveIcon(hour),
      })),
      daily: data.daily?.map((day) => ({
        ...day,
        icon: this.resolveIcon(day),
      })),
    };
  }

  private resolveIcon(
    weather: Pick<CurrentWeather | HourData | DailyData, 'condition_code' | 'icon'> & {
      time?: string;
      date?: string;
    },
  ): string {
    if (weather.icon && !weather.icon.includes('cdn.weather-ai.co')) {
      return weather.icon;
    }

    const code = Number.parseInt(weather.condition_code ?? '0', 10);
    const sourceTime = weather.time ?? weather.date;
    const hour = sourceTime ? new Date(sourceTime).getHours() : 12;
    const isNight =
      weather.icon?.toLowerCase().includes('night') || hour < 6 || hour >= 19;

    return weatherIconSvg(this.iconKind(code, isNight));
  }

  private iconKind(code: number, isNight: boolean): WeatherIconKind {
    if ([95, 96, 99].includes(code)) return 'storm';
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      return 'rain';
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
    if ([45, 48].includes(code)) return 'fog';
    if (code === 3) return 'cloudy';
    if ([1, 2].includes(code)) return isNight ? 'partly-cloudy-night' : 'partly-cloudy-day';
    return isNight ? 'clear-night' : 'clear-day';
  }
}

type WeatherIconKind =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'storm';

function weatherIconSvg(kind: WeatherIconKind): string {
  const cloud = `<path d="M31 58h54c8 0 14-6 14-14s-6-14-14-14h-2C80 20 70 13 59 13c-13 0-24 9-27 21h-1c-7 0-12 5-12 12s5 12 12 12Z" fill="#dbeafe"/><path d="M31 58h54c8 0 14-6 14-14s-6-14-14-14h-2C80 20 70 13 59 13c-13 0-24 9-27 21h-1c-7 0-12 5-12 12s5 12 12 12Z" fill="none" stroke="#8aa4c7" stroke-width="4" stroke-linejoin="round"/>`;
  const sun = `<circle cx="36" cy="34" r="16" fill="#ffd166"/><g stroke="#f59e0b" stroke-width="4" stroke-linecap="round"><path d="M36 8v8M36 52v8M10 34h8M54 34h8M18 16l6 6M54 16l-6 6M18 52l6-6M54 52l-6-6"/></g>`;
  const moon = `<path d="M57 14c-11 5-18 16-18 28 0 13 8 24 20 29-3 2-8 3-12 3-18 0-32-14-32-32S29 10 47 10c4 0 7 1 10 4Z" fill="#c7d2fe"/>`;

  const variants: Record<WeatherIconKind, string> = {
    'clear-day': sun,
    'clear-night': moon,
    'partly-cloudy-day': `${sun}<g transform="translate(10 16) scale(.86)">${cloud}</g>`,
    'partly-cloudy-night': `${moon}<g transform="translate(10 18) scale(.86)">${cloud}</g>`,
    cloudy: cloud,
    fog: `${cloud}<g stroke="#94a3b8" stroke-width="4" stroke-linecap="round"><path d="M20 74h76M28 88h60"/></g>`,
    rain: `${cloud}<g stroke="#38bdf8" stroke-width="5" stroke-linecap="round"><path d="M38 72l-7 14M59 72l-7 14M80 72l-7 14"/></g>`,
    snow: `${cloud}<g fill="#93c5fd"><circle cx="34" cy="80" r="4"/><circle cx="58" cy="88" r="4"/><circle cx="80" cy="80" r="4"/></g>`,
    storm: `${cloud}<path d="M60 64 47 90h14l-6 22 22-35H62l10-13H60Z" fill="#facc15" stroke="#eab308" stroke-width="3" stroke-linejoin="round"/>`,
  };

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112" role="img">${variants[kind]}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
