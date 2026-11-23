import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';

export interface ReporteIngresoMes {
  periodo: string;
  totalPagos: number;
  totalMonto: number;
  promedioPago: number;
}

export interface ReporteHabitacion {
  piso: number;
  totalHabitaciones: number;
  disponibles: number;
  ocupadas: number;
  mantenimiento: number;
}

export interface ReporteMetodoPago {
  metodoPago: string;
  cantidadTransacciones: number;
  montoTotal: number;
  porcentajeUso: number;
}

export interface ReporteContratoDetalle {
  idContrato: number;
  clienteNombre: string;
  nroDocumento: string;
  telefono: string;
  numeroHabitacion: string;
  piso: number;
  tipoContrato: string;
  fechaInicio: string;
  fechaFin: string;
  montoPactado: number;
  estadoContrato: string;
}

export interface ReporteTopCliente {
  idCliente: number;
  cliente: string;
  nroDocumento: string;
  nroPagos: number;
  totalPagado: number;
}

export interface ReporteNotificacionRol {
  rol: string;
  sinLeer: number;
}

export interface SpResponse {
  codigo: number;
  mensaje: string;
  idGenerado?: number;
}

export interface SpDiccionarioResponse {
  codigo: number;
  mensaje: string;
  lineas: string[];
  salidaTexto: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  getIngresosMensuales(): Observable<ReporteIngresoMes[]> {
    return this.http.get<ReporteIngresoMes[]>(`${this.apiUrl}/reportes/ingresos-mensuales`).pipe(
      catchError(() => of([
        { periodo: '2026-12', totalPagos: 3, totalMonto: 1330.00, promedioPago: 443.33 },
        { periodo: '2026-11', totalPagos: 6, totalMonto: 2380.00, promedioPago: 396.67 }
      ]))
    );
  }

  getHabitacionesPorPiso(): Observable<ReporteHabitacion[]> {
    return this.http.get<ReporteHabitacion[]>(`${this.apiUrl}/reportes/habitaciones-piso`).pipe(
      catchError(() => of([
        { piso: 1, totalHabitaciones: 3, disponibles: 2, ocupadas: 1, mantenimiento: 0 },
        { piso: 2, totalHabitaciones: 3, disponibles: 3, ocupadas: 0, mantenimiento: 0 }
      ]))
    );
  }

  getMetodosPago(): Observable<ReporteMetodoPago[]> {
    return this.http.get<ReporteMetodoPago[]>(`${this.apiUrl}/reportes/metodos-pago`).pipe(
      catchError(() => of([
        { metodoPago: 'YAPE', cantidadTransacciones: 7, montoTotal: 2780.00, porcentajeUso: 77.78 },
        { metodoPago: 'PLIN', cantidadTransacciones: 2, montoTotal: 930.00, porcentajeUso: 22.22 }
      ]))
    );
  }

  getContratosDetallados(): Observable<ReporteContratoDetalle[]> {
    return this.http.get<ReporteContratoDetalle[]>(`${this.apiUrl}/reportes/contratos-detallados`).pipe(
      catchError(() => of([
        { idContrato: 21, clienteNombre: 'Diana Suarez Rengifo', nroDocumento: '45789632', telefono: '987654147', numeroHabitacion: 'A-104', piso: 2, tipoContrato: 'Anual', fechaInicio: '16/11/2026', fechaFin: '16/11/2027', montoPactado: 400.0, estadoContrato: 'A' },
        { idContrato: 22, clienteNombre: 'Carlos Mendoza Sanchez', nroDocumento: '21568496', telefono: '923456785', numeroHabitacion: 'A-104', piso: 2, tipoContrato: 'Semestral', fechaInicio: '23/11/2026', fechaFin: '23/05/2027', montoPactado: 400.0, estadoContrato: 'A' },
        { idContrato: 1, clienteNombre: 'Maria Linarez Cueva', nroDocumento: '23457896', telefono: '987654321', numeroHabitacion: 'A-205', piso: 2, tipoContrato: 'Mensual', fechaInicio: '05/11/2026', fechaFin: '05/12/2026', montoPactado: 480.0, estadoContrato: 'R' },
        { idContrato: 2, clienteNombre: 'Juan Perez Gomez', nroDocumento: '86451237', telefono: '975612348', numeroHabitacion: 'A-103', piso: 1, tipoContrato: 'Mensual', fechaInicio: '05/11/2026', fechaFin: '11/12/2026', montoPactado: 450.0, estadoContrato: 'A' }
      ]))
    );
  }

  getTopClientes(): Observable<ReporteTopCliente[]> {
    return this.http.get<ReporteTopCliente[]>(`${this.apiUrl}/reportes/top-clientes`).pipe(
      catchError(() => of([
        { idCliente: 3, cliente: 'Juan Perez Gomez', nroDocumento: '86451237', nroPagos: 5, totalPagado: 1950.00 },
        { idCliente: 2, cliente: 'Maria Linarez Cueva', nroDocumento: '23457896', nroPagos: 2, totalPagado: 960.00 },
        { idCliente: 21, cliente: 'Diana Suarez Rengifo', nroDocumento: '45789632', nroPagos: 2, totalPagado: 800.00 }
      ]))
    );
  }

  getNotificacionesPorRol(): Observable<ReporteNotificacionRol[]> {
    return this.http.get<ReporteNotificacionRol[]>(`${this.apiUrl}/reportes/notificaciones-rol`).pipe(
      catchError(() => of([
        { rol: 'Administradora', sinLeer: 3 },
        { rol: 'Gerente', sinLeer: 2 },
        { rol: 'Estudiante', sinLeer: 2 }
      ]))
    );
  }

  ejecutarSpCambiarEstadoHabitacion(idHabitacion: number, nuevoEstado: string): Observable<SpResponse> {
    return this.http.post<SpResponse>(`${this.apiUrl}/procedimientos/cambiar-estado-habitacion`, {
      idHabitacion,
      nuevoEstado
    });
  }

  ejecutarSpRegistrarPago(datos: { idContrato: number; idUsuario: number; monto: number; metodoPago: string }): Observable<SpResponse> {
    return this.http.post<SpResponse>(`${this.apiUrl}/procedimientos/registrar-pago`, datos);
  }

  ejecutarSpDiccionario(proc: 'p333' | 'p334' | 'p336', usuario: string): Observable<SpDiccionarioResponse> {
    return this.http.get<SpDiccionarioResponse>(`${this.apiUrl}/procedimientos/${proc}`, {
      params: { usuario }
    });
  }
}
