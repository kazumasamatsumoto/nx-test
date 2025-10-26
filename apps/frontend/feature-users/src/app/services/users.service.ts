import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserListResponse, CreateUserDto, UpdateUserDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/users';

  getUsers(page: number = 1, limit: number = 10): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(`${this.API_URL}?page=${page}&limit=${limit}`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.API_URL, user);
  }

  updateUser(id: number, user: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
