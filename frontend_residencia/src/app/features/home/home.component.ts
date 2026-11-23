import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HabitacionService } from '../../core/services/habitacion.service';
import { ContratoService } from '../../core/services/contrato.service';
import { ClienteService } from '../../core/services/cliente.service';
import { AuthService } from '../../core/services/auth.service';
import { Habitacion } from '../../core/interfaces/habitacion.interface';
import { Contrato } from '../../core/interfaces/contrato.interface';

type FiltroHab = 'todas' | 'disponibles' | 'ocupadas';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private habitacionService = inject(HabitacionService);
  private contratoService = inject(ContratoService);
  private clienteService = inject(ClienteService);
  public authService = inject(AuthService);

  habitaciones: Habitacion[] = [];
  contratos: Contrato[] = [];
  cargando: boolean = true;
  cargandoHabitaciones: boolean = true;

  totalHabitaciones: number = 0;
  habitacionesDisponibles: number = 0;
  totalContratos: number = 0;
  totalClientes: number = 0;
  totalIngresos: number = 0;
  precioDesde: number = 0;

  // Catálogo de habitaciones en el inicio
  filtro: FiltroHab = 'todas';
  pisoSeleccionado: number | null = null;
  busquedaHab: string = '';
  pisos: number[] = [];
  habitacionSeleccionada: Habitacion | null = null;

  /** Número de WhatsApp del negocio (código de país 51 + número) */
  readonly whatsappNegocio = '51963852741';
  get whatsappUrl(): string {
    const msg = encodeURIComponent('Hola, quisiera información para reservar una habitación en la Residencia A&J.');
    return `https://wa.me/${this.whatsappNegocio}?text=${msg}`;
  }

  readonly beneficios = [
    { icono: 'bi-wifi', titulo: 'Internet de alta velocidad', texto: 'WiFi incluido en todas las habitaciones para tus clases y estudios.' },
    { icono: 'bi-shield-lock', titulo: 'Seguridad 24/7', texto: 'Acceso controlado y un ambiente tranquilo para que descanses.' },
    { icono: 'bi-geo-alt', titulo: 'Cerca a la universidad', texto: 'Ubicación estratégica a pocos minutos de la UPeU en Morales.' },
    { icono: 'bi-stars', titulo: 'Ambientes limpios', texto: 'Espacios ordenados, iluminados y listos para vivir.' }
  ];

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isEstudiante(): boolean {
    return this.authService.isEstudiante();
  }

  /** Habitaciones que se muestran según los filtros y búsqueda elegidos */
  get habitacionesFiltradas(): Habitacion[] {
    const q = this.busquedaHab.trim().toLowerCase();
    return this.habitaciones.filter(h => {
      if (this.filtro === 'disponibles' && !this.esDisponible(h)) return false;
      if (this.filtro === 'ocupadas' && this.esDisponible(h)) return false;
      if (this.pisoSeleccionado !== null && h.piso !== this.pisoSeleccionado) return false;
      if (q) {
        const num = (h.numero || '').toLowerCase();
        const desc = (h.descripcion || '').toLowerCase();
        const piso = `piso ${h.piso}`;
        const precio = String(h.precio || '');
        if (!num.includes(q) && !desc.includes(q) && !piso.includes(q) && !precio.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.cargandoHabitaciones = true;

    this.habitacionService.getHabitaciones().subscribe({
      next: (habs) => {
        // Se muestran TODAS las habitaciones registradas; las nuevas aparecen automáticamente
        this.habitaciones = [...(habs || [])].sort((a, b) =>
          (a.piso - b.piso) || (a.numero || '').localeCompare(b.numero || ''));
        this.totalHabitaciones = this.habitaciones.length;
        this.habitacionesDisponibles = this.habitaciones.filter(h => this.esDisponible(h)).length;
        this.pisos = [...new Set(this.habitaciones.map(h => h.piso))].sort((a, b) => a - b);
        const precios = this.habitaciones.map(h => h.precio).filter(p => p > 0);
        this.precioDesde = precios.length ? Math.min(...precios) : 0;
        this.cargandoHabitaciones = false;
      },
      error: (e) => {
        console.error('Error al cargar habitaciones', e);
        this.cargandoHabitaciones = false;
      }
    });

    // Las métricas internas solo se piden para Admin / Gerente
    if (!this.isAdmin) {
      this.cargando = false;
      return;
    }

    this.contratoService.getContratos().subscribe({
      next: (conts) => {
        this.contratos = conts;
        this.totalContratos = conts.length;
        this.totalIngresos = conts.reduce((acc, curr) => acc + (curr.monto || 0), 0);
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al cargar contratos', e);
        this.cargando = false;
      }
    });

    this.clienteService.getClientes().subscribe({
      next: (clis) => this.totalClientes = clis.length,
      error: (e) => console.error('Error al cargar clientes', e)
    });
  }

  // ---------- Helpers de habitaciones ----------
  esDisponible(h: Habitacion): boolean {
    const e = (h.estado || '').toUpperCase();
    return e === 'D' || e === 'A';
  }

  getEstadoTexto(h: Habitacion): string {
    const e = (h.estado || '').toUpperCase();
    if (e === 'D' || e === 'A') return 'Disponible';
    if (e === 'O') return 'Ocupada';
    if (e === 'M') return 'Mantenimiento';
    return 'No disponible';
  }

  getEstadoClase(h: Habitacion): string {
    const e = (h.estado || '').toUpperCase();
    if (e === 'D' || e === 'A') return 'st-ok';
    if (e === 'M') return 'st-warn';
    return 'st-bad';
  }

  getImagen(h: Habitacion): string | null {
    return h.imgHabitacion && h.imgHabitacion !== 'no-image.png'
      ? '/LP2_ResidenciaA-J/images/' + h.imgHabitacion
      : null;
  }

  getNumero(h: Habitacion): string {
    return h.numero?.startsWith('Hab') ? h.numero : `Habitación ${h.numero}`;
  }

  setFiltro(f: FiltroHab): void {
    this.filtro = f;
  }

  setPiso(p: number | null): void {
    this.pisoSeleccionado = p;
  }

  abrirDetalle(h: Habitacion): void {
    this.habitacionSeleccionada = h;
  }

  cerrarDetalle(): void {
    this.habitacionSeleccionada = null;
  }

  irAHabitaciones(): void {
    document.getElementById('habitaciones')?.scrollIntoView({ behavior: 'smooth' });
  }
}
