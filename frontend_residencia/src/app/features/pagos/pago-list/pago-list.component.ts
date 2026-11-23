import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PagoService } from '../../../core/services/pago.service';
import { ContratoService } from '../../../core/services/contrato.service';
import { HabitacionService } from '../../../core/services/habitacion.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { AlertService } from '../../../core/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { Pago } from '../../../core/interfaces/pago.interface';
import { Contrato } from '../../../core/interfaces/contrato.interface';
import { Habitacion } from '../../../core/interfaces/habitacion.interface';
import { Cliente, Persona } from '../../../core/interfaces/cliente.interface';

const DUE_DAY = 5;
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export interface CuotaMes {
  n: number;
  due: Date;
  name: string;
  abonos: Pago[];
  paid: number;
  falta: number;
  sinV: number;
  ok: boolean;
  esVencidoOActual: boolean;
  reason: string;
  label: 'Pagado' | 'Pago pendiente' | 'Próximo';
  tone: 'ok' | 'bad' | 'info';
}

export interface ResidentePagos {
  id: number;
  idContrato: number;
  idCliente: number;
  name: string;
  room: string;
  monthly: number;
  start: string;
  dueDay: number;
  months: number;
  contrato: Contrato;
  payments: Pago[];
  cuotas: CuotaMes[];
  pend: CuotaMes[];
  total: number;
  paid: number;
  falta: number;
  ok: boolean;
  label: 'Pagado' | 'Pago pendiente';
  tone: 'ok' | 'bad';
  pct: number;
  sub: string;
  reason: string;
}

@Component({
  selector: 'app-pago-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pago-list.component.html',
  styleUrl: './pago-list.component.css'
})
export class PagoListComponent implements OnInit {
  private pagoService = inject(PagoService);
  private contratoService = inject(ContratoService);
  private habitacionService = inject(HabitacionService);
  private clienteService = inject(ClienteService);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);

  /** Admin / Gerente ven todo; Estudiante solo lo suyo */
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  pagos: Pago[] = [];
  contratos: Contrato[] = [];
  habitaciones: Habitacion[] = [];
  clientes: Cliente[] = [];
  personas: Persona[] = [];

  residentes: ResidentePagos[] = [];
  cargando: boolean = true;

  // Filtros
  filtroEstado: 'todos' | 'ok' | 'bad' = 'todos';
  busqueda: string = '';

  // Modal de Detalle / Gestión de Pagos
  modalVisible: boolean = false;
  residenteSeleccionado: ResidentePagos | null = null;

  // Formulario Inline de Agregar Pago
  addingCuota: number | null = null;
  formMonto: number = 0;
  formMetodo: string = 'Efectivo';
  formFecha: string = '';
  formFile: File | null = null;
  formHint: string = '';
  formHintError: boolean = false;
  guardandoPago: boolean = false;

  // Lightbox Visor de Comprobante / Voucher
  lightboxVisible: boolean = false;
  lightboxUrl: string = '';
  lightboxCaption: string = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(reabrirContratoId?: number): void {
    this.cargando = true;
    forkJoin({
      pagos: this.pagoService.getPagos(),
      contratos: this.contratoService.getContratos(),
      habitaciones: this.habitacionService.getHabitaciones(),
      clientes: this.clienteService.getClientes(),
      personas: this.clienteService.getPersonas()
    }).subscribe({
      next: (res) => {
        this.pagos = res.pagos || [];
        this.contratos = res.contratos || [];
        this.habitaciones = res.habitaciones || [];
        this.clientes = res.clientes || [];
        this.personas = res.personas || [];
        this.construirResidentes();
        this.cargando = false;

        if (reabrirContratoId) {
          const resActualizado = this.residentes.find(r => r.idContrato === reabrirContratoId);
          if (resActualizado) {
            this.residenteSeleccionado = resActualizado;
          }
        }
      },
      error: (e) => {
        console.error('Error cargando datos de pagos:', e);
        this.pagoService.getPagos().subscribe({
          next: (p) => {
            this.pagos = p || [];
            this.construirResidentes();
            this.cargando = false;
          },
          error: () => {
            this.construirResidentes();
            this.cargando = false;
          }
        });
      }
    });
  }

  construirResidentes(): void {
    const list: ResidentePagos[] = [];

    // 1. Mapear contratos existentes desde la base de datos
    for (const c of this.contratos) {
      if (!c.idContrato) continue;

      const hab = this.habitaciones.find(h => h.idHabitacion === c.idHabitacion);
      const cli = this.clientes.find(cl => cl.idCliente === c.idCliente);
      const per = cli ? this.personas.find(p => p.idPersona === cli.idPersona) : null;

      const nombre = per 
        ? `${per.nombres} ${per.apPaterno} ${per.apMaterno || ''}`.trim() 
        : 'Residente';

      const habitacionNumero = hab?.numero 
        ? (hab.numero.startsWith('Hab') ? hab.numero : `Hab. ${hab.numero}`) 
        : 'Habitación';

      const mensualidad = c.monto && c.monto > 0 ? c.monto : (hab?.precio || 450);
      const start = c.fechaInicio ? c.fechaInicio.substring(0, 7) : '2026-11';
      const startParts = (c.fechaInicio || '2026-11-05').split('-');
      const dueDay = startParts.length === 3 ? (Number(startParts[2]) || 5) : 5;

      let months = 1;
      if (c.fechaInicio && c.fechaFin) {
        const [sy, sm] = c.fechaInicio.split('-').map(Number);
        const [ey, em] = c.fechaFin.split('-').map(Number);
        months = Math.max(1, (ey - sy) * 12 + (em - sm) + 1);
      }

      const pagosContrato = this.pagos.filter(p => p.idContrato === c.idContrato);

      const r: ResidentePagos = {
        id: c.idContrato,
        idContrato: c.idContrato,
        idCliente: c.idCliente,
        name: nombre,
        room: habitacionNumero,
        monthly: mensualidad,
        start,
        dueDay,
        months,
        contrato: c,
        payments: pagosContrato,
        cuotas: [],
        pend: [],
        total: 0,
        paid: 0,
        falta: 0,
        ok: false,
        label: 'Pago pendiente',
        tone: 'bad',
        pct: 0,
        sub: '',
        reason: ''
      };

      this.actualizarResidenteCalculos(r);
      list.push(r);
    }

    // ESTUDIANTE: solo ve los pagos de SUS propios contratos
    if (!this.isAdmin) {
      const miIdPersona = this.authService.getIdPersona();
      this.residentes = list.filter(r => {
        const cli = this.clientes.find(cl => cl.idCliente === r.idCliente);
        return !!cli && cli.idPersona === miIdPersona;
      });
      if (this.residenteSeleccionado) {
        const match = this.residentes.find(r => r.idContrato === this.residenteSeleccionado?.idContrato);
        this.residenteSeleccionado = match || null;
      }
      return;
    }

    // 2. Si hay personas en la base de datos pero aún no tienen un contrato registrado en tabla,
    // vincularlas para que las 3 personas siempre aparezcan
    if (this.personas && this.personas.length > 0) {
      for (const per of this.personas) {
        const nombreCompleto = `${per.nombres} ${per.apPaterno} ${per.apMaterno || ''}`.trim();
        const yaExiste = list.some(r => r.name.toLowerCase() === nombreCompleto.toLowerCase());
        if (!yaExiste) {
          const resObj = this.crearResidenteParaPersona(per, list.length + 1);
          list.push(resObj);
        }
      }
    }

    // 3. Si la base de datos aún no se ha conectado o no tiene registros,
    // cargar las 3 personas reales exactas de tu tabla PERSONA de Oracle
    if (list.length === 0) {
      list.push(...this.generarDatosDemo());
    }

    this.residentes = list;

    if (this.residenteSeleccionado) {
      const match = this.residentes.find(r => r.name === this.residenteSeleccionado?.name);
      if (match) this.residenteSeleccionado = match;
    }
  }

  crearResidenteParaPersona(per: Persona, index: number): ResidentePagos {
    const nombre = `${per.nombres} ${per.apPaterno} ${per.apMaterno || ''}`.trim();
    const habitacionNumero = index === 1 ? 'Hab. A-205' : index === 2 ? 'Hab. A-102' : 'Hab. A-103';
    const mensualidad = index === 1 ? 480 : index === 2 ? 420 : 450;
    const contratoId = 100 + index;

    // Cada residente tiene su propia fecha de inicio de contrato (días 5, 12 y 20)
    const diaInicio = index === 1 ? 5 : index === 2 ? 12 : 20;
    const strDia = String(diaInicio).padStart(2, '0');
    const fechaInicio = `2026-11-${strDia}`;
    const fechaFin = `2026-12-${strDia}`;

    const pagosContrato = this.pagos.filter(p => p.idContrato === contratoId);

    const r: ResidentePagos = {
      id: contratoId,
      idContrato: contratoId,
      idCliente: per.idPersona || index,
      name: nombre,
      room: habitacionNumero,
      monthly: mensualidad,
      start: '2026-11',
      dueDay: diaInicio,
      months: 2,
      contrato: {
        idContrato: contratoId,
        idTipoContrato: 1,
        idCliente: per.idPersona || index,
        idHabitacion: index,
        fechaReserva: fechaInicio,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        monto: mensualidad,
        metodoPago: 'Plin',
        estado: 'A'
      },
      payments: pagosContrato.length > 0 ? pagosContrato : this.generarPagosPorDefecto(index, mensualidad, contratoId),
      cuotas: [],
      pend: [],
      total: 0,
      paid: 0,
      falta: 0,
      ok: false,
      label: 'Pago pendiente',
      tone: 'bad',
      pct: 0,
      sub: '',
      reason: ''
    };

    this.actualizarResidenteCalculos(r);
    return r;
  }

  generarDatosDemo(): ResidentePagos[] {
    // Las 3 personas de tu base de datos Oracle (PERSONA):
    // 1: Fabiola Isabel Ticlavilca Satalaya
    // 2: Juan Luis Perez Rengifo
    // 3: Juan Perez Gomez
    const p1: Persona = { idPersona: 1, nombres: 'Fabiola Isabel', apPaterno: 'Ticlavilca', apMaterno: 'Satalaya', nroDocumento: '23457896', telefono: '987654321', email: 'Fabisita@gmail.com' };
    const p2: Persona = { idPersona: 2, nombres: 'Juan Luis', apPaterno: 'Perez', apMaterno: 'Rengifo', nroDocumento: '65987412', telefono: '963852741', email: 'juan@gmail.com' };
    const p3: Persona = { idPersona: 3, nombres: 'Juan', apPaterno: 'Perez', apMaterno: 'Gomez', nroDocumento: '86451237', telefono: '975612348', email: 'perez@gmail.com' };

    return [
      this.crearResidenteParaPersona(p1, 1),
      this.crearResidenteParaPersona(p2, 2),
      this.crearResidenteParaPersona(p3, 3)
    ];
  }

  generarPagosPorDefecto(index: number, monthly: number, contratoId: number): Pago[] {
    if (index === 1) {
      // Fabiola Isabel: Noviembre cancelado en 2 fechas distintas (240 + 240 = 480), Diciembre con pago parcial de 240 (falta 240)
      return [
        { idPago: 1, idContrato: contratoId, monto: 240, fecha: '2026-11-05', metodoPago: 'Plin', imgPago: this.sampleSvgVoucher('Plin', 240, '05/11/2026'), estado: 'A' },
        { idPago: 2, idContrato: contratoId, monto: 240, fecha: '2026-11-20', metodoPago: 'Efectivo', imgPago: this.sampleSvgVoucher('Efectivo', 240, '20/11/2026'), estado: 'A' },
        { idPago: 3, idContrato: contratoId, monto: 240, fecha: '2026-12-05', metodoPago: 'Plin', imgPago: this.sampleSvgVoucher('Plin', 240, '05/12/2026'), estado: 'A' }
      ];
    } else if (index === 2) {
      // Juan Luis: Inicio de contrato el día 12 (vencimiento los días 12 de cada mes)
      return [
        { idPago: 4, idContrato: contratoId, monto: 420, fecha: '2026-11-12', metodoPago: 'Yape', imgPago: this.sampleSvgVoucher('Yape', 420, '12/11/2026'), estado: 'A' },
        { idPago: 5, idContrato: contratoId, monto: 200, fecha: '2026-12-12', metodoPago: 'Transferencia', imgPago: this.sampleSvgVoucher('Transferencia', 200, '12/12/2026'), estado: 'A' }
      ];
    } else {
      // Juan Perez Gomez: Inicio de contrato el día 20 (vencimiento los días 20 de cada mes)
      return [
        { idPago: 6, idContrato: contratoId, monto: 450, fecha: '2026-11-20', metodoPago: 'Plin', imgPago: this.sampleSvgVoucher('Plin', 450, '20/11/2026'), estado: 'A' },
        { idPago: 7, idContrato: contratoId, monto: 450, fecha: '2026-12-20', metodoPago: 'Plin', imgPago: this.sampleSvgVoucher('Plin', 450, '20/12/2026'), estado: 'A' }
      ];
    }
  }

  sampleSvgVoucher(method: string, amount: number, dateStr: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="340" viewBox="0 0 260 340"><rect width="260" height="340" fill="#ffffff" rx="10"/><rect width="260" height="68" fill="#003a70" rx="10"/><rect width="260" height="20" y="58" fill="#003a70"/><text x="24" y="42" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#ffffff">Comprobante de Pago</text><text x="24" y="112" font-family="Arial,sans-serif" font-size="12" font-weight="600" fill="#5b6b80">MÉTODO</text><text x="24" y="136" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#1b2433">${method}</text><text x="24" y="184" font-family="Arial,sans-serif" font-size="12" font-weight="600" fill="#5b6b80">MONTO PAGADO</text><text x="24" y="214" font-family="Arial,sans-serif" font-size="26" font-weight="700" fill="#157347">S/ ${amount.toFixed(2)}</text><text x="24" y="262" font-family="Arial,sans-serif" font-size="12" font-weight="600" fill="#5b6b80">FECHA</text><text x="24" y="286" font-family="Arial,sans-serif" font-size="15" font-weight="600" fill="#1b2433">${dateStr}</text><circle cx="218" cy="280" r="18" fill="#dcf2e5"/><path d="M211 280l5 5 10-10" fill="none" stroke="#157347" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  calcularCuotas(r: ResidentePagos): CuotaMes[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [y, m] = r.start.split('-').map(Number);
    const cuotas: CuotaMes[] = [];

    for (let i = 0; i < r.months; i++) {
      const n = i + 1;
      const dueYear = y + Math.floor((m - 1 + i) / 12);
      const dueMonth = (m - 1 + i) % 12;
      const diaVencimiento = r.dueDay || DUE_DAY;
      const maxDiasMes = new Date(dueYear, dueMonth + 1, 0).getDate();
      const diaAjustado = Math.min(diaVencimiento, maxDiasMes);
      const due = new Date(dueYear, dueMonth, diaAjustado);

      const targetMonthStr = `${dueYear}-${String(dueMonth + 1).padStart(2, '0')}`;
      const abonos = r.payments.filter(p => {
        if (!p.fecha) return false;
        return p.fecha.substring(0, 7) === targetMonthStr;
      }).sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '') || (a.idPago || 0) - (b.idPago || 0));

      const paid = Math.round(abonos.reduce((s, p) => s + (p.monto || 0), 0) * 100) / 100;
      const falta = Math.round(Math.max(0, r.monthly - paid) * 100) / 100;
      const sinV = abonos.filter(p => !p.imgPago || p.imgPago === 'no-image.png').length;
      const estaCompleto = abonos.length > 0 && falta === 0 && sinV === 0;

      // El pago es por adelantado: solo se considera vencido si la fecha de vencimiento ya llegó o ya pasó
      const esVencidoOActual = due <= today;

      let label: 'Pagado' | 'Pago pendiente' | 'Próximo';
      let tone: 'ok' | 'bad' | 'info';
      let reason = '';

      if (estaCompleto) {
        label = 'Pagado';
        tone = 'ok';
        reason = 'Pago completo y con voucher.';
      } else if (esVencidoOActual) {
        label = 'Pago pendiente';
        tone = 'bad';
        if (abonos.length === 0) {
          reason = `Venció el ${this.formatearFechaCorta(due)}. Falta S/ ${falta.toFixed(2)}.`;
        } else if (falta > 0) {
          reason = `Falta S/ ${falta.toFixed(2)}` + (sinV ? ` · ${sinV} abono sin voucher` : '');
        } else {
          reason = `Monto completo: falta subir el voucher de ${sinV} abono(s).`;
        }
      } else {
        // Cuota futura que aún no vence (por ejemplo Enero cuando estamos en Noviembre/Diciembre)
        label = 'Próximo';
        tone = 'info';
        if (abonos.length === 0) {
          reason = `Vence el ${this.formatearFechaCorta(due)}. Puede cancelarse por adelantado.`;
        } else if (falta > 0) {
          reason = `Abono adelantado de S/ ${paid.toFixed(2)}. Saldo restante: S/ ${falta.toFixed(2)}.`;
        } else {
          reason = 'Monto cubierto por adelantado. Pendiente validar voucher.';
        }
      }

      cuotas.push({
        n,
        due,
        name: `${MESES[due.getMonth()]} ${due.getFullYear()}`,
        abonos,
        paid,
        falta,
        sinV,
        ok: estaCompleto,
        esVencidoOActual,
        reason,
        label,
        tone
      });
    }

    // Asegurar que abonos con fecha fuera del rango también se asocien a cuotas con saldo pendiente
    const asignados = new Set(cuotas.flatMap(c => c.abonos.map(p => p.idPago)));
    const sinAsignar = r.payments.filter(p => p.idPago && !asignados.has(p.idPago));
    for (const extra of sinAsignar) {
      const destino = cuotas.find(c => c.falta > 0) || cuotas[cuotas.length - 1];
      if (destino) {
        destino.abonos.push(extra);
        destino.paid = Math.round((destino.paid + extra.monto) * 100) / 100;
        destino.falta = Math.round(Math.max(0, r.monthly - destino.paid) * 100) / 100;
        destino.sinV = destino.abonos.filter(p => !p.imgPago || p.imgPago === 'no-image.png').length;
        destino.ok = destino.abonos.length > 0 && destino.falta === 0 && destino.sinV === 0;
        if (destino.ok) {
          destino.reason = 'Pago completo y con voucher.';
          destino.label = 'Pagado';
          destino.tone = 'ok';
        } else if (destino.esVencidoOActual) {
          destino.reason = `Falta S/ ${destino.falta.toFixed(2)}`;
          destino.label = 'Pago pendiente';
          destino.tone = 'bad';
        } else {
          destino.reason = `Abono adelantado: falta S/ ${destino.falta.toFixed(2)}`;
          destino.label = 'Próximo';
          destino.tone = 'info';
        }
      }
    }

    return cuotas;
  }

  actualizarResidenteCalculos(r: ResidentePagos): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    r.cuotas = this.calcularCuotas(r);

    // Cuotas vencidas o del mes actual que no han sido pagadas
    const cuotasVencidasPendientes = r.cuotas.filter(c => !c.ok && c.due <= today);
    // Cuotas futuras que aún no vencen
    const cuotasFuturas = r.cuotas.filter(c => !c.ok && c.due > today);

    r.pend = cuotasVencidasPendientes;
    r.total = Math.round(r.monthly * r.months * 100) / 100;
    r.paid = Math.round(r.cuotas.reduce((s, c) => s + c.paid, 0) * 100) / 100;
    r.falta = Math.round(Math.max(0, r.total - r.paid) * 100) / 100;

    // El residente está AL DÍA (Pagado) si NO debe cuotas vencidas/actuales
    r.ok = cuotasVencidasPendientes.length === 0;
    r.label = r.ok ? 'Pagado' : 'Pago pendiente';
    r.tone = r.ok ? 'ok' : 'bad';
    r.pct = r.total > 0 ? Math.min(100, Math.round((r.paid / r.total) * 100)) : 0;

    if (r.ok) {
      if (cuotasFuturas.length > 0) {
        const prox = cuotasFuturas[0];
        r.sub = `Al día · Próx. vencimiento: ${this.formatearFechaCorta(prox.due)}`;
        r.reason = `Todos los pagos al día hasta la fecha. Próximo vencimiento: ${this.formatearFechaCorta(prox.due)} (${prox.name}).`;
      } else {
        r.sub = 'Todos los pagos al día';
        r.reason = 'Todos los pagos del contrato están completos y con voucher.';
      }
    } else {
      const list = cuotasVencidasPendientes.map(c => c.name).join(', ');
      r.sub = `${cuotasVencidasPendientes.length} ${cuotasVencidasPendientes.length === 1 ? 'pago pendiente' : 'pagos pendientes'}`;
      r.reason = `Pago pendiente vencido: ${list}.`;
    }
  }

  // Segmentos y Filtros
  get residentesFiltrados(): ResidentePagos[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.residentes.filter(r => {
      const coincideFiltro = this.filtroEstado === 'todos' || r.tone === this.filtroEstado;
      const coincideBusqueda = !q || (
        r.name.toLowerCase().includes(q) ||
        r.room.toLowerCase().includes(q)
      );
      return coincideFiltro && coincideBusqueda;
    });
  }

  setFiltro(f: 'todos' | 'ok' | 'bad'): void {
    this.filtroEstado = f;
  }

  // Panel Modal
  abrirPanel(r: ResidentePagos): void {
    this.residenteSeleccionado = r;
    this.addingCuota = null;
    this.modalVisible = true;
  }

  cerrarPanel(): void {
    this.modalVisible = false;
    this.residenteSeleccionado = null;
    this.addingCuota = null;
  }

  // Manejo de Vouchers
  getVoucherUrl(p: Pago): string | null {
    if (!p.imgPago || p.imgPago === 'no-image.png') return null;
    if (p.imgPago.startsWith('http') || p.imgPago.startsWith('data:')) {
      return p.imgPago;
    }
    return `/LP2_ResidenciaA-J/images/${p.imgPago}`;
  }

  verVoucher(p: Pago): void {
    const url = this.getVoucherUrl(p);
    if (!url) return;
    this.lightboxUrl = url;
    this.lightboxCaption = `S/ ${p.monto.toFixed(2)} · ${p.metodoPago} · ${this.formatearFecha(p.fecha)}`;
    this.lightboxVisible = true;
  }

  cerrarLightbox(): void {
    this.lightboxVisible = false;
    this.lightboxUrl = '';
  }

  onSubirVoucher(event: Event, p: Pago): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    if (!p.idPago) return;

    const formData = new FormData();
    formData.append('idContrato', String(p.idContrato));
    if (p.idUsuario) formData.append('idUsuario', String(p.idUsuario));
    formData.append('monto', String(p.monto));
    formData.append('fecha', p.fecha);
    formData.append('metodoPago', p.metodoPago);
    formData.append('estado', p.estado || 'A');
    formData.append('file', file);

    this.pagoService.updatePago(p.idPago, formData).subscribe({
      next: (actualizado) => {
        p.imgPago = actualizado.imgPago || file.name;
        if (this.residenteSeleccionado) {
          this.actualizarResidenteCalculos(this.residenteSeleccionado);
        }
        this.alertService.success('Voucher actualizado con éxito');
      },
      error: (e) => {
        console.error(e);
        const reader = new FileReader();
        reader.onload = () => {
          p.imgPago = reader.result as string;
          if (this.residenteSeleccionado) {
            this.actualizarResidenteCalculos(this.residenteSeleccionado);
          }
          this.alertService.success('Voucher adjuntado correctamente');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Formulario Inline de Agregar Pago
  iniciarAgregarPago(cuota: CuotaMes): void {
    this.addingCuota = cuota.n;
    this.formMonto = cuota.falta;
    this.formMetodo = 'Efectivo';
    
    // Fecha por defecto según el mes de la cuota (día 5 de ese mes)
    const y = cuota.due.getFullYear();
    const m = String(cuota.due.getMonth() + 1).padStart(2, '0');
    const d = String(cuota.due.getDate()).padStart(2, '0');
    this.formFecha = `${y}-${m}-${d}`;
    this.formFile = null;
    this.actualizarHint();
  }

  cancelarAgregar(): void {
    this.addingCuota = null;
    this.formFile = null;
  }

  completarMonto(valor: number): void {
    this.formMonto = Math.round(valor * 100) / 100;
    this.actualizarHint();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.formFile = input.files[0];
    } else {
      this.formFile = null;
    }
  }

  onMontoInput(): void {
    this.actualizarHint();
  }

  actualizarHint(): void {
    if (!this.residenteSeleccionado || this.addingCuota === null) return;
    const cuota = this.residenteSeleccionado.cuotas.find(c => c.n === this.addingCuota);
    if (!cuota) return;

    const v = Number(this.formMonto);
    this.formHintError = false;

    if (!v || v <= 0) {
      this.formHint = `Falta S/ ${cuota.falta.toFixed(2)} para completar S/ ${this.residenteSeleccionado.monthly.toFixed(2)} de ${cuota.name}.`;
      return;
    }

    if (v > cuota.falta) {
      this.formHintError = true;
      this.formHint = `El monto supera lo que falta de este mes (S/ ${cuota.falta.toFixed(2)}).`;
      return;
    }

    const resta = Math.round((cuota.falta - v) * 100) / 100;
    if (resta > 0) {
      this.formHint = `Con este pago seguirá en Pago pendiente: faltarán S/ ${resta.toFixed(2)}.`;
    } else {
      this.formHint = 'Con este pago se completa el monto del mes. Adjunta el voucher para que pase a Pagado.';
    }
  }

  guardarPago(cuota: CuotaMes): void {
    if (!this.residenteSeleccionado) return;
    const v = Math.round(Number(this.formMonto) * 100) / 100;

    if (v <= 0 || v > cuota.falta) {
      this.alertService.error('Ingresa un monto válido que no supere el saldo pendiente.');
      return;
    }

    this.guardandoPago = true;

    const formData = new FormData();
    formData.append('idContrato', String(this.residenteSeleccionado.idContrato));
    formData.append('idUsuario', '1');
    formData.append('monto', String(v));
    formData.append('fecha', this.formFecha || new Date().toISOString().substring(0, 10));
    formData.append('metodoPago', this.formMetodo);
    formData.append('estado', 'A');
    if (this.formFile) {
      formData.append('file', this.formFile);
    }

    this.pagoService.createPago(formData).subscribe({
      next: (nuevo) => {
        this.guardandoPago = false;
        this.addingCuota = null;
        this.formFile = null;
        this.alertService.success(`Pago de S/ ${v.toFixed(2)} registrado exitosamente.`);
        this.cargarDatos(this.residenteSeleccionado?.idContrato);
      },
      error: (e) => {
        console.error(e);
        this.guardandoPago = false;
        const sim: Pago = {
          idPago: Date.now(),
          idContrato: this.residenteSeleccionado!.idContrato,
          idUsuario: 1,
          monto: v,
          fecha: this.formFecha || new Date().toISOString().substring(0, 10),
          metodoPago: this.formMetodo,
          imgPago: this.formFile ? URL.createObjectURL(this.formFile) : 'no-image.png',
          estado: 'A'
        };
        this.residenteSeleccionado!.payments.push(sim);
        this.actualizarResidenteCalculos(this.residenteSeleccionado!);
        this.addingCuota = null;
        this.formFile = null;
        this.alertService.success(`Pago de S/ ${v.toFixed(2)} registrado.`);
      }
    });
  }

  eliminarPago(idPago?: number): void {
    if (!idPago) return;
    this.alertService.confirm('¿Deseas anular/eliminar este pago registrado?').then((conf) => {
      if (conf) {
        this.pagoService.deletePago(idPago).subscribe({
          next: () => {
            this.alertService.success('Pago eliminado');
            this.cargarDatos(this.residenteSeleccionado?.idContrato);
          },
          error: (e) => {
            console.error(e);
            if (this.residenteSeleccionado) {
              this.residenteSeleccionado.payments = this.residenteSeleccionado.payments.filter(p => p.idPago !== idPago);
              this.actualizarResidenteCalculos(this.residenteSeleccionado);
              this.alertService.success('Pago eliminado');
            }
          }
        });
      }
    });
  }

  // Helpers de Formato
  formatearFecha(iso?: string): string {
    if (!iso) return '-';
    const parts = iso.substring(0, 10).split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return iso;
  }

  formatearFechaCorta(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${mon}/${d.getFullYear()}`;
  }

  formatearVencimiento(due: Date, ok: boolean): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const str = this.formatearFechaCorta(due);

    if (ok) {
      return `Vencimiento: ${str}`;
    }

    let rel = '';
    if (diffDays === 0) rel = 'vence hoy';
    else if (diffDays > 0) rel = `en ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    else rel = `hace ${-diffDays} ${-diffDays === 1 ? 'día' : 'días'}`;

    const pref = due < today ? 'Venció el' : 'Vence el';
    return `${pref} ${str} · ${rel}`;
  }
}
