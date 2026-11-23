import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { Contrato, TipContrato } from '../interfaces/contrato.interface';

@Injectable({
  providedIn: 'root'
})
export class ContratoService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/contratos';
  private tiposUrl = '/api/v1/tipo-contratos';

  private readonly fallbackContratos: Contrato[] = [
    { idContrato: 21, idTipoContrato: 3, idCliente: 21, idUsuario: 1, idHabitacion: 21, fechaReserva: '2026-11-16', fechaInicio: '2026-11-16', fechaFin: '2027-11-16', monto: 400.0, metodoPago: 'Yape', imgPagoReserva: 'b8bdac37-2080-4238-8a12-83254688aeae_pago400.jpeg', estado: 'A' },
    { idContrato: 22, idTipoContrato: 2, idCliente: 22, idUsuario: 1, idHabitacion: 21, fechaReserva: '2026-11-23', fechaInicio: '2026-11-23', fechaFin: '2027-05-23', monto: 400.0, metodoPago: 'Yape', imgPagoReserva: '6edb1128-8532-4ead-9102-0b479412f7cb_pago400.jpeg', estado: 'A' },
    { idContrato: 1, idTipoContrato: 1, idCliente: 2, idUsuario: 1, idHabitacion: 2, fechaReserva: '2026-11-05', fechaInicio: '2026-11-05', fechaFin: '2026-12-05', monto: 480.0, metodoPago: 'Efectivo', imgPagoReserva: 'no-image.png', estado: 'R' },
    { idContrato: 2, idTipoContrato: 1, idCliente: 3, idUsuario: 1, idHabitacion: 4, fechaReserva: '2026-11-05', fechaInicio: '2026-11-05', fechaFin: '2026-12-11', monto: 450.0, metodoPago: 'Plin', imgPagoReserva: 'no-image.png', estado: 'A' }
  ];

  private readonly fallbackTipos: TipContrato[] = [
    { idTipoContrato: 1, nombre: 'Mensual', estado: '1' },
    { idTipoContrato: 2, nombre: 'Semestral', estado: '1' },
    { idTipoContrato: 3, nombre: 'Anual', estado: '1' }
  ];

  getContratos(): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(this.apiUrl).pipe(
      tap(contratos => console.log('Contratos/Reservas recibidos:', contratos)),
      catchError(() => of(this.fallbackContratos))
    );
  }

  getContratoById(id: number): Observable<Contrato> {
    return this.http.get<Contrato>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(this.fallbackContratos.find(c => c.idContrato === id) || this.fallbackContratos[0]))
    );
  }

  createContrato(formData: FormData): Observable<Contrato> {
    return this.http.post<Contrato>(this.apiUrl, formData);
  }

  updateContrato(id: number, formData: FormData): Observable<Contrato> {
    return this.http.put<Contrato>(`${this.apiUrl}/${id}`, formData);
  }

  deleteContrato(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTiposContrato(): Observable<TipContrato[]> {
    return this.http.get<TipContrato[]>(this.tiposUrl).pipe(
      catchError(() => of(this.fallbackTipos))
    );
  }
}
