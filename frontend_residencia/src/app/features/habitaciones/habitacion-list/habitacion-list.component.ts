import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HabitacionService } from '../../../core/services/habitacion.service';
import { AlertService } from '../../../core/services/alert.service';
import { Habitacion } from '../../../core/interfaces/habitacion.interface';

@Component({
  selector: 'app-habitacion-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './habitacion-list.component.html',
  styleUrl: './habitacion-list.component.css'
})
export class HabitacionListComponent implements OnInit {
  private habitacionService = inject(HabitacionService);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);

  habitaciones: Habitacion[] = [];
  cargando: boolean = true;
  habitacionSeleccionada: Habitacion | null = null;
  filtroTexto: string = '';

  get habitacionesFiltradas(): Habitacion[] {
    if (!this.filtroTexto.trim()) {
      return this.habitaciones;
    }
    const q = this.filtroTexto.toLowerCase().trim();
    return this.habitaciones.filter(h =>
      (h.numero ? h.numero.toString().toLowerCase() : '').includes(q) ||
      (h.piso ? h.piso.toString().toLowerCase() : '').includes(q) ||
      (h.descripcion || '').toLowerCase().includes(q) ||
      (h.precio ? h.precio.toString() : '').includes(q)
    );
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['buscar']) {
        this.filtroTexto = params['buscar'];
      }
    });
    this.cargarHabitaciones();
  }

  cargarHabitaciones(): void {
    this.cargando = true;
    this.habitacionService.getHabitaciones().subscribe({
      next: (data) => {
        this.habitaciones = data;
        this.cargando = false;
      },
      error: (e) => {
        console.error(e);
        this.alertService.error('No se pudieron cargar las habitaciones');
        this.cargando = false;
      }
    });
  }

  limpiarFiltro(): void {
    this.filtroTexto = '';
  }

  verDetalle(h: Habitacion): void {
    this.habitacionSeleccionada = h;
  }

  cerrarDetalle(): void {
    this.habitacionSeleccionada = null;
  }

  eliminar(id?: number): void {
    if (!id) return;
    this.alertService.confirm('¿Deseas eliminar esta habitación?').then((confirmado) => {
      if (confirmado) {
        this.habitacionService.deleteHabitacion(id).subscribe({
          next: () => {
            this.alertService.success('Habitación eliminada correctamente');
            this.cargarHabitaciones();
          },
          error: (e) => {
            console.error(e);
            this.alertService.error('Error al eliminar la habitación');
          }
        });
      }
    });
  }

  getEstadoTexto(estado?: string): string {
    const e = (estado || '').toUpperCase();
    if (e === 'D' || e === 'A') return 'Disponible';
    if (e === 'O') return 'Ocupada';
    if (e === 'M') return 'Mantenimiento';
    return estado || 'Desconocido';
  }

  getEstadoBadge(estado?: string): string {
    const e = (estado || '').toUpperCase();
    if (e === 'D' || e === 'A') return 'bg-success';
    if (e === 'O') return 'bg-danger';
    if (e === 'M') return 'bg-warning text-dark';
    return 'bg-secondary';
  }
}
