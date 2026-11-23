import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { Pago } from '../interfaces/pago.interface';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/pagos';

  private readonly fallbackPagos: Pago[] = [
    { idPago: 1, idContrato: 1, idUsuario: 1, monto: 480.0, fecha: '2026-11-05', metodoPago: 'Plin', imgPago: '0a243433-8728-44a1-abda-24628ff1a0fc_clase10-1.png', estado: 'A' },
    { idPago: 2, idContrato: 2, idUsuario: 1, monto: 450.0, fecha: '2026-11-05', metodoPago: 'Plin', imgPago: '4074e093-8d6f-48ed-8256-042e1cf38c86_HabitacionA101.jpeg', estado: 'A' },
    { idPago: 63, idContrato: 21, idUsuario: 1, monto: 400.0, fecha: '2026-12-16', metodoPago: 'Yape', imgPago: '535248a4-c588-48fb-8355-1b344621cd45_pago400.jpeg', estado: 'A' },
    { idPago: 64, idContrato: 21, idUsuario: 1, monto: 400.0, fecha: '2026-11-16', metodoPago: 'Yape', imgPago: '5a08251c-cb10-438d-abd9-cf670e3157ea_pago400.jpeg', estado: 'A' },
    { idPago: 41, idContrato: 2, idUsuario: 1, monto: 300.0, fecha: '2026-11-21', metodoPago: 'Yape', imgPago: '5a312847-5a1e-47a7-a81a-e02a3ce33abe_yape.jpeg', estado: 'A' },
    { idPago: 44, idContrato: 2, idUsuario: 1, monto: 450.0, fecha: '2026-12-21', metodoPago: 'Yape', imgPago: '24925408-5d9a-403b-b8e8-c8449da4854d_yape2.jpeg', estado: 'A' },
    { idPago: 42, idContrato: 2, idUsuario: 1, monto: 450.0, fecha: '2026-11-21', metodoPago: 'Yape', imgPago: '8a094d05-713a-43d8-b697-50458fd45a91_yape.jpeg', estado: 'A' },
    { idPago: 45, idContrato: 1, idUsuario: 1, monto: 480.0, fecha: '2026-12-05', metodoPago: 'Yape', imgPago: '2f71e7d4-911e-4fe2-a88e-73758b1b2420_yape3.jpeg', estado: 'A' },
    { idPago: 61, idContrato: 2, idUsuario: 1, monto: 300.0, fecha: '2026-11-20', metodoPago: 'Yape', imgPago: '97834da7-8bdf-496e-8372-a08ae1e14acd_yape.jpeg', estado: 'A' }
  ];

  getPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.apiUrl).pipe(
      tap(pagos => console.log('Pagos recibidos:', pagos)),
      catchError(() => of(this.fallbackPagos))
    );
  }

  getPagoById(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(this.fallbackPagos.find(p => p.idPago === id) || this.fallbackPagos[0]))
    );
  }

  createPago(formData: FormData): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, formData);
  }

  updatePago(id: number, formData: FormData): Observable<Pago> {
    return this.http.put<Pago>(`${this.apiUrl}/${id}`, formData);
  }

  deletePago(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
