import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Category } from '../../../core/models/category.model';
import { ProductDTO } from '../../../core/models/product.model';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import Swal from 'sweetalert2';

/** Large enough to cover the category list in one call for the dropdown */
const CATEGORY_DROPDOWN_PAGE_SIZE = 100;

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  /** null = create mode; a product id = edit mode. */
  @Input() productId: number | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  categories: Category[] = [];
  isLoading = true;
  isSaving = false;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    isActive: [true],
    categoryId: [0, [Validators.required, Validators.min(1)]],
  });

  get isEditMode(): boolean {
    return this.productId !== null;
  }

  ngOnInit(): void {
    this.categoryService
      .getAllPager(CATEGORY_DROPDOWN_PAGE_SIZE, 1)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (result) => {
          this.categories = result.results;
          if (this.productId) {
            this.loadProductIntoForm(this.productId);
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

  private loadProductIntoForm(id: number): void {
    this.productService.getById(id).subscribe({
      next: (product) =>
        this.form.patchValue({
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          quantity: product.quantity,
          isActive: product.isActive,
          categoryId: product.categoryId,
        }),
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

    const dto: ProductDTO = {
      productId: this.productId ?? 0,
      categoryName: null,
      ...this.form.getRawValue(),
      description: this.form.getRawValue().description || null,
    };

    this.isSaving = true;

    const save$ = this.isEditMode ? this.productService.update(dto) : this.productService.create(dto);

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
