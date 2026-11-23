package pe.edu.upeu.LP2_ResidenciaA.J.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.*;
import pe.edu.upeu.LP2_ResidenciaA.J.services.IReporteService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reportes")
@Tag(name = "Reportes SQL", description = "Reportes Analíticos y Estadísticos con SQL Nativo desde Spring Boot (LP)")
public class ReporteController {

    @Autowired
    private IReporteService reporteService;

    @GetMapping("/ingresos-mensuales")
    @Operation(summary = "Reporte SQL: Ingresos Mensuales", description = "Agrupa pagos por año/mes con totales y promedios")
    public ResponseEntity<List<ReporteIngresoMesDTO>> obtenerIngresosMensuales() {
        return ResponseEntity.ok(reporteService.obtenerIngresosMensuales());
    }

    @GetMapping("/habitaciones-piso")
    @Operation(summary = "Reporte SQL (R4): Estado de Habitaciones por Piso", description = "Totaliza habitaciones disponibles, ocupadas y en mantenimiento por cada piso")
    public ResponseEntity<List<ReporteHabitacionDTO>> obtenerEstadoHabitacionesPorPiso() {
        return ResponseEntity.ok(reporteService.obtenerEstadoHabitacionesPorPiso());
    }

    @GetMapping("/metodos-pago")
    @Operation(summary = "Reporte SQL (R3): Recaudación por Método de Pago", description = "Calcula montos, promedios y porcentajes por método de pago")
    public ResponseEntity<List<ReporteMetodoPagoDTO>> obtenerIngresosPorMetodoPago() {
        return ResponseEntity.ok(reporteService.obtenerIngresosPorMetodoPago());
    }

    @GetMapping("/contratos-detallados")
    @Operation(summary = "Reporte SQL: Contratos y Residentes Detallados", description = "Consulta SQL con INNER JOINs entre CONTRATO, CLIENTES, PERSONA, HABITACIONES y TIP_CONTRATO")
    public ResponseEntity<List<ReporteContratoDetalleDTO>> obtenerContratosDetallados() {
        return ResponseEntity.ok(reporteService.obtenerContratosDetallados());
    }

    @GetMapping("/contratos-vigentes")
    @Operation(summary = "Reporte SQL (R1): Contratos Vigentes Hoy", description = "Consulta los contratos vigentes a la fecha actual (SYSDATE BETWEEN fecha_inicio AND fecha_fin)")
    public ResponseEntity<List<ReporteContratoDetalleDTO>> obtenerContratosVigentes() {
        return ResponseEntity.ok(reporteService.obtenerContratosVigentes());
    }

    @GetMapping("/top-clientes")
    @Operation(summary = "Reporte SQL (R2): Top 10 Clientes que Más Han Pagado", description = "Suma los pagos por cliente ordenando descendentemente con FETCH FIRST 10 ROWS ONLY")
    public ResponseEntity<List<ReporteTopClienteDTO>> obtenerTop10Clientes() {
        return ResponseEntity.ok(reporteService.obtenerTop10Clientes());
    }

    @GetMapping("/notificaciones-rol")
    @Operation(summary = "Reporte SQL (R5): Notificaciones Sin Leer por Rol", description = "Cuenta notificaciones con leido = 0 agrupadas por rol de usuario")
    public ResponseEntity<List<ReporteNotificacionRolDTO>> obtenerNotificacionesSinLeerPorRol() {
        return ResponseEntity.ok(reporteService.obtenerNotificacionesSinLeerPorRol());
    }

    @GetMapping("/resumen-general")
    @Operation(summary = "Reporte SQL: Resumen General de KPIs", description = "Métricas agregadas de la residencia")
    public ResponseEntity<ReporteResumenGeneralDTO> obtenerResumenGeneral() {
        return ResponseEntity.ok(reporteService.obtenerResumenGeneral());
    }
}
