import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData, HourData } from '../../services/weather.service';

@Component({
  selector: 'app-weather-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-hero.component.html',
  styleUrls: ['./weather-hero.component.scss'],
})
export class WeatherHeroComponent {
  @Input() data!: WeatherData;
  @Input() locationName = '';
  @Input() hourly: HourData[] = [];

  get currentHour(): HourData | null {
    if (!this.hourly?.length) return null;
    const now = new Date().getHours();
    return (
      this.hourly.find((h) => new Date(h.time).getHours() === now) ??
      this.hourly[0]
    );
  }

  get localTime(): string {
    if (!this.data?.current?.time) return '';
    return new Date(this.data.current.time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  get dayName(): string {
    if (!this.data?.current?.time) return '';
    return new Date(this.data.current.time).toLocaleDateString('en-US', {
      weekday: 'long',
    });
  }

  get conditionLabel(): string {
    const code = parseInt(this.data?.current?.condition_code ?? '0', 10);
    const labels: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Icy fog',
      51: 'Light drizzle',
      53: 'Drizzle',
      55: 'Heavy drizzle',
      61: 'Light rain',
      63: 'Rain',
      65: 'Heavy rain',
      71: 'Light snow',
      73: 'Snow',
      75: 'Heavy snow',
      80: 'Rain showers',
      81: 'Showers',
      82: 'Heavy showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Severe thunderstorm',
    };
    return labels[code] ?? 'Clear sky';
  }
}
