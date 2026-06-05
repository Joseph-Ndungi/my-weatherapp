import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService, WeatherData, HourData } from './services/weather.service';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { WeatherHeroComponent } from './components/weather-hero/weather-hero.component';
import { HourlyStripComponent } from './components/hourly-strip/hourly-strip.component';
import { DailyForecastComponent } from './components/daily-forecast/daily-forecast.component';

type BgTheme = 'clear-day' | 'clear-night' | 'cloudy' | 'rain' | 'storm' | 'fog' | 'snow';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SearchBarComponent,
    WeatherHeroComponent,
    HourlyStripComponent,
    DailyForecastComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  weather: WeatherData | null = null;
  loading = false;
  error = '';
  locationName = '';
  bgTheme: BgTheme = 'clear-day';

  get todayHours(): HourData[] {
    return this.weather?.forecast?.forecastday?.[0]?.hour ?? [];
  }

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.loadByGeolocation();
  }

  loadByGeolocation() {
    if (!navigator.geolocation) { this.loadAutoIP(); return; }
    navigator.geolocation.getCurrentPosition(
      pos => this.load(pos.coords.latitude, pos.coords.longitude, ''),
      () => this.loadAutoIP()
    );
  }

  loadAutoIP() {
    this.loading = true;
    this.weatherService.getAutoLocation().subscribe({
      next: (data: any) => {
        const loc = data?.location ?? data?.geo ?? data;
        const lat = loc?.lat ?? data?.lat;
        const lon = loc?.lon ?? data?.lon;
        if (lat && lon) this.load(lat, lon, loc?.name ?? loc?.city ?? '');
        else this.error = 'Could not detect your location. Search for a city above.';
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not detect location. Search for a city above.';
      }
    });
  }

  load(lat: number, lon: number, name: string) {
    this.loading = true;
    this.error = '';
    this.locationName = name;
    this.weatherService.getWeatherByCoords(lat, lon).subscribe({
      next: data => {
        this.weather = data;
        this.locationName = name || data.location?.name || '';
        this.bgTheme = this.resolveBgTheme(data);
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load weather data.';
      }
    });
  }

  onLocationSelected(loc: { lat: number; lon: number; name: string }) {
    this.load(loc.lat, loc.lon, loc.name);
  }

  resolveBgTheme(data: WeatherData): BgTheme {
    const code = data.current?.condition?.code ?? 1000;
    const localtime = data.location?.localtime ?? '';
    const hour = localtime ? new Date(localtime).getHours() : new Date().getHours();
    const isNight = hour < 6 || hour >= 19;

    if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'storm';
    if ([1063,1066,1069,1072,1150,1153,1168,1171,1180,1183,1186,1189,1192,1195,1198,1201,
         1204,1207,1240,1243,1246,1249,1252].includes(code)) return 'rain';
    if ([1114,1117,1210,1213,1216,1219,1222,1225,1255,1258,1261,1264].includes(code)) return 'snow';
    if ([1135,1147].includes(code)) return 'fog';
    if ([1006,1009].includes(code)) return 'cloudy';
    if ([1003].includes(code)) return isNight ? 'clear-night' : 'cloudy';
    return isNight ? 'clear-night' : 'clear-day';
  }
}
