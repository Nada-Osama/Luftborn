import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

/**
 * Wraps the debounce/distinct logic once instead of duplicating a Subject + pipe in both product-list and category-list,
 * which need identical "wait for the user to stop typing, then search" behavior.
 */
@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss',
})
export class SearchBoxComponent implements OnDestroy {
  @Input() placeholder = 'Search…';
  @Output() searchChange = new EventEmitter<string>();

  term = '';

  private readonly termChanged = new Subject<string>();

  constructor() {
    this.termChanged.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => this.searchChange.emit(term));
  }

  onInput(value: string): void {
    this.term = value;
    this.termChanged.next(value.trim());
  }

  ngOnDestroy(): void {
    this.termChanged.complete();
  }
}
