import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { ContratoService } from '../../core/services/contrato.service';
import { HabitacionService } from '../../core/services/habitacion.service';
import { ClienteService } from '../../core/services/cliente.service';

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
  private contratoService = inject(ContratoService);
  private habitacionService = inject(HabitacionService);
  private clienteService = inject(ClienteService);
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

  // --- NOTIFICACIONES PERSONALIZADAS POR ROL Y USUARIO ---
  notificaciones: NotificacionItem[] = [];

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
        this.cargarNotificacionesPorUsuario();
      } else {
        this.userName = '';
        this.userRole = '';
        this.isAdmin = false;
        this.isAdministradora = false;
        this.isGerente = false;
        this.isEstudiante = false;
        this.notificaciones = [];
      }
    });
  }

  cargarNotificacionesPorUsuario(): void {
    forkJoin({
      contratos: this.contratoService.getContratos().pipe(catchError(() => of([]))),
      habitaciones: this.habitacionService.getHabitaciones().pipe(catchError(() => of([]))),
      clientes: this.clienteService.getClientes().pipe(catchError(() => of([]))),
      personas: this.clienteService.getPersonas().pipe(catchError(() => of([])))
    }).subscribe(({ contratos, habitaciones, clientes, personas }) => {
      const lista: NotificacionItem[] = [];
      let nextId = 1;

      const getHabNum = (idHab?: number) => {
        const h = habitaciones.find(x => x.idHabitacion === idHab);
        return h?.numero ? `Hab. ${h.numero}` : 'Habitación';
      };

      const getPerByCliente = (idCli?: number) => {
        const cli = clientes.find(c => c.idCliente === idCli);
        const idPer = cli ? (cli.persona?.idPersona ?? cli.idPersona) : idCli;
        return cli?.persona?.nombres ? cli.persona : personas.find(p => p.idPersona === idPer);
      };

      // ================= 1. ESTUDIANTE: SOLO SUS PROPIAS NOTIFICACIONES =================
      if (!this.isAdmin) {
        const miIdPersona = this.authService.getIdPersona();
        const miPersona = personas.find(p => p.idPersona === miIdPersona);
        const miNombre = miPersona ? `${miPersona.nombres} ${miPersona.apPaterno}`.trim() : this.userName;

        const misContratos = contratos.filter(c => {
          const cli = clientes.find(cl => cl.idCliente === c.idCliente);
          const idPer = cli ? (cli.persona?.idPersona ?? cli.idPersona) : undefined;
          return idPer != null && idPer === miIdPersona;
        });

        if (misContratos.length > 0) {
          for (const c of misContratos) {
            const habTexto = getHabNum(c.idHabitacion);
            const partsIni = (c.fechaInicio || '2026-11-05').substring(0, 10).split('-');
            const partsFin = (c.fechaFin || '2027-05-05').substring(0, 10).split('-');
            const diaCobro = partsIni.length === 3 ? (Number(partsIni[2]) || 5) : 5;
            const fechaFinFmt = partsFin.length === 3 ? `${partsFin[2]}/${partsFin[1]}/${partsFin[0]}` : c.fechaFin;

            lista.push({
              id: nextId++,
              titulo: 'Recordatorio de tu Cuota Mensual',
              mensaje: `${miNombre} (${habTexto}): tu pago mensual de S/ ${(c.monto || 0).toFixed(2)} corresponde al día ${diaCobro} de cada mes.`,
              tiempo: 'Hoy',
              leida: false,
              tipo: 'pago',
              ruta: '/pagos',
              icono: 'bi-cash-stack',
              badgeColor: 'bg-primary'
            });

            lista.push({
              id: nextId++,
              titulo: 'Vigencia de tu Contrato',
              mensaje: `Tu contrato de alquiler en ${habTexto} se encuentra registrado con vigencia hasta el ${fechaFinFmt}.`,
              tiempo: 'Activo',
              leida: false,
              tipo: 'contrato',
              ruta: '/contratos',
              icono: 'bi-file-earmark-check-fill',
              badgeColor: 'bg-success'
            });
          }
        } else {
          lista.push({
            id: nextId++,
            titulo: 'Bienvenido a tu Portal de Residente',
            mensaje: `Hola ${miNombre}, aún no tienes un contrato activo vinculado. Puedes consultar las habitaciones disponibles en el catálogo.`,
            tiempo: 'Ahora',
            leida: false,
            tipo: 'habitacion',
            ruta: '/habitaciones',
            icono: 'bi-door-open-fill',
            badgeColor: 'bg-info'
          });
        }

        this.notificaciones = lista;
        return;
      }

      // ================= 2. GERENTE: NOTIFICACIONES EJECUTIVAS DE SUPERVISIÓN =================
      if (this.isGerente) {
        const totalHabs = habitaciones.length;
        const dispHabs = habitaciones.filter(h => ['D', 'A'].includes((h.estado || '').toUpperCase())).length;
        const ocupHabs = Math.max(0, totalHabs - dispHabs);
        const tasa = totalHabs > 0 ? Math.round((ocupHabs / totalHabs) * 100) : 0;
        const totalIngresos = contratos.reduce((acc, c) => acc + (c.monto || 0), 0);

        lista.push({
          id: nextId++,
          titulo: 'Supervisión de Ingresos Mensuales',
          mensaje: `Ingresos contratados activos: S/ ${totalIngresos.toFixed(2)} distribuidos en ${contratos.length} contratos vigentes.`,
          tiempo: 'En línea',
          leida: false,
          tipo: 'pago',
          ruta: '/pagos',
          icono: 'bi-graph-up-arrow',
          badgeColor: 'bg-success'
        });

        lista.push({
          id: nextId++,
          titulo: 'Tasa de Ocupación en Tiempo Real',
          mensaje: `Ocupación actual del ${tasa}% (${ocupHabs} ocupadas y ${dispHabs} disponibles de ${totalHabs} habitaciones).`,
          tiempo: 'Hoy',
          leida: false,
          tipo: 'habitacion',
          ruta: '/habitaciones',
          icono: 'bi-pie-chart-fill',
          badgeColor: 'bg-primary'
        });

        lista.push({
          id: nextId++,
          titulo: 'Padrón de Residentes Captados',
          mensaje: `Se registran ${personas.length} residentes en la plataforma web.`,
          tiempo: 'Actualizado',
          leida: true,
          tipo: 'contrato',
          ruta: '/clientes',
          icono: 'bi-people-fill',
          badgeColor: 'bg-info'
        });

        this.notificaciones = lista;
        return;
      }

      // ================= 3. ADMINISTRADORA: ALERTAS OPERATIVAS DE GESTIÓN =================
      for (const c of contratos.slice(0, 3)) {
        const per = getPerByCliente(c.idCliente);
        const nombreRes = per ? `${per.nombres} ${per.apPaterno}`.trim() : 'Residente';
        const habTexto = getHabNum(c.idHabitacion);
        const partsIni = (c.fechaInicio || '2026-11-05').substring(0, 10).split('-');
        const diaCobro = partsIni.length === 3 ? (Number(partsIni[2]) || 5) : 5;

        lista.push({
          id: nextId++,
          titulo: `Control de Pago · ${habTexto}`,
          mensaje: `${nombreRes}: cobro mensual de S/ ${(c.monto || 0).toFixed(2)} programado para el día ${diaCobro} de cada mes.`,
          tiempo: 'Vigente',
          leida: false,
          tipo: 'pago',
          ruta: '/pagos',
          icono: 'bi-cash-stack',
          badgeColor: 'bg-primary'
        });
      }

      const habsDisp = habitaciones.filter(h => ['D', 'A'].includes((h.estado || '').toUpperCase()));
      if (habsDisp.length > 0) {
        const nombresDisp = habsDisp.slice(0, 3).map(h => h.numero).join(', ');
        lista.push({
          id: nextId++,
          titulo: `${habsDisp.length} Habitaciones Disponibles`,
          mensaje: `Cuartos listos para asignar nuevo contrato: ${nombresDisp}.`,
          tiempo: 'Hoy',
          leida: true,
          tipo: 'habitacion',
          ruta: '/habitaciones',
          icono: 'bi-door-open-fill',
          badgeColor: 'bg-success'
        });
      }

      this.notificaciones = lista;
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
