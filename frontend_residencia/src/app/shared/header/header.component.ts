import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';

export interface NotificacionItem {
  id: number;
  titulo: string;
  mensaje: string;
  tiempo: string;
  leida: boolean;
  tipo: 'pago' | 'contrato' | 'habitacion';
  ruta: string;
  icono: string;
  badgeColor: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  public authService = inject(AuthService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  userName: string = '';
  userRole: string = '';
  isAdmin: boolean = false;
  isAdministradora: boolean = false;
  isGerente: boolean = false;
  isEstudiante: boolean = false;
  isLoggedIn: boolean = false;

  // --- BUSCADOR ---
  searchTerm: string = '';

  // --- NOTIFICACIONES ---
  notificaciones: NotificacionItem[] = [
    {
      id: 1,
      titulo: 'Cuota de Diciembre Próxima',
      mensaje: 'Fabiola Isabel (Hab. A-205): el cobro del mes de Diciembre vence el 05/12/2026.',
      tiempo: 'Hace 1 hora',
      leida: false,
      tipo: 'pago',
      ruta: '/pagos',
      icono: 'bi-cash-stack',
      badgeColor: 'bg-primary'
    },
    {
      id: 2,
      titulo: 'Contrato por Vencer',
      mensaje: 'Juan Luis Perez (Hab. A-102): su contrato vence en 14 días. Revisa la renovación.',
      tiempo: 'Hace 3 horas',
      leida: false,
      tipo: 'contrato',
      ruta: '/contratos',
      icono: 'bi-exclamation-triangle-fill',
      badgeColor: 'bg-warning text-dark'
    },
    {
      id: 3,
      titulo: 'Habitación Disponible',
      mensaje: 'Habitación A-101 se encuentra limpia y disponible para asignar a un nuevo residente.',
      tiempo: 'Ayer',
      leida: true,
      tipo: 'habitacion',
      ruta: '/habitaciones',
      icono: 'bi-door-open-fill',
      badgeColor: 'bg-success'
    }
  ];

  get notificacionesNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.userName = this.authService.getUserName() || 'Usuario';
        this.userRole = this.authService.getRole() || 'RESIDENTE';
        this.isAdmin = this.authService.isAdmin();
        this.isAdministradora = this.authService.isAdministradora();
        this.isGerente = this.authService.isGerente();
        this.isEstudiante = this.authService.isEstudiante();
      } else {
        this.userName = '';
        this.userRole = '';
        this.isAdmin = false;
        this.isAdministradora = false;
        this.isGerente = false;
        this.isEstudiante = false;
      }
    });
  }

  // --- MÉTODO DE BÚSQUEDA ---
  onBuscar(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const term = this.searchTerm.trim();
    if (!term) {
      this.alertService.toast('Escribe un número o texto a buscar (ej: 102, individual)', 'info');
      return;
    }

    // Navega a Habitaciones con el filtro aplicado
    this.router.navigate(['/habitaciones'], { queryParams: { buscar: term } });
  }

  // --- MÉTODOS DE NOTIFICACIONES ---
  abrirNotificacion(notif: NotificacionItem): void {
    notif.leida = true;
    this.router.navigate([notif.ruta]);
  }

  marcarTodasComoLeidas(): void {
    this.notificaciones.forEach(n => n.leida = true);
    this.alertService.toast('Todas las notificaciones marcadas como leídas', 'success');
  }

  limpiarNotificaciones(): void {
    this.notificaciones = [];
    this.alertService.toast('Bandeja de notificaciones vaciada', 'info');
  }

  logout(): void {
    this.authService.logout();
  }
}
