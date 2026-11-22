export interface TipContrato {
  idTipoContrato?: number;
  nombre: string;
  estado: string;
}

export interface Contrato {
  idContrato?: number;
  idTipoContrato: number;
  idCliente: number;
  idUsuario?: number;
  idHabitacion: number;
  fechaReserva: string;
  fechaInicio: string;
  fechaFin: string;
  monto: number;
  metodoPago: string;
  imgPagoReserva?: string;
  estado: string;
}

