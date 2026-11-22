import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitacionService } from '../../../core/services/habitacion.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-habitacion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './habitacion-form.component.html',
  styleUrl: './habitacion-form.component.css'
})
export class HabitacionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private habitacionService = inject(HabitacionService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEditMode: boolean = false;
  habitacionId?: number;
  guardando: boolean = false;
  fotoSeleccionada: File | null = null;
  fotoPreview: string | null = null;
  imgActual: string | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      numero: ['', [Validators.required, Validators.maxLength(8)]],
      piso: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
      descripcion: ['', [Validators.maxLength(200)]],
      precio: [350, [Validators.required, Validators.min(0)]],
      estado: ['D', [Validators.required]]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.habitacionId = Number(idParam);
      this.cargarDatos(this.habitacionId);
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
    this.habitacionService.getHabitacionById(id).subscribe({
      next: (h) => {
        this.form.patchValue({
          numero: h.numero,
          piso: h.piso,
          descripcion: h.descripcion,
          precio: h.precio,
          estado: h.estado || 'D'
        });
        if (h.imgHabitacion && h.imgHabitacion !== 'no-image.png') {
          this.imgActual = h.imgHabitacion;
        }
      },
      error: () => {
        this.alertService.error('No se pudo encontrar la habitación');
        this.router.navigate(['/habitaciones']);
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.alertService.error('Por favor, completa correctamente los campos obligatorios');
      return;
    }

    this.guardando = true;
    const formData = new FormData();
    formData.append('numero', this.form.value.numero);
    formData.append('piso', this.form.value.piso.toString());
    formData.append('descripcion', this.form.value.descripcion || '');
    formData.append('precio', this.form.value.precio.toString());
    formData.append('estado', this.form.value.estado);

    if (this.fotoSeleccionada) {
      formData.append('file', this.fotoSeleccionada);
    }

    if (this.isEditMode && this.habitacionId) {
      this.habitacionService.updateHabitacion(this.habitacionId, formData).subscribe({
        next: () => {
          this.alertService.success('Habitación actualizada con éxito');
          this.router.navigate(['/habitaciones']);
        },
        error: (e) => {
          console.error(e);
          this.alertService.error('Error al actualizar la habitación');
          this.guardando = false;
        }
      });
    } else {
      this.habitacionService.createHabitacion(formData).subscribe({
        next: () => {
          this.alertService.success('Habitación creada con éxito');
          this.router.navigate(['/habitaciones']);
        },
        error: (e) => {
          console.error(e);
          this.alertService.error('Error al crear la habitación');
          this.guardando = false;
        }
      });
    }
  }
}
