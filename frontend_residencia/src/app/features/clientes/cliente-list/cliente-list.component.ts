import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';
import { AlertService } from '../../../core/services/alert.service';
import { Cliente, Persona } from '../../../core/interfaces/cliente.interface';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.css'
})
export class ClienteListComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private alertService = inject(AlertService);

  personas: Persona[] = [];
  clientes: Cliente[] = [];
  cargando: boolean = true;
  filtroTexto: string = '';

  get personasFiltradas(): Persona[] {
    if (!this.filtroTexto.trim()) {
      return this.personas;
    }
    const q = this.filtroTexto.toLowerCase().trim();
    return this.personas.filter(p =>
      (p.nombres || '').toLowerCase().includes(q) ||
      (p.apPaterno || '').toLowerCase().includes(q) ||
      (p.apMaterno || '').toLowerCase().includes(q) ||
      (p.nroDocumento || '').includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.telefono || '').includes(q)
    );
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.clienteService.getPersonas().subscribe({
      next: (pers) => {
        this.personas = pers;
        this.clienteService.getClientes().subscribe({
          next: (clis) => {
            this.clientes = clis;
            this.cargando = false;
          },
          error: () => this.cargando = false
        });
      },
      error: (e) => {
        console.error(e);
        this.alertService.error('Error al cargar la lista de personas y clientes');
        this.cargando = false;
      }
    });
  }

  esResidenteActivo(idPersona?: number): boolean {
    return this.clienteService.esPersonaActiva(idPersona, this.clientes);
  }

  toggleEstado(p: Persona): void {
    if (!p.idPersona) return;
    const nuevoEstadoActivo = !this.esResidenteActivo(p.idPersona);
    const nombreCompleto = `${p.nombres} ${p.apPaterno}`.trim();

    this.clienteService.cambiarEstadoResidente(p.idPersona, nuevoEstadoActivo, this.clientes).subscribe({
      next: () => {
        // Recargar lista de clientes por si se insertó un nuevo registro en Oracle
        this.clienteService.getClientes().subscribe({
          next: (clis) => this.clientes = clis
        });
        this.alertService.toast(
          `${nombreCompleto} cambió a estado ${nuevoEstadoActivo ? 'Activo' : 'Inactivo'}`,
          nuevoEstadoActivo ? 'success' : 'info'
        );
      }
    });
  }

  contarActivos(): number {
    return this.personas.filter(p => this.esResidenteActivo(p.idPersona)).length;
  }

  limpiarFiltro(): void {
    this.filtroTexto = '';
  }

  eliminarPersona(id?: number): void {
    if (!id) return;
    this.alertService.confirm('¿Deseas eliminar este registro de persona?', 'Confirmar eliminación').then((confirmado) => {
      if (confirmado) {
        this.clienteService.deletePersona(id).subscribe({
          next: () => {
            this.alertService.success('Persona eliminada');
            this.cargarDatos();
          },
          error: (e) => {
            console.error(e);
            this.alertService.error('No se pudo eliminar la persona (puede estar vinculada a contratos)');
          }
        });
      }
    });
  }
}
