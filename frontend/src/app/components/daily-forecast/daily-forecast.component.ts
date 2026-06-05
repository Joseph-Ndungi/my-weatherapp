import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForecastDay } from '../../services/weather.service';

@Component({
  selector: 'app-daily-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-forecast.component.html',
  styleUrls: ['./daily-forecast.component.scss']
})
export class DailyForecastComponent {
  @Input() days: ForecastDay[] = [];

  getDayName(date: string, index: number): string {
    if (index === 0) return 'Today';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
  }

  get globalMin(): number {
    return Math.min(...this.days.map(d => d.day.mintemp_c));
  }

  get globalMax(): number {
    return Math.max(...this.days.map(d => d.day.maxtemp_c));
  }

  getRangeLeft(d: ForecastDay): number {
    const span = this.globalMax - this.globalMin || 1;
    return ((d.day.mintemp_c - this.globalMin) / span) * 100;
  }

  getRangeWidth(d: ForecastDay): number {
    const span = this.globalMax - this.globalMin || 1;
    return ((d.day.maxtemp_c - d.day.mintemp_c) / span) * 100;
  }
}
