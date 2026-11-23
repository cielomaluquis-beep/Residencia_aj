import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ReporteService,
  ReporteIngresoMes,
  ReporteHabitacion,
  ReporteMetodoPago,
  ReporteContratoDetalle,
  ReporteTopCliente,
  ReporteNotificacionRol,
  SpResponse,
  SpDiccionarioResponse
} from '../../core/services/reporte.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  tabActiva: 'ingresos' | 'habitaciones' | 'metodos' | 'contratos' | 'topClientes' | 'notificaciones' | 'sp' = 'ingresos';

  ingresos: ReporteIngresoMes[] = [];
  habitaciones: ReporteHabitacion[] = [];
  metodos: ReporteMetodoPago[] = [];
  contratos: ReporteContratoDetalle[] = [];
  topClientes: ReporteTopCliente[] = [];
  notificacionesRol: ReporteNotificacionRol[] = [];
  loading = false;

  // Variables para prueba de SP de negocio
  spHabId: number = 1;
  spHabEstado: string = 'D';
  spHabResultado: SpResponse | null = null;

  spPagoContratoId: number = 1;
  spPagoUsuarioId: number = 1;
  spPagoMonto: number = 350.00;
  spPagoMetodo: string = 'Efectivo';
  spPagoResultado: SpResponse | null = null;

  // Variables para procedimientos de clase (P333, P334, P336)
  spUsuarioEsquema: string = 'RESIDENCIA_AJ';
  spClaseResultado: SpDiccionarioResponse | null = null;
  spClaseEjecutado: string = '';

  constructor(
    private reporteService: ReporteService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cambiarTab(tab: 'ingresos' | 'habitaciones' | 'metodos' | 'contratos' | 'topClientes' | 'notificaciones' | 'sp'): void {
    this.tabActiva = tab;
  }

  cargarDatos(): void {
    this.loading = true;
    this.reporteService.getIngresosMensuales().subscribe({
      next: (data) => (this.ingresos = data),
      error: () => {}
    });

    this.reporteService.getHabitacionesPorPiso().subscribe({
      next: (data) => (this.habitaciones = data),
      error: () => {}
    });

    this.reporteService.getMetodosPago().subscribe({
      next: (data) => (this.metodos = data),
      error: () => {}
    });

    this.reporteService.getTopClientes().subscribe({
      next: (data) => (this.topClientes = data),
      error: () => {}
    });

    this.reporteService.getNotificacionesPorRol().subscribe({
      next: (data) => (this.notificacionesRol = data),
      error: () => {}
    });

    this.reporteService.getContratosDetallados().subscribe({
      next: (data) => {
        this.contratos = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  ejecutarSpHabitacion(): void {
    this.reporteService.ejecutarSpCambiarEstadoHabitacion(this.spHabId, this.spHabEstado).subscribe({
      next: (res) => {
        this.spHabResultado = res;
        if (res.codigo === 0) {
          this.alertService.success(res.mensaje);
          this.cargarDatos();
        } else {
          this.alertService.warning(res.mensaje);
        }
      },
      error: (err) => {
        const msg = err.error?.mensaje || err.error?.message || err.statusText || err.message;
        this.alertService.error('Error al ejecutar SP: ' + msg);
      }
    });
  }

  ejecutarSpPago(): void {
    const payload = {
      idContrato: this.spPagoContratoId,
      idUsuario: this.spPagoUsuarioId,
      monto: this.spPagoMonto,
      metodoPago: this.spPagoMetodo
    };

    this.reporteService.ejecutarSpRegistrarPago(payload).subscribe({
      next: (res) => {
        this.spPagoResultado = res;
        if (res.codigo === 0) {
          this.alertService.success(res.mensaje);
          this.cargarDatos();
        } else {
          this.alertService.warning(res.mensaje);
        }
      },
      error: (err) => {
        const msg = err.error?.mensaje || err.error?.message || err.statusText || err.message;
        this.alertService.error('Error al ejecutar SP: ' + msg);
      }
    });
  }

  ejecutarSpClase(proc: 'p333' | 'p334' | 'p336'): void {
    this.spClaseEjecutado = proc.toUpperCase();
    this.reporteService.ejecutarSpDiccionario(proc, this.spUsuarioEsquema).subscribe({
      next: (res) => {
        this.spClaseResultado = res;
        if (res.codigo !== 0) {
          this.alertService.warning(res.mensaje);
        }
      },
      error: (err) => {
        const msg = err.error?.mensaje || err.error?.message || err.statusText || err.message;
        this.alertService.error('Error al ejecutar ' + proc.toUpperCase() + ': ' + msg);
      }
    });
  }
}
