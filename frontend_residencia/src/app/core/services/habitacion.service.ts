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
    { idHabitacion: 1, numero: 'A-101', piso: 1, descripcion: 'Habitación con baño propio', precio: 350.0, imgHabitacion: 'd47bfcbc-1dd6-447d-a40e-0851baf9fec6_HabitacionA101.jpeg', estado: 'O' },
    { idHabitacion: 2, numero: 'A-205', piso: 2, descripcion: 'Habitación matrimonial', precio: 480.0, imgHabitacion: '758ddd45-dd41-4cd9-94df-57de7f8263b7_Habitacion205.jpg', estado: 'D' },
    { idHabitacion: 3, numero: 'A-102', piso: 1, descripcion: 'Mini Departamento 2 habitaciones', precio: 600.0, imgHabitacion: '02c44457-78c7-45f3-8972-35d22d0caaa4_mini departamento.jpeg', estado: 'D' },
    { idHabitacion: 21, numero: 'A-104', piso: 2, descripcion: 'Es cómoda para un estudiante porque tiene buena iluminación entre otras cosas.', precio: 400.0, imgHabitacion: 'ede22557-d81e-45a8-ad4e-e021f5e877f9_A-104.jpeg', estado: 'D' },
    { idHabitacion: 22, numero: 'A-106', piso: 2, descripcion: 'Habitación muy ventilada y baño propio', precio: 500.0, imgHabitacion: '2ede46ef-5a63-4ee4-b8ae-deeb9bd58642_hab-106.jpg', estado: 'D' },
    { idHabitacion: 4, numero: 'A-103', piso: 1, descripcion: 'Habitación matrimonial', precio: 450.0, imgHabitacion: '0458679d-5f28-4ba6-886c-5ace2e9b0f3e_HabitacionA101.jpeg', estado: 'D' }
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
