import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';
import { AlertService } from '../../../core/services/alert.service';
import { Cliente } from '../../../core/interfaces/cliente.interface';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.css'
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEditMode: boolean = false;
  personaId?: number;
  guardando: boolean = false;
  clientes: Cliente[] = [];

  ngOnInit(): void {
    this.form = this.fb.group({
      nombres: ['', [Validators.required, Validators.maxLength(50)]],
      apPaterno: ['', [Validators.required, Validators.maxLength(50)]],
      apMaterno: ['', [Validators.required, Validators.maxLength(50)]],
      nroDocumento: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      telefono: ['', [Validators.maxLength(9)]],
      email: ['', [Validators.email, Validators.maxLength(50)]],
      fechaNac: [''],
      estado: ['A', [Validators.required]]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.personaId = Number(idParam);
      this.clienteService.getClientes().subscribe({
        next: (clis) => {
          this.clientes = clis || [];
          this.cargarDatos(this.personaId!);
        },
        error: () => this.cargarDatos(this.personaId!)
      });
    }
  }

  cargarDatos(id: number): void {
    this.clienteService.getPersonaById(id).subscribe({
      next: (p) => {
        const fmtDate = (d: any) => d ? new Date(d).toISOString().substring(0, 10) : '';
        const esActivo = this.clienteService.esPersonaActiva(id, this.clientes);
        this.form.patchValue({
          nombres: p.nombres,
          apPaterno: p.apPaterno,
          apMaterno: p.apMaterno,
          nroDocumento: p.nroDocumento,
          telefono: p.telefono,
          email: p.email,
          fechaNac: fmtDate(p.fechaNac),
          estado: esActivo ? 'A' : 'I'
        });
      },
      error: () => {
        this.alertService.error('No se pudo encontrar a la persona');
        this.router.navigate(['/clientes']);
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.alertService.error('Completa los campos obligatorios');
      return;
    }

    this.guardando = true;
    const { estado, ...datos } = this.form.value;
    const activar = estado === 'A';

    if (this.isEditMode && this.personaId) {
      this.clienteService.updatePersona(this.personaId, datos).subscribe({
        next: () => {
          this.clienteService.cambiarEstadoResidente(this.personaId!, activar, this.clientes).subscribe({
            next: () => {
              this.alertService.success('Datos y estado del residente actualizados con éxito');
              this.router.navigate(['/clientes']);
            }
          });
        },
        error: (e) => {
          console.error(e);
          this.alertService.error('Error al actualizar datos');
          this.guardando = false;
        }
      });
    } else {
      this.clienteService.createPersona(datos).subscribe({
        next: (nuevaPer) => {
          if (nuevaPer.idPersona) {
            this.clienteService.cambiarEstadoResidente(nuevaPer.idPersona, activar, this.clientes).subscribe();
          }
          this.alertService.success('Residente registrado con éxito');
          this.router.navigate(['/clientes']);
        },
        error: (e) => {
          console.error(e);
          this.alertService.error('Error al registrar residente');
          this.guardando = false;
        }
      });
    }
  }
}
