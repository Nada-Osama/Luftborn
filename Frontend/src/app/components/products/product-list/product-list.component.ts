import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { PagedResult } from '../../../core/models/paged-result.model';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { SearchBoxComponent } from '../../../shared/components/search-box/search-box.component';
import { ProductFormComponent } from '../product-form/product-form.component';
import Swal from 'sweetalert2';

const DEFAULT_PAGE_SIZE = 10;

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmDialogComponent,
    PaginatorComponent,
    SearchBoxComponent,
    ModalComponent,
    ProductFormComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);

  pagedResult: PagedResult<Product> | null = null;
  isLoading = false;

  pageNumber = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  keyword = '';

  productPendingDeletion: Product | null = null;

  isFormOpen = false;
  editingProductId: number | null = null;

  get products(): Product[] {
    return this.pagedResult?.results ?? [];
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;

    this.productService
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
    this.loadProducts();
  }

  onPageChange(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this.loadProducts();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageNumber = 1;
    this.loadProducts();
  }

  openCreateModal(): void {
    this.editingProductId = null;
    this.isFormOpen = true;
  }

  openEditModal(product: Product): void {
    this.editingProductId = product.productId;
    this.isFormOpen = true;
  }

  closeModal(): void {
    this.isFormOpen = false;
  }

  onSaved(): void {
    this.isFormOpen = false;
    this.loadProducts();
  }

  requestDelete(product: Product): void {
    this.productPendingDeletion = product;
  }

  cancelDelete(): void {
    this.productPendingDeletion = null;
  }

  confirmDelete(): void {
    if (!this.productPendingDeletion) {
      return;
    }

    const { productId } = this.productPendingDeletion;
    this.productService.delete(productId).subscribe({
      next: () => {
        this.productPendingDeletion = null;
        // Deleting the last row on a page beyond the first would otherwise leave the user staring at an empty page.
        if (this.products.length === 1 && this.pageNumber > 1) {
          this.pageNumber -= 1;
        }
        this.loadProducts();
      },
      error: (err: Error) => {
        this.productPendingDeletion = null;
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
