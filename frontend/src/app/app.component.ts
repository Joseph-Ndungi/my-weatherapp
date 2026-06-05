import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  WeatherService,
  WeatherData,
  HourData,
  DailyData,
} from './services/weather.service';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { WeatherHeroComponent } from './components/weather-hero/weather-hero.component';
import { HourlyStripComponent } from './components/hourly-strip/hourly-strip.component';
import { DailyForecastComponent } from './components/daily-forecast/daily-forecast.component';

type BgTheme =
  | 'clear-day'
  | 'clear-night'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'fog'
  | 'snow';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SearchBarComponent,
    WeatherHeroComponent,
    HourlyStripComponent,
    DailyForecastComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  weather: WeatherData | null = null;
  loading = false;
  error = '';
  locationName = '';
  bgTheme: BgTheme = 'clear-day';

  get todayHours(): HourData[] {
    return this.weather?.hourly ?? [];
  }

  get forecastDays(): DailyData[] {
    return this.weather?.daily ?? [];
  }

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.loadByGeolocation();
  }

  loadByGeolocation() {
    if (!navigator.geolocation) {
      this.loadAutoIP();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => this.load(pos.coords.latitude, pos.coords.longitude, ''),
      () => this.loadAutoIP(),
    );
  }

  loadAutoIP() {
    this.loading = true;
    this.weatherService.getAutoLocation().subscribe({
      next: (data) => {
        this.weather = data;
        this.locationName = data.location?.city ?? data.location?.region ?? '';
        this.bgTheme = this.resolveBgTheme(data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not detect location. Search for a city above.';
      },
    });
  }

  load(lat: number, lon: number, name: string) {
    this.loading = true;
    this.error = '';
    this.locationName = name;
    this.weatherService.getWeatherByCoords(lat, lon).subscribe({
      next: (data) => {
        this.weather = data;
        this.locationName =
          name || data.location?.city || data.location?.region || '';
        this.bgTheme = this.resolveBgTheme(data);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load weather data.';
      },
    });
  }

  onLocationSelected(loc: { lat: number; lon: number; name: string }) {
    this.load(loc.lat, loc.lon, loc.name);
  }

  resolveBgTheme(data: WeatherData): BgTheme {
    const code = parseInt(data.current?.condition_code ?? '0', 10);
    const hour = new Date(data.current?.time ?? Date.now()).getHours();
    const isNight = hour < 6 || hour >= 19;

    if ([95, 96, 99].includes(code)) return 'storm';
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
      return 'rain';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
    if ([45, 48].includes(code)) return 'fog';
    if ([3].includes(code)) return 'cloudy';
    if ([1, 2].includes(code)) return isNight ? 'clear-night' : 'cloudy';
    return isNight ? 'clear-night' : 'clear-day';
  }
}
