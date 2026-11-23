import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { Cliente, Persona } from '../interfaces/cliente.interface';

interface UsuarioStaffDTO {
  idUsuario?: number;
  idPersona?: number;
  idRol?: number;
  nombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private clientesUrl = '/api/v1/clientes';
  private personasUrl = '/api/v1/personas';
  private usuariosUrl = '/api/v1/usuarios';
  private storageKey = 'estados_residentes_aj';

  private readonly fallbackPersonas: Persona[] = [
    { idPersona: 23, nombres: 'Diana', apPaterno: 'Suarez', apMaterno: 'Rengifo', nroDocumento: '45789632', telefono: '987654147', email: 'dianasua@gmail.com', fechaNac: '2001-06-11' },
    { idPersona: 1, nombres: 'Maria', apPaterno: 'Linarez', apMaterno: 'Cueva', nroDocumento: '23457896', telefono: '987654321', email: 'marita@gmail.com', fechaNac: '2007-10-03' },
    { idPersona: 2, nombres: 'Julio', apPaterno: 'Vasquez', apMaterno: 'Rengifo', nroDocumento: '65987412', telefono: '963852741', email: 'juan@gmail.com', fechaNac: '2005-11-03' },
    { idPersona: 3, nombres: 'Juan', apPaterno: 'Perez', apMaterno: 'Gomez', nroDocumento: '86451237', telefono: '975612348', email: 'perez@gmail.com', fechaNac: '1990-01-14' },
    { idPersona: 21, nombres: 'Carlos', apPaterno: 'Mendoza', apMaterno: 'Sanchez', nroDocumento: '21568496', telefono: '923456785', email: 'carlos@gmail.com', fechaNac: '2006-12-13' },
    { idPersona: 22, nombres: 'Vanesa', apPaterno: 'Cotrina', apMaterno: 'Delgado', nroDocumento: '56238441', telefono: '967852123', email: 'vanesa@gmail.com', fechaNac: '2026-11-21' }
  ];

  private readonly fallbackClientes: Cliente[] = [
    { idCliente: 22, idPersona: 21 },
    { idCliente: 1, idPersona: 2 },
    { idCliente: 2, idPersona: 1 },
    { idCliente: 3, idPersona: 3 },
    { idCliente: 21, idPersona: 23 },
    { idCliente: 23, idPersona: 22 }
  ];

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.clientesUrl).pipe(
      catchError(() => of(this.fallbackClientes))
    );
  }

  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.clientesUrl}/${id}`).pipe(
      catchError(() => of(this.fallbackClientes.find(c => c.idCliente === id) || this.fallbackClientes[0]))
    );
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.clientesUrl, cliente);
  }

  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.clientesUrl}/${id}`);
  }

  getPersonas(): Observable<Persona[]> {
    return forkJoin({
      personas: this.http.get<Persona[]>(this.personasUrl).pipe(catchError(() => of(this.fallbackPersonas))),
      usuarios: this.http.get<UsuarioStaffDTO[]>(this.usuariosUrl).pipe(catchError(() => of([])))
    }).pipe(
      map(({ personas, usuarios }) => {
        const idsStaff = new Set<number>(
          (usuarios || [])
            .filter(u => (u.idRol === 1 || u.idRol === 2) && u.idPersona != null)
            .map(u => Number(u.idPersona))
        );

        const rolActual = (localStorage.getItem('user_role') || '').toUpperCase();
        const idPersonaActual = Number(localStorage.getItem('user_id_persona'));
        if ((rolActual === 'ADMIN' || rolActual === 'ADMINISTRADORA' || rolActual === 'GERENTE') && idPersonaActual > 0) {
          idsStaff.add(idPersonaActual);
        }

        return (personas || []).filter(p => {
          if (p.idPersona != null && idsStaff.has(Number(p.idPersona))) {
            return false;
          }
          const nombreCompleto = `${p.nombres || ''} ${p.apPaterno || ''} ${p.apMaterno || ''}`.toLowerCase();
          if (nombreCompleto.includes('marta flores') || nombreCompleto.includes('elias pisco')) {
            return false;
          }
          return true;
        });
      })
    );
  }

  getPersonaById(id: number): Observable<Persona> {
    return this.http.get<Persona>(`${this.personasUrl}/${id}`).pipe(
      catchError(() => of(this.fallbackPersonas.find(p => p.idPersona === id) || this.fallbackPersonas[0]))
    );
  }

  createPersona(persona: Persona): Observable<Persona> {
    return this.http.post<Persona>(this.personasUrl, persona);
  }

  updatePersona(id: number, persona: Persona): Observable<Persona> {
    return this.http.put<Persona>(`${this.personasUrl}/${id}`, persona);
  }

  deletePersona(id: number): Observable<void> {
    return this.http.delete<void>(`${this.personasUrl}/${id}`);
  }

  // ================= GESTIÓN DE ESTADO ACTIVO / INACTIVO =================
  private getEstadosMap(): Record<number, 'A' | 'I'> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  setEstadoOverride(idPersona: number, estado: 'A' | 'I'): void {
    const mapEstados = this.getEstadosMap();
    mapEstados[idPersona] = estado;
    localStorage.setItem(this.storageKey, JSON.stringify(mapEstados));
  }

  esPersonaActiva(idPersona: number | undefined, clientes: Cliente[]): boolean {
    if (!idPersona) return false;
    const mapEstados = this.getEstadosMap();
    if (mapEstados[idPersona] === 'I') return false;
    if (mapEstados[idPersona] === 'A') return true;

    return clientes.some(c => {
      const cId = c.persona?.idPersona ?? c.idPersona;
      return cId === idPersona;
    });
  }

  cambiarEstadoResidente(idPersona: number, activar: boolean, clientes: Cliente[]): Observable<boolean> {
    this.setEstadoOverride(idPersona, activar ? 'A' : 'I');

    if (activar) {
      const yaEsCliente = clientes.some(c => (c.persona?.idPersona ?? c.idPersona) === idPersona);
      if (!yaEsCliente) {
        return this.createCliente({ idPersona }).pipe(
          map(() => true),
          catchError(() => of(true))
        );
      }
    }
    return of(true);
  }
}
