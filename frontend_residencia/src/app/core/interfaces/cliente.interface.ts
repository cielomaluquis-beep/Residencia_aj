export interface Persona {
  idPersona?: number;
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  nroDocumento: string;
  telefono: string;
  email: string;
  fechaNac?: string;
}

export interface Cliente {
  idCliente?: number;
  idPersona: number;
  persona?: Persona;
}

