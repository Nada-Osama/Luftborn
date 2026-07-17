import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Category, CategoryDTO } from '../models/category.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/Categories`;

  getAllPager(pageSize: number, pageNumber: number, keyword = ''): Observable<PagedResult<Category>> {
    const params = new HttpParams()
      .set('pageSize', pageSize)
      .set('pageNumber', pageNumber)
      .set('keyword', keyword);

    return this.http.get<PagedResult<Category>>(`${this.baseUrl}/GetAllPager`, { params });
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/GetById/${id}`);
  }

  create(dto: CategoryDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/Create`, dto);
  }

  update(dto: CategoryDTO): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}/Update`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Delete/${id}`);
  }
}
