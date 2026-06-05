import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HourData } from '../../services/weather.service';

@Component({
  selector: 'app-hourly-strip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hourly-strip.component.html',
  styleUrls: ['./hourly-strip.component.scss'],
})
export class HourlyStripComponent {
  @Input() hours: HourData[] = [];

  getHourLabel(time: string): string {
    const h = new Date(time).getHours();
    if (h === 0) return '12am';
    if (h === 12) return 'Noon';
    return h < 12 ? `${h}am` : `${h - 12}pm`;
  }

  isCurrentHour(time: string): boolean {
    return new Date(time).getHours() === new Date().getHours();
  }
}
