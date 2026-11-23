package pe.edu.upeu.LP2_ResidenciaA.J.services;

import pe.edu.upeu.LP2_ResidenciaA.J.dto.*;

import java.util.List;

public interface IReporteService {
    List<ReporteIngresoMesDTO> obtenerIngresosMensuales();
    List<ReporteHabitacionDTO> obtenerEstadoHabitacionesPorPiso();
    List<ReporteMetodoPagoDTO> obtenerIngresosPorMetodoPago();
    List<ReporteContratoDetalleDTO> obtenerContratosDetallados();
    List<ReporteContratoDetalleDTO> obtenerContratosVigentes();
    List<ReporteTopClienteDTO> obtenerTop10Clientes();
    List<ReporteNotificacionRolDTO> obtenerNotificacionesSinLeerPorRol();
    ReporteResumenGeneralDTO obtenerResumenGeneral();
}
