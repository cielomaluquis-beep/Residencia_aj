import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PagoService } from '../../../core/services/pago.service';
import { ContratoService } from '../../../core/services/contrato.service';
import { HabitacionService } from '../../../core/services/habitacion.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { AlertService } from '../../../core/services/alert.service';
import { Contrato } from '../../../core/interfaces/contrato.interface';
import { Habitacion } from '../../../core/interfaces/habitacion.interface';
import { Cliente, Persona } from '../../../core/interfaces/cliente.interface';

@Component({
  selector: 'app-pago-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './pago-form.component.html',
  styleUrl: './pago-form.component.css'
})
export class PagoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pagoService = inject(PagoService);
  private contratoService = inject(ContratoService);
  private habitacionService = inject(HabitacionService);
  private clienteService = inject(ClienteService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  form!: FormGroup;
  guardando: boolean = false;
  contratos: Contrato[] = [];
  habitaciones: Habitacion[] = [];
  clientes: Cliente[] = [];
  personas: Persona[] = [];

  fotoSeleccionada: File | null = null;
  fotoPreview: string | null = null;

  ngOnInit(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.form = this.fb.group({
      idContrato: ['', [Validators.required]],
      idUsuario: [1],
      monto: [0, [Validators.required, Validators.min(1)]],
      fecha: [today, [Validators.required]],
      metodoPago: ['Efectivo', [Validators.required]],
      estado: ['A']
    });

    forkJoin({
      contratos: this.contratoService.getContratos(),
      habitaciones: this.habitacionService.getHabitaciones(),
      clientes: this.clienteService.getClientes(),
      personas: this.clienteService.getPersonas()
    }).subscribe({
      next: (res) => {
        this.contratos = res.contratos;
        this.habitaciones = res.habitaciones;
        this.clientes = res.clientes;
        this.personas = res.personas;
      },
      error: (e) => {
        console.error('Error cargando datos', e);
        this.contratoService.getContratos().subscribe({
          next: (data) => this.contratos = data
        });
      }
    });
  }

  getDescripcionContrato(c: Contrato): string {
    const hab = this.habitaciones.find(h => h.idHabitacion === c.idHabitacion);
    const habTexto = hab ? `Hab. ${hab.numero}` : 'Habitación';

    const cli = this.clientes.find(cl => cl.idCliente === c.idCliente);
    const per = cli ? this.personas.find(p => p.idPersona === cli.idPersona) : null;
    const cliTexto = per ? `${per.nombres} ${per.apPaterno}` : 'Residente';

    return `${habTexto} - ${cliTexto} (S/ ${c.monto})`;
  }

  alCambiarContrato(event: Event): void {
    const cid = Number((event.target as HTMLSelectElement).value);
    const cont = this.contratos.find(c => c.idContrato === cid);
    if (cont && cont.monto) {
      this.form.patchValue({ monto: cont.monto });
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.fotoSeleccionada = file;
      const reader = new FileReader();
      reader.onload = () => this.fotoPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.alertService.error('Completa los campos obligatorios del pago');
      return;
    }

    this.guardando = true;
    const formData = new FormData();
    formData.append('idContrato', this.form.value.idContrato.toString());
    formData.append('idUsuario', (this.form.value.idUsuario || 1).toString());
    formData.append('monto', this.form.value.monto.toString());
    formData.append('fecha', this.form.value.fecha);
    formData.append('metodoPago', this.form.value.metodoPago);
    formData.append('estado', this.form.value.estado);

    if (this.fotoSeleccionada) {
      formData.append('file', this.fotoSeleccionada);
    }

    this.pagoService.createPago(formData).subscribe({
      next: () => {
        this.alertService.success('Pago registrado con éxito');
        this.router.navigate(['/pagos']);
      },
      error: (e) => {
        console.error(e);
        this.alertService.error('Error al registrar el pago');
        this.guardando = false;
      }
    });
  }
}
