import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { Habitacion } from '../interfaces/habitacion.interface';

@Injectable({
  providedIn: 'root'
})
export class HabitacionService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/habitaciones';

  private readonly fallbackHabitaciones: Habitacion[] = [
    { idHabitacion: 1, numero: 'A-101', piso: 1, descripcion: 'Habitación individual con escritorio, baño privado y excelente iluminación.', precio: 350, estado: 'D' },
    { idHabitacion: 2, numero: 'A-102', piso: 1, descripcion: 'Habitación amplia equipada para estudiante universitario con clóset y WiFi.', precio: 600, estado: 'D' },
    { idHabitacion: 3, numero: 'A-103', piso: 1, descripcion: 'Habitación confortable con vista exterior y servicios incluidos.', precio: 450, estado: 'O' },
    { idHabitacion: 4, numero: 'A-104', piso: 2, descripcion: 'Habitación en segundo piso, ambiente silencioso ideal para estudio.', precio: 400, estado: 'D' },
    { idHabitacion: 5, numero: 'A-205', piso: 2, descripcion: 'Mini departamento estudiantil ventilado con baño independiente.', precio: 480, estado: 'D' }
  ];

  getHabitaciones(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.apiUrl).pipe(
      tap(data => console.log('Habitaciones recibidas:', data)),
      catchError(() => of(this.fallbackHabitaciones))
    );
  }

  getHabitacionById(id: number): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(this.fallbackHabitaciones.find(h => h.idHabitacion === id) || this.fallbackHabitaciones[0]))
    );
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
