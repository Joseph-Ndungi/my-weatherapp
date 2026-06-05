import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../../services/weather.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of, catchError } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Output() locationSelected = new EventEmitter<{ lat: number; lon: number; name: string }>();

  query = '';
  results: any[] = [];
  searching = false;
  private search$ = new Subject<string>();

  constructor(private weather: WeatherService) {
    this.search$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(q => {
        if (q.length < 2) return of([]);
        this.searching = true;
        return this.weather.searchCity(q).pipe(catchError(() => of([])));
      })
    ).subscribe(results => {
      this.results = results;
      this.searching = false;
    });
  }

  onInput() { this.search$.next(this.query); }

  select(result: any) {
    this.locationSelected.emit({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      name: result.display_name.split(',').slice(0, 2).join(',')
    });
    this.query = result.display_name.split(',')[0];
    this.results = [];
  }

  clear() { this.query = ''; this.results = []; }
}
