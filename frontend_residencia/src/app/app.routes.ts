import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';
import { HomeComponent } from './features/home/home.component';
import { HabitacionListComponent } from './features/habitaciones/habitacion-list/habitacion-list.component';
import { HabitacionFormComponent } from './features/habitaciones/habitacion-form/habitacion-form.component';
import { ContratoListComponent } from './features/contratos/contrato-list/contrato-list.component';
import { ContratoFormComponent } from './features/contratos/contrato-form/contrato-form.component';
import { ClienteListComponent } from './features/clientes/cliente-list/cliente-list.component';
import { ClienteFormComponent } from './features/clientes/cliente-form/cliente-form.component';
import { PagoListComponent } from './features/pagos/pago-list/pago-list.component';
import { PagoFormComponent } from './features/pagos/pago-form/pago-form.component';
import { authGuard, adminGuard, administradoraGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },

      // Habitaciones (Catálogo público, crear/editar exclusivo Administradora)
      { path: 'habitaciones', component: HabitacionListComponent },
      { path: 'habitaciones/nuevo', component: HabitacionFormComponent, canActivate: [administradoraGuard] },
      { path: 'habitaciones/editar/:id', component: HabitacionFormComponent, canActivate: [administradoraGuard] },

      // Contratos (Ver con sesión; Crear/Editar exclusivo Administradora)
      { path: 'contratos', component: ContratoListComponent, canActivate: [authGuard] },
      { path: 'contratos/nuevo', component: ContratoFormComponent, canActivate: [administradoraGuard] },
      { path: 'contratos/editar/:id', component: ContratoFormComponent, canActivate: [administradoraGuard] },

      // Residentes / Clientes (Supervisión Admin/Gerente; Crear/Editar exclusivo Administradora)
      { path: 'clientes', component: ClienteListComponent, canActivate: [adminGuard] },
      { path: 'clientes/nuevo', component: ClienteFormComponent, canActivate: [administradoraGuard] },
      { path: 'clientes/editar/:id', component: ClienteFormComponent, canActivate: [administradoraGuard] },

      // Pagos (Ver con sesión; Registrar nuevo cobro exclusivo Administradora)
      { path: 'pagos', component: PagoListComponent, canActivate: [authGuard] },
      { path: 'pagos/nuevo', component: PagoFormComponent, canActivate: [administradoraGuard] },

      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
