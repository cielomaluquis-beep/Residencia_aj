import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContratoService } from '../../../core/services/contrato.service';
import { HabitacionService } from '../../../core/services/habitacion.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { AlertService } from '../../../core/services/alert.service';
import { Habitacion } from '../../../core/interfaces/habitacion.interface';
import { Cliente, Persona } from '../../../core/interfaces/cliente.interface';
import { TipContrato } from '../../../core/interfaces/contrato.interface';

@Component({
  selector: 'app-contrato-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contrato-form.component.html',
  styleUrl: './contrato-form.component.css'
})
export class ContratoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private contratoService = inject(ContratoService);
  private habitacionService = inject(HabitacionService);
  private clienteService = inject(ClienteService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEditMode: boolean = false;
  contratoId?: number;
  guardando: boolean = false;
  fotoSeleccionada: File | null = null;
  fotoPreview: string | null = null;
  imgActual: string | null = null;

  habitaciones: Habitacion[] = [];
  clientes: Cliente[] = [];
  personas: Persona[] = [];
  tiposContrato: TipContrato[] = [];

  fechaHoy: string = '';
  fechaMinimaInicio: string = '';

  ngOnInit(): void {
    const hoy = new Date();
    this.fechaHoy = hoy.toISOString().substring(0, 10);

    // Permite regularizar desde el inicio del mes actual (o desde hoy)
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaMinimaInicio = inicioMes.toISOString().substring(0, 10);

    const today = this.fechaHoy;

    this.form = this.fb.group({
      idTipoContrato: [1, [Validators.required]],
      idCliente: ['', [Validators.required]],
      idUsuario: [1],
      idHabitacion: ['', [Validators.required]],
      plazoMeses: ['6', [Validators.required]], // 1, 3, 6, 12, custom
      fechaReserva: [today, [Validators.required]],
      fechaInicio: [today, [Validators.required]],
      fechaFin: ['', [Validators.required]],
      monto: [0, [Validators.required, Validators.min(0)]],
      metodoPago: ['Efectivo', [Validators.required]],
      estado: ['A', [Validators.required]]
    });

    this.calcularFechaFin();

    this.form.get('fechaInicio')?.valueChanges.subscribe(() => this.calcularFechaFin());
    this.form.get('plazoMeses')?.valueChanges.subscribe(() => this.sincronizarPorPlazo());
    this.form.get('idTipoContrato')?.valueChanges.subscribe(() => this.sincronizarPorTipoContrato());

    this.cargarSelectores();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.contratoId = Number(idParam);
      this.cargarDatos(this.contratoId);
    }
  }

  private sincronizando: boolean = false;

  sincronizarPorTipoContrato(): void {
    if (this.sincronizando) return;
    this.sincronizando = true;

    const idTipo = Number(this.form.get('idTipoContrato')?.value);
    const tipo = this.tiposContrato.find(t => t.idTipoContrato === idTipo);
    const nombre = (tipo?.nombre || '').toLowerCase();

    if (nombre.includes('semestr') || (!nombre && idTipo === 2)) {
      this.form.patchValue({ plazoMeses: '6' }, { emitEvent: false });
    } else if (nombre.includes('anual') || nombre.includes('año') || (!nombre && idTipo === 3)) {
      this.form.patchValue({ plazoMeses: '12' }, { emitEvent: false });
    } else if (nombre.includes('mensual') || (!nombre && idTipo === 1)) {
      this.form.patchValue({ plazoMeses: '1' }, { emitEvent: false });
    } else if (nombre.includes('trimestr')) {
      this.form.patchValue({ plazoMeses: '3' }, { emitEvent: false });
    }

    this.calcularFechaFin();
    this.sincronizando = false;
  }

  sincronizarPorPlazo(): void {
    if (this.sincronizando) return;
    this.sincronizando = true;

    const plazo = this.form.get('plazoMeses')?.value;
    let tipoEncontrado: TipContrato | undefined;
    let idFallback: number | null = null;

    if (plazo === '6') {
      tipoEncontrado = this.tiposContrato.find(t => (t.nombre || '').toLowerCase().includes('semestr'));
      idFallback = 2;
    } else if (plazo === '12') {
      tipoEncontrado = this.tiposContrato.find(t => (t.nombre || '').toLowerCase().includes('anual') || (t.nombre || '').toLowerCase().includes('año'));
      idFallback = 3;
    } else if (plazo === '1') {
      tipoEncontrado = this.tiposContrato.find(t => (t.nombre || '').toLowerCase().includes('mensual'));
      idFallback = 1;
    } else if (plazo === '3') {
      tipoEncontrado = this.tiposContrato.find(t => (t.nombre || '').toLowerCase().includes('trimestr'));
    }

    if (tipoEncontrado && tipoEncontrado.idTipoContrato) {
      this.form.patchValue({ idTipoContrato: tipoEncontrado.idTipoContrato }, { emitEvent: false });
    } else if (idFallback !== null && this.tiposContrato.length === 0) {
      this.form.patchValue({ idTipoContrato: idFallback }, { emitEvent: false });
    }

    this.calcularFechaFin();
    this.sincronizando = false;
  }

  calcularFechaFin(): void {
    const fInicio = this.form.get('fechaInicio')?.value;
    const plazo = this.form.get('plazoMeses')?.value;
    if (!fInicio || plazo === 'custom') return;

    const parts = fInicio.split('-');
    if (parts.length !== 3) return;

    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    const numPlazo = Number(plazo);

    const targetDate = new Date(y, m - 1 + numPlazo, d);
    const ty = targetDate.getFullYear();
    const tm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const td = String(targetDate.getDate()).padStart(2, '0');

    this.form.patchValue({ fechaFin: `${ty}-${tm}-${td}` }, { emitEvent: false });
  }

  getDiaCobro(): number {
    const f = this.form.get('fechaInicio')?.value;
    if (!f) return 5;
    const parts = f.split('-');
    return parts.length === 3 ? (Number(parts[2]) || 5) : 5;
  }

  getPlazoTexto(): string {
    const p = this.form.get('plazoMeses')?.value;
    if (p === '1') return '1 Mes';
    if (p === '3') return '3 Meses (Trimestral)';
    if (p === '6') return '6 Meses (Semestre Académico)';
    if (p === '12') return '12 Meses (1 Año Completo)';
    return 'Personalizado';
  }

  cargarSelectores(): void {
    this.habitacionService.getHabitaciones().subscribe({
      next: (data) => this.habitaciones = data || [],
      error: (e) => console.error('Error cargando habitaciones', e)
    });

    this.clienteService.getClientes().subscribe({
      next: (data) => {
        const todos = data || [];
        this.clientes = todos.filter(c =>
          this.clienteService.esPersonaActiva(c.persona?.idPersona ?? c.idPersona, todos)
        );
      },
      error: (e) => console.error('Error cargando clientes', e)
    });

    this.clienteService.getPersonas().subscribe({
      next: (data) => this.personas = data || [],
      error: (e) => console.error('Error cargando personas', e)
    });

    this.contratoService.getTiposContrato().subscribe({
      next: (data) => {
        this.tiposContrato = data || [];
        if (!this.isEditMode) {
          this.sincronizarPorTipoContrato();
        }
      },
      error: (e) => console.error('Error cargando tipos contrato', e)
    });
  }

  getNombreCliente(idPersona?: number): string {
    const p = this.personas.find(per => per.idPersona === idPersona);
    if (!p) return 'Residente';
    return `${p.nombres} ${p.apPaterno} ${p.apMaterno || ''}`.trim();
  }

  getEstadoTexto(estado?: string): string {
    const e = (estado || '').toUpperCase();
    if (e === 'D') return 'Disponible';
    if (e === 'O') return 'Ocupada';
    if (e === 'M') return 'Mantenimiento';
    return estado || '';
  }

  alCambiarHabitacion(event: Event): void {
    const selId = Number((event.target as HTMLSelectElement).value);
    const hab = this.habitaciones.find(h => h.idHabitacion === selId);
    if (hab && hab.precio) {
      this.form.patchValue({ monto: hab.precio });
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

  cargarDatos(id: number): void {
    this.contratoService.getContratoById(id).subscribe({
      next: (c) => {
        const fmtDate = (d: any) => d ? new Date(d).toISOString().substring(0, 10) : '';
        const fIni = fmtDate(c.fechaInicio);
        const fFin = fmtDate(c.fechaFin);

        // Determinar el plazo en meses según el Tipo de Contrato o las fechas guardadas
        let plazoDetectado = '6';
        const tipo = this.tiposContrato.find(t => t.idTipoContrato === c.idTipoContrato);
        const nombreTipo = (tipo?.nombre || '').toLowerCase();

        if (nombreTipo.includes('anual') || nombreTipo.includes('año') || c.idTipoContrato === 3) {
          plazoDetectado = '12';
        } else if (nombreTipo.includes('semestr') || c.idTipoContrato === 2) {
          plazoDetectado = '6';
        } else if (nombreTipo.includes('mensual') || c.idTipoContrato === 1) {
          plazoDetectado = '1';
        } else if (fIni && fFin) {
          const [sy, sm] = fIni.split('-').map(Number);
          const [ey, em] = fFin.split('-').map(Number);
          const diffM = (ey - sy) * 12 + (em - sm);
          plazoDetectado = ['1', '3', '6', '12'].includes(String(diffM)) ? String(diffM) : 'custom';
        }

        this.sincronizando = true;
        this.form.patchValue({
          idTipoContrato: c.idTipoContrato,
          idCliente: c.idCliente,
          idUsuario: c.idUsuario || 1,
          idHabitacion: c.idHabitacion,
          plazoMeses: plazoDetectado,
          fechaReserva: fmtDate(c.fechaReserva),
          fechaInicio: fIni,
          fechaFin: fFin,
          monto: c.monto,
          metodoPago: c.metodoPago,
          estado: c.estado || 'A'
        }, { emitEvent: false });
        this.sincronizando = false;

        // Recalcular Fecha de Fin para que coincida siempre con el Tipo de Contrato (ej. Anual -> 12 meses)
        this.calcularFechaFin();

        if (c.imgPagoReserva && c.imgPagoReserva !== 'no-image.png') {
          this.imgActual = c.imgPagoReserva;
        }
      },
      error: () => {
        this.alertService.error('No se pudo encontrar el contrato');
        this.router.navigate(['/contratos']);
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.alertService.error('Completa todos los campos obligatorios del contrato');
      return;
    }

    this.guardando = true;
    const formData = new FormData();
    formData.append('idTipoContrato', this.form.value.idTipoContrato.toString());
    formData.append('idCliente', this.form.value.idCliente.toString());
    formData.append('idUsuario', (this.form.value.idUsuario || 1).toString());
    formData.append('idHabitacion', this.form.value.idHabitacion.toString());
    formData.append('fechaReserva', this.form.value.fechaReserva);
    formData.append('fechaInicio', this.form.value.fechaInicio);
    formData.append('fechaFin', this.form.value.fechaFin);
    formData.append('monto', this.form.value.monto.toString());
    formData.append('metodoPago', this.form.value.metodoPago);
    formData.append('estado', this.form.value.estado);

    if (this.fotoSeleccionada) {
      formData.append('file', this.fotoSeleccionada);
    }

    if (this.isEditMode && this.contratoId) {
      this.contratoService.updateContrato(this.contratoId, formData).subscribe({
        next: () => {
          this.alertService.success('Contrato actualizado con éxito');
          this.router.navigate(['/contratos']);
        },
        error: (e) => {
          console.error(e);
          this.alertService.error('Error al actualizar contrato');
          this.guardando = false;
        }
      });
    } else {
      this.contratoService.createContrato(formData).subscribe({
        next: () => {
          this.alertService.success('Contrato creado con éxito');
          this.router.navigate(['/contratos']);
        },
        error: (e) => {
          console.error(e);
          this.alertService.error('Error al crear contrato');
          this.guardando = false;
        }
      });
    }
  }
}
