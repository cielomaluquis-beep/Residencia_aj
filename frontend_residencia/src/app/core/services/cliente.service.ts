import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Cliente, Persona } from '../interfaces/cliente.interface';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private clientesUrl = '/api/v1/clientes';
  private personasUrl = '/api/v1/personas';
  private storageKey = 'estados_residentes_aj';

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.clientesUrl);
  }

  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.clientesUrl}/${id}`);
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.clientesUrl, cliente);
  }

  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.clientesUrl}/${id}`);
  }

  // Métodos de personas
  getPersonas(): Observable<Persona[]> {
    return this.http.get<Persona[]>(this.personasUrl);
  }

  getPersonaById(id: number): Observable<Persona> {
    return this.http.get<Persona>(`${this.personasUrl}/${id}`);
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
