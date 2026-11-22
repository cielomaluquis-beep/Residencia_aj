import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Habitacion } from '../interfaces/habitacion.interface';

@Injectable({
  providedIn: 'root'
})
export class HabitacionService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/habitaciones';

  getHabitaciones(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.apiUrl).pipe(
      tap(data => console.log('Habitaciones recibidas:', data))
    );
  }

  getHabitacionById(id: number): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.apiUrl}/${id}`);
  }

  createHabitacion(formData: FormData): Observable<Habitacion> {
    return this.http.post<Habitacion>(this.apiUrl, formData);
  }

  updateHabitacion(id: number, formData: FormData): Observable<Habitacion> {
    return this.http.put<Habitacion>(`${this.apiUrl}/${id}`, formData);
  }

  deleteHabitacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
