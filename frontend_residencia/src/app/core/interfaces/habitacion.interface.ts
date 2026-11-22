export interface Habitacion {
  idHabitacion?: number;
  numero: string;
  piso: number;
  descripcion: string;
  precio: number;
  imgHabitacion?: string;
  estado: string; // 'D' (Disponible), 'O' (Ocupada), 'M' (Mantenimiento), 'A' (Activa)
}

