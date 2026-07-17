import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { Category } from '../../../core/models/category.model';
import { PagedResult } from '../../../core/models/paged-result.model';
import { CategoryService } from '../../../core/services/category.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { SearchBoxComponent } from '../../../shared/components/search-box/search-box.component';
import { CategoryFormComponent } from '../category-form/category-form.component';
import Swal from 'sweetalert2';

const DEFAULT_PAGE_SIZE = 10;

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmDialogComponent,
    PaginatorComponent,
    SearchBoxComponent,
    ModalComponent,
    CategoryFormComponent,
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);

  pagedResult: PagedResult<Category> | null = null;
  isLoading = false;

  pageNumber = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  keyword = '';

  /** Add/Edit happens in a modal on this same page rather than inline in the table. */
  isFormOpen = false;
  editingCategoryId: number | null = null;

  categoryPendingDeletion: Category | null = null;

  get categories(): Category[] {
    return this.pagedResult?.results ?? [];
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService
      .getAllPager(this.pageSize, this.pageNumber, this.keyword)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (result) => (this.pagedResult = result),
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

  onSearchChange(keyword: string): void {
    this.keyword = keyword;
    this.pageNumber = 1;
    this.loadCategories();
  }

  onPageChange(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this.loadCategories();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageNumber = 1;
    this.loadCategories();
  }

  openCreateModal(): void {
    this.editingCategoryId = null;
    this.isFormOpen = true;
  }

  openEditModal(category: Category): void {
    this.editingCategoryId = category.categoryId;
    this.isFormOpen = true;
  }

  closeModal(): void {
    this.isFormOpen = false;
  }

  onSaved(): void {
    this.isFormOpen = false;
    this.loadCategories();
  }

  requestDelete(category: Category): void {
    this.categoryPendingDeletion = category;
  }

  cancelDelete(): void {
    this.categoryPendingDeletion = null;
  }

  confirmDelete(): void {
    if (!this.categoryPendingDeletion) {
      return;
    }

    const { categoryId } = this.categoryPendingDeletion;
    this.categoryService.delete(categoryId).subscribe({
      next: () => {
        this.categoryPendingDeletion = null;
        if (this.categories.length === 1 && this.pageNumber > 1) {
          this.pageNumber -= 1;
        }
        this.loadCategories();
      },
      error: (err: Error) => {
        this.categoryPendingDeletion = null;
        Swal.fire({
          title: 'Error',
          text: err.message,
          icon: 'error',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      },
    });
  }
}
