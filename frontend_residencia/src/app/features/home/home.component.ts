import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HabitacionService } from '../../core/services/habitacion.service';
import { ContratoService } from '../../core/services/contrato.service';
import { ClienteService } from '../../core/services/cliente.service';
import { AuthService } from '../../core/services/auth.service';
import { Habitacion } from '../../core/interfaces/habitacion.interface';
import { Contrato } from '../../core/interfaces/contrato.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

  totalHabitaciones: number = 0;
  habitacionesDisponibles: number = 0;
  totalContratos: number = 0;
  totalClientes: number = 0;
  totalIngresos: number = 0;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isEstudiante(): boolean {
    return this.authService.isEstudiante();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.habitacionService.getHabitaciones().subscribe({
      next: (habs) => {
        this.habitaciones = habs;
        this.totalHabitaciones = habs.length;
        this.habitacionesDisponibles = habs.filter(h => (h.estado || '').toUpperCase() === 'D' || (h.estado || '').toUpperCase() === 'A').length;
      },
      error: (e) => console.error('Error al cargar habitaciones', e)
    });

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
}
