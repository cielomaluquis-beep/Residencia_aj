export interface ILoginResponse {
  token: string;
  usuario: string;
  rol: string;
  idPersona: string | number;
}

export interface IRegistroRequest {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  usuario: string;
  password: string;
}
