import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PagedResult } from '../models/paged-result.model';
import { Product, ProductDTO } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/Products`;

  getAllPager(pageSize: number, pageNumber: number, keyword = ''): Observable<PagedResult<Product>> {
    const params = new HttpParams()
      .set('pageSize', pageSize)
      .set('pageNumber', pageNumber)
      .set('keyword', keyword);

    return this.http.get<PagedResult<Product>>(`${this.baseUrl}/GetAllPager`, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/GetById/${id}`);
  }

  create(dto: ProductDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/Create`, dto);
  }

  update(dto: ProductDTO): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}/Update`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Delete/${id}`);
  }
}
