import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Contrato, TipContrato } from '../interfaces/contrato.interface';

@Injectable({
  providedIn: 'root'
})
export class ContratoService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/contratos';
  private tiposUrl = '/api/v1/tipo-contratos';

  getContratos(): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(this.apiUrl).pipe(
      tap(contratos => console.log('Contratos/Reservas recibidos:', contratos))
    );
  }

  getContratoById(id: number): Observable<Contrato> {
    return this.http.get<Contrato>(`${this.apiUrl}/${id}`);
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

  // Tipos de Contrato
  getTiposContrato(): Observable<TipContrato[]> {
    return this.http.get<TipContrato[]>(this.tiposUrl);
  }
}
