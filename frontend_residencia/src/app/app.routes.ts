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
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },

      // Habitaciones (Catálogo público, crear/editar solo Admin/Gerente)
      { path: 'habitaciones', component: HabitacionListComponent },
      { path: 'habitaciones/nuevo', component: HabitacionFormComponent, canActivate: [adminGuard] },
      { path: 'habitaciones/editar/:id', component: HabitacionFormComponent, canActivate: [adminGuard] },

      // Contratos (Ver con sesión; Crear/Editar solo Admin/Gerente)
      { path: 'contratos', component: ContratoListComponent, canActivate: [authGuard] },
      { path: 'contratos/nuevo', component: ContratoFormComponent, canActivate: [adminGuard] },
      { path: 'contratos/editar/:id', component: ContratoFormComponent, canActivate: [adminGuard] },

      // Residentes / Clientes (Exclusivo Admin/Gerente)
      { path: 'clientes', component: ClienteListComponent, canActivate: [adminGuard] },
      { path: 'clientes/nuevo', component: ClienteFormComponent, canActivate: [adminGuard] },
      { path: 'clientes/editar/:id', component: ClienteFormComponent, canActivate: [adminGuard] },

      // Pagos (Ver con sesión; Registrar nuevo cobro solo Admin/Gerente)
      { path: 'pagos', component: PagoListComponent, canActivate: [authGuard] },
      { path: 'pagos/nuevo', component: PagoFormComponent, canActivate: [adminGuard] },

      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
