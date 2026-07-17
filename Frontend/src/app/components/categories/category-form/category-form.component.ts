import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CategoryDTO } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);

  /** null = create mode; a category id = edit mode. */
  @Input() categoryId: number | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isLoading = false;
  isSaving = false;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
  });

  get isEditMode(): boolean {
    return this.categoryId !== null;
  }

  ngOnInit(): void {
    if (!this.categoryId) {
      return;
    }

    this.isLoading = true;
    this.categoryService
      .getById(this.categoryId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (category) => this.form.patchValue({ name: category.name, description: category.description ?? '' }),
        error: (err: Error) => {
          Swal.fire({
            title: 'Error',
            text: err.message,
            icon: 'error',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        }
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: CategoryDTO = {
      categoryId: this.categoryId ?? 0,
      name: this.form.getRawValue().name,
      description: this.form.getRawValue().description || null,
    };

    this.isSaving = true;

    const save$ = this.isEditMode ? this.categoryService.update(dto) : this.categoryService.create(dto);

    save$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: (result) => {
        if (result.success) {
          this.saved.emit();
        } else {
          Swal.fire({
            title: 'Error',
            text: result.message ?? 'Something went wrong while saving.',
            icon: 'error',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        }
      },
      error: (err: Error) => {
        Swal.fire({
          title: 'Error',
          text: err.message,
          icon: 'error',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    });
  }
}
