import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyData } from '../../services/weather.service';

@Component({
  selector: 'app-daily-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-forecast.component.html',
  styleUrls: ['./daily-forecast.component.scss'],
})
export class DailyForecastComponent {
  @Input() days: DailyData[] = [];

  getDayName(date: string, index: number): string {
    if (index === 0) return 'Today';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
  }

  get globalMin(): number {
    return Math.min(...this.days.map((d) => d.temp_min));
  }

  get globalMax(): number {
    return Math.max(...this.days.map((d) => d.temp_max));
  }

  getRangeLeft(d: DailyData): number {
    const span = this.globalMax - this.globalMin || 1;
    return ((d.temp_min - this.globalMin) / span) * 100;
  }

  getRangeWidth(d: DailyData): number {
    const span = this.globalMax - this.globalMin || 1;
    return ((d.temp_max - d.temp_min) / span) * 100;
  }
}
