import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ILoginResponse, IRegistroRequest } from '../interfaces/auth.interface';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = '/api/v1/auth';
  private loggedIn = new BehaviorSubject<boolean>(!!this.getToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  login(credentials: { usuario: string; password: string }): Observable<boolean> {
    return this.http.post<ILoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token_residencia', response.token);
          localStorage.setItem('user_id_persona', response.idPersona ? response.idPersona.toString() : '');
          localStorage.setItem('user_role', response.rol || '');
          localStorage.setItem('user_name', response.usuario || '');
          this.loggedIn.next(true);
        }
      }),
      map(response => !!response.token),
      catchError(() => {
        return of(false);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token_residencia');
    localStorage.removeItem('user_id_persona');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    this.loggedIn.next(false);
    this.router.navigate(['/home']);
  }

  getToken(): string | null {
    return localStorage.getItem('token_residencia');
  }

  getUserName(): string {
    return localStorage.getItem('user_name') || '';
  }

  /** ID de la persona que inició sesión (para filtrar "Mis Pagos" / "Mi Contrato") */
  getIdPersona(): number | null {
    const id = Number(localStorage.getItem('user_id_persona'));
    return id > 0 ? id : null;
  }

  getRole(): string {
    return localStorage.getItem('user_role') || '';
  }

  isAdministradora(): boolean {
    const role = this.getRole().toUpperCase();
    return role === 'ADMIN' || role === 'ADMINISTRADORA';
  }

  isGerente(): boolean {
    const role = this.getRole().toUpperCase();
    return role === 'GERENTE';
  }

  isAdmin(): boolean {
    return this.isAdministradora() || this.isGerente();
  }

  isEstudiante(): boolean {
    const role = this.getRole().toUpperCase();
    return role === 'ESTUDIANTE' || role === 'CLIENTE' || role === 'RESIDENTE';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  registrar(datos: IRegistroRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, datos);
  }
}
