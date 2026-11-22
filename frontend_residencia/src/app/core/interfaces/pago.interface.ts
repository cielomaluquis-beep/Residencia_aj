export interface Pago {
  idPago?: number;
  idContrato: number;
  idUsuario?: number;
  monto: number;
  fecha: string;
  metodoPago: string;
  imgPago?: string;
  estado: string;
}

