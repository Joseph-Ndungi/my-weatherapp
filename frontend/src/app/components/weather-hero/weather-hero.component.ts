import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData } from '../../services/weather.service';

@Component({
  selector: 'app-weather-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-hero.component.html',
  styleUrls: ['./weather-hero.component.scss']
})
export class WeatherHeroComponent {
  @Input() data!: WeatherData;
  @Input() locationName = '';

  get localTime(): string {
    if (!this.data?.location?.localtime) return '';
    const dt = new Date(this.data.location.localtime);
    return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  get dayName(): string {
    if (!this.data?.location?.localtime) return '';
    return new Date(this.data.location.localtime).toLocaleDateString('en-US', { weekday: 'long' });
  }
}
