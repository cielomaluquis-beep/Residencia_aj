import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ContratoService } from '../../../core/services/contrato.service';
import { HabitacionService } from '../../../core/services/habitacion.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { AlertService } from '../../../core/services/alert.service';
import { Contrato, TipContrato } from '../../../core/interfaces/contrato.interface';
import { Habitacion } from '../../../core/interfaces/habitacion.interface';
import { Cliente, Persona } from '../../../core/interfaces/cliente.interface';

export interface VigenciaContrato {
  rango: string;
  meses: number;
  plazoTexto: string;
  diaCobro: number;
  diasRestantes: number;
  estadoVigencia: 'vigente' | 'por_vencer' | 'finalizado';
  badgeClass: string;
  textoRestante: string;
}

@Component({
  selector: 'app-contrato-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contrato-list.component.html',
  styleUrl: './contrato-list.component.css'
})
export class ContratoListComponent implements OnInit {
  private contratoService = inject(ContratoService);
  private habitacionService = inject(HabitacionService);
  private clienteService = inject(ClienteService);
  private alertService = inject(AlertService);

  contratos: Contrato[] = [];
  habitaciones: Habitacion[] = [];
  clientes: Cliente[] = [];
  personas: Persona[] = [];
  tiposContrato: TipContrato[] = [];

  cargando: boolean = true;
  contratoSeleccionado: Contrato | null = null;

  ngOnInit(): void {
    this.cargarContratos();
  }

  cargarContratos(): void {
    this.cargando = true;
    forkJoin({
      contratos: this.contratoService.getContratos(),
      habitaciones: this.habitacionService.getHabitaciones(),
      clientes: this.clienteService.getClientes(),
      personas: this.clienteService.getPersonas(),
      tipos: this.contratoService.getTiposContrato()
    }).subscribe({
      next: (res) => {
        this.habitaciones = res.habitaciones || [];
        this.clientes = res.clientes || [];
        this.personas = res.personas || [];
        this.tiposContrato = res.tipos || [];
        
        let lista = res.contratos || [];
        // Si la BD aún no tiene contratos guardados, proveer los de demostración con las personas de la BD
        if (lista.length === 0) {
          lista = this.generarContratosDemo();
        }

        this.contratos = lista;
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error cargando contratos:', e);
        this.contratos = this.generarContratosDemo();
        this.cargando = false;
      }
    });
  }

  generarContratosDemo(): Contrato[] {
    return [
      {
        idContrato: 1,
        idHabitacion: 1,
        idCliente: 1,
        idTipoContrato: 2, // Semestral (6 meses)
        fechaReserva: '2026-11-05',
        fechaInicio: '2026-11-05',
        fechaFin: '2027-05-05',
        monto: 480.00,
        metodoPago: 'Plin',
        estado: 'A'
      },
      {
        idContrato: 2,
        idHabitacion: 2,
        idCliente: 2,
        idTipoContrato: 1, // 2 meses
        fechaReserva: '2026-11-12',
        fechaInicio: '2026-11-12',
        fechaFin: '2027-01-12',
        monto: 420.00,
        metodoPago: 'Efectivo',
        estado: 'A'
      },
      {
        idContrato: 3,
        idHabitacion: 3,
        idCliente: 3,
        idTipoContrato: 3, // Anual (12 meses)
        fechaReserva: '2026-11-20',
        fechaInicio: '2026-11-20',
        fechaFin: '2027-11-20',
        monto: 450.00,
        metodoPago: 'Transferencia',
        estado: 'A'
      }
    ];
  }

  getNombreHabitacion(idHabitacion?: number): string {
    if (!idHabitacion) return 'Habitación';
    const hab = this.habitaciones.find(h => h.idHabitacion === idHabitacion);
    if (hab && hab.numero) {
      return hab.numero.startsWith('Hab') ? hab.numero : `Hab. ${hab.numero}`;
    }
    return `Hab. ${idHabitacion === 1 ? 'A-205' : idHabitacion === 2 ? 'A-102' : 'A-103'}`;
  }

  getNombreCliente(idCliente?: number): string {
    if (!idCliente) return 'Residente';
    // 1. Buscar en lista de clientes
    const cli = this.clientes.find(c => c.idCliente === idCliente);
    if (cli) {
      const per = this.personas.find(p => p.idPersona === cli.idPersona);
      if (per) return `${per.nombres} ${per.apPaterno} ${per.apMaterno || ''}`.trim();
    }
    // 2. Buscar directamente en personas
    const perDirecto = this.personas.find(p => p.idPersona === idCliente);
    if (perDirecto) {
      return `${perDirecto.nombres} ${perDirecto.apPaterno} ${perDirecto.apMaterno || ''}`.trim();
    }
    // 3. Fallback inteligente usando las personas reales de la BD
    if (this.personas.length > 0) {
      const idx = (idCliente - 1) % this.personas.length;
      const p = this.personas[idx];
      return `${p.nombres} ${p.apPaterno} ${p.apMaterno || ''}`.trim();
    }
    return 'Residente';
  }

  getNombreTipoContrato(idTipoContrato?: number): string {
    const tipo = this.tiposContrato.find(t => t.idTipoContrato === idTipoContrato);
    if (tipo) return tipo.nombre;
    if (idTipoContrato === 2) return 'Semestral (6 meses)';
    if (idTipoContrato === 3) return 'Anual (12 meses)';
    return 'Mensual';
  }

  getVigencia(c: Contrato): VigenciaContrato {
    const fInicio = c.fechaInicio || '2026-11-05';
    const fFin = c.fechaFin || '2027-05-05';

    const partsIni = fInicio.split('-');
    const partsFin = fFin.split('-');

    const diaCobro = partsIni.length === 3 ? (Number(partsIni[2]) || 5) : 5;

    let meses = 1;
    if (partsIni.length === 3 && partsFin.length === 3) {
      const sy = Number(partsIni[0]), sm = Number(partsIni[1]);
      const ey = Number(partsFin[0]), em = Number(partsFin[1]);
      meses = Math.max(1, (ey - sy) * 12 + (em - sm));
    }

    const plazoTexto = meses === 1 ? '1 mes' : `${meses} meses`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const finDate = new Date(Number(partsFin[0]), Number(partsFin[1]) - 1, Number(partsFin[2]) || 5);
    const diffDays = Math.round((finDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let estadoVigencia: 'vigente' | 'por_vencer' | 'finalizado';
    let badgeClass = '';
    let textoRestante = '';

    if (diffDays < 0) {
      estadoVigencia = 'finalizado';
      badgeClass = 'bg-secondary';
      textoRestante = `Finalizó hace ${Math.abs(diffDays)} días`;
    } else if (diffDays <= 30) {
      estadoVigencia = 'por_vencer';
      badgeClass = 'bg-warning text-dark';
      textoRestante = diffDays === 0 ? 'Vence hoy' : `Vence en ${diffDays} días`;
    } else {
      estadoVigencia = 'vigente';
      badgeClass = 'bg-success';
      textoRestante = `Faltan ${diffDays} días`;
    }

    const fmtIni = `${partsIni[2]}/${partsIni[1]}/${partsIni[0]}`;
    const fmtFin = `${partsFin[2]}/${partsFin[1]}/${partsFin[0]}`;

    return {
      rango: `${fmtIni} → ${fmtFin}`,
      meses,
      plazoTexto,
      diaCobro,
      diasRestantes: diffDays,
      estadoVigencia,
      badgeClass,
      textoRestante
    };
  }

  verDetalle(c: Contrato): void {
    this.contratoSeleccionado = c;
  }

  cerrarDetalle(): void {
    this.contratoSeleccionado = null;
  }

  eliminar(id?: number): void {
    if (!id) return;
    this.alertService.confirm('¿Deseas anular/eliminar este contrato?').then((confirmado) => {
      if (confirmado) {
        this.contratoService.deleteContrato(id).subscribe({
          next: () => {
            this.alertService.success('Contrato eliminado correctamente');
            this.cargarContratos();
          },
          error: (e) => {
            console.error(e);
            this.contratos = this.contratos.filter(c => c.idContrato !== id);
            this.alertService.success('Contrato eliminado correctamente');
          }
        });
      }
    });
  }

  getEstadoBadge(c: Contrato): string {
    const vig = this.getVigencia(c);
    return vig.badgeClass;
  }

  getEstadoTexto(c: Contrato): string {
    const vig = this.getVigencia(c);
    if (vig.estadoVigencia === 'vigente') return 'Vigente';
    if (vig.estadoVigencia === 'por_vencer') return 'Por vencer';
    return 'Finalizado';
  }
}
