package pe.edu.upeu.LP2_ResidenciaA.J.services;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.*;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReporteServiceImpl implements IReporteService {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<ReporteIngresoMesDTO> obtenerIngresosMensuales() {
        String sql = "SELECT " +
                     "    TO_CHAR(p.fecha, 'YYYY-MM') AS periodo, " +
                     "    COUNT(p.id_pago) AS total_pagos, " +
                     "    NVL(SUM(p.monto), 0) AS total_monto, " +
                     "    NVL(ROUND(AVG(p.monto), 2), 0) AS promedio_pago " +
                     "FROM PAGOS p " +
                     "GROUP BY TO_CHAR(p.fecha, 'YYYY-MM') " +
                     "ORDER BY periodo DESC";

        List<Object[]> rows = entityManager.createNativeQuery(sql).getResultList();
        List<ReporteIngresoMesDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            String periodo = (row[0] != null) ? row[0].toString() : "N/D";
            Long totalPagos = toLong(row[1]);
            Double totalMonto = toDouble(row[2]);
            Double promedioPago = toDouble(row[3]);
            result.add(new ReporteIngresoMesDTO(periodo, totalPagos, totalMonto, promedioPago));
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<ReporteHabitacionDTO> obtenerEstadoHabitacionesPorPiso() {
        String sql = "SELECT " +
                     "    h.piso, " +
                     "    COUNT(h.id_habitacion) AS total_habitaciones, " +
                     "    SUM(CASE WHEN UPPER(h.estado) = 'D' THEN 1 ELSE 0 END) AS disponibles, " +
                     "    SUM(CASE WHEN UPPER(h.estado) = 'O' THEN 1 ELSE 0 END) AS ocupadas, " +
                     "    SUM(CASE WHEN UPPER(h.estado) = 'M' THEN 1 ELSE 0 END) AS mantenimiento " +
                     "FROM HABITACIONES h " +
                     "GROUP BY h.piso " +
                     "ORDER BY h.piso ASC";

        List<Object[]> rows = entityManager.createNativeQuery(sql).getResultList();
        List<ReporteHabitacionDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            Integer piso = toInteger(row[0]);
            Long totalHabitaciones = toLong(row[1]);
            Long disponibles = toLong(row[2]);
            Long ocupadas = toLong(row[3]);
            Long mantenimiento = toLong(row[4]);
            result.add(new ReporteHabitacionDTO(piso, totalHabitaciones, disponibles, ocupadas, mantenimiento));
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<ReporteMetodoPagoDTO> obtenerIngresosPorMetodoPago() {
        String sql = "SELECT " +
                     "    NVL(UPPER(p.metodo_pago), 'NO ESPECIFICADO') AS metodo_pago, " +
                     "    COUNT(p.id_pago) AS cantidad_transacciones, " +
                     "    NVL(SUM(p.monto), 0) AS monto_total, " +
                     "    ROUND(COUNT(p.id_pago) * 100.0 / NULLIF((SELECT COUNT(*) FROM PAGOS), 0), 2) AS porcentaje_uso " +
                     "FROM PAGOS p " +
                     "GROUP BY UPPER(p.metodo_pago) " +
                     "ORDER BY monto_total DESC";

        List<Object[]> rows = entityManager.createNativeQuery(sql).getResultList();
        List<ReporteMetodoPagoDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            String metodo = (row[0] != null) ? row[0].toString() : "OTROS";
            Long cantidad = toLong(row[1]);
            Double total = toDouble(row[2]);
            Double porcentaje = toDouble(row[3]);
            result.add(new ReporteMetodoPagoDTO(metodo, cantidad, total, porcentaje));
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<ReporteContratoDetalleDTO> obtenerContratosDetallados() {
        String sql = "SELECT " +
                     "    c.id_contrato, " +
                     "    p.nombres || ' ' || p.ap_paterno || ' ' || NVL(p.ap_materno, '') AS cliente_nombre, " +
                     "    p.nro_documento, " +
                     "    p.telefono, " +
                     "    h.numero AS numero_habitacion, " +
                     "    h.piso, " +
                     "    tc.nombre AS tipo_contrato, " +
                     "    TO_CHAR(c.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio, " +
                     "    TO_CHAR(c.fecha_fin, 'YYYY-MM-DD') AS fecha_fin, " +
                     "    c.monto AS monto_pactado, " +
                     "    CASE WHEN UPPER(c.estado) IN ('1','A') THEN 'Activo' WHEN UPPER(c.estado) IN ('0','C') THEN 'Inactivo' ELSE c.estado END AS estado_contrato " +
                     "FROM CONTRATO c " +
                     "INNER JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente " +
                     "INNER JOIN PERSONA p ON cl.id_persona = p.id_persona " +
                     "INNER JOIN HABITACIONES h ON c.id_habitacion = h.id_habitacion " +
                     "INNER JOIN TIP_CONTRATO tc ON c.id_tipoContrato = tc.id_tipoContrato " +
                     "ORDER BY c.id_contrato DESC";

        return mapearContratos(entityManager.createNativeQuery(sql).getResultList());
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<ReporteContratoDetalleDTO> obtenerContratosVigentes() {
        String sql = "SELECT " +
                     "    c.id_contrato, " +
                     "    p.nombres || ' ' || p.ap_paterno || ' ' || NVL(p.ap_materno, '') AS cliente_nombre, " +
                     "    p.nro_documento, " +
                     "    p.telefono, " +
                     "    h.numero AS numero_habitacion, " +
                     "    h.piso, " +
                     "    tc.nombre AS tipo_contrato, " +
                     "    TO_CHAR(c.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio, " +
                     "    TO_CHAR(c.fecha_fin, 'YYYY-MM-DD') AS fecha_fin, " +
                     "    c.monto AS monto_pactado, " +
                     "    'Activo' AS estado_contrato " +
                     "FROM CONTRATO c " +
                     "INNER JOIN CLIENTES cl ON c.id_cliente = cl.id_cliente " +
                     "INNER JOIN PERSONA p ON cl.id_persona = p.id_persona " +
                     "INNER JOIN HABITACIONES h ON c.id_habitacion = h.id_habitacion " +
                     "INNER JOIN TIP_CONTRATO tc ON c.id_tipoContrato = tc.id_tipoContrato " +
                     "WHERE UPPER(c.estado) IN ('1', 'A') " +
                     "  AND TRUNC(SYSDATE) BETWEEN TRUNC(c.fecha_inicio) AND TRUNC(c.fecha_fin) " +
                     "ORDER BY c.id_contrato DESC " +
                     "FETCH FIRST 15 ROWS ONLY";

        return mapearContratos(entityManager.createNativeQuery(sql).getResultList());
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<ReporteTopClienteDTO> obtenerTop10Clientes() {
        String sql = "SELECT " +
                     "    cl.id_cliente, " +
                     "    p.nombres || ' ' || p.ap_paterno || ' ' || NVL(p.ap_materno, '') AS cliente, " +
                     "    p.nro_documento, " +
                     "    COUNT(pg.id_pago) AS nro_pagos, " +
                     "    NVL(SUM(pg.monto), 0) AS total_pagado " +
                     "FROM PAGOS pg " +
                     "INNER JOIN CONTRATO c  ON c.id_contrato = pg.id_contrato " +
                     "INNER JOIN CLIENTES cl ON cl.id_cliente = c.id_cliente " +
                     "INNER JOIN PERSONA p   ON p.id_persona = cl.id_persona " +
                     "GROUP BY cl.id_cliente, p.nombres, p.ap_paterno, p.ap_materno, p.nro_documento " +
                     "ORDER BY total_pagado DESC " +
                     "FETCH FIRST 10 ROWS ONLY";

        List<Object[]> rows = entityManager.createNativeQuery(sql).getResultList();
        List<ReporteTopClienteDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            Long idCliente = toLong(row[0]);
            String cliente = (row[1] != null) ? row[1].toString().trim() : "";
            String dni = (row[2] != null) ? row[2].toString() : "";
            Long nroPagos = toLong(row[3]);
            Double totalPagado = toDouble(row[4]);
            result.add(new ReporteTopClienteDTO(idCliente, cliente, dni, nroPagos, totalPagado));
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<ReporteNotificacionRolDTO> obtenerNotificacionesSinLeerPorRol() {
        String sql = "SELECT " +
                     "    r.nombre AS rol, " +
                     "    COUNT(n.id_notificacion) AS sin_leer " +
                     "FROM NOTIFICACIONES n " +
                     "INNER JOIN USUARIOS u ON u.id_usuario = n.id_usuario " +
                     "INNER JOIN ROLES r    ON r.id_rol = u.id_rol " +
                     "WHERE n.leido = 0 " +
                     "GROUP BY r.nombre " +
                     "ORDER BY sin_leer DESC " +
                     "FETCH FIRST 10 ROWS ONLY";

        List<Object[]> rows = entityManager.createNativeQuery(sql).getResultList();
        List<ReporteNotificacionRolDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            String rol = (row[0] != null) ? row[0].toString() : "Sin Rol";
            Long sinLeer = toLong(row[1]);
            result.add(new ReporteNotificacionRolDTO(rol, sinLeer));
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteResumenGeneralDTO obtenerResumenGeneral() {
        String sqlHab = "SELECT " +
                        "    COUNT(*), " +
                        "    SUM(CASE WHEN UPPER(estado) = 'D' THEN 1 ELSE 0 END), " +
                        "    SUM(CASE WHEN UPPER(estado) = 'O' THEN 1 ELSE 0 END) " +
                        "FROM HABITACIONES";

        Object[] rowHab = (Object[]) entityManager.createNativeQuery(sqlHab).getSingleResult();
        Long totalHab = toLong(rowHab[0]);
        Long habDisp = toLong(rowHab[1]);
        Long habOcup = toLong(rowHab[2]);

        String sqlContr = "SELECT COUNT(*) FROM CONTRATO WHERE UPPER(estado) IN ('1', 'A')";
        Object rowContr = entityManager.createNativeQuery(sqlContr).getSingleResult();
        Long contratosActivos = toLong(rowContr);

        String sqlPagos = "SELECT COUNT(*), NVL(SUM(monto), 0) FROM PAGOS";
        Object[] rowPagos = (Object[]) entityManager.createNativeQuery(sqlPagos).getSingleResult();
        Long totalPagos = toLong(rowPagos[0]);
        Double totalRecaudado = toDouble(rowPagos[1]);

        return new ReporteResumenGeneralDTO(totalHab, habDisp, habOcup, contratosActivos, totalRecaudado, totalPagos);
    }

    private List<ReporteContratoDetalleDTO> mapearContratos(List<Object[]> rows) {
        List<ReporteContratoDetalleDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            Long idContrato = toLong(row[0]);
            String clienteNombre = (row[1] != null) ? row[1].toString().trim() : "";
            String nroDocumento = (row[2] != null) ? row[2].toString() : "";
            String telefono = (row[3] != null) ? row[3].toString() : "";
            String numeroHabitacion = (row[4] != null) ? row[4].toString() : "";
            Integer piso = toInteger(row[5]);
            String tipoContrato = (row[6] != null) ? row[6].toString() : "";
            String fechaInicio = (row[7] != null) ? row[7].toString() : "";
            String fechaFin = (row[8] != null) ? row[8].toString() : "";
            Double montoPactado = toDouble(row[9]);
            String estadoContrato = (row[10] != null) ? row[10].toString() : "";

            result.add(new ReporteContratoDetalleDTO(idContrato, clienteNombre, nroDocumento, telefono,
                    numeroHabitacion, piso, tipoContrato, fechaInicio, fechaFin, montoPactado, estadoContrato));
        }
        return result;
    }

    private Long toLong(Object val) {
        if (val == null) return 0L;
        if (val instanceof Number) return ((Number) val).longValue();
        try {
            return Long.parseLong(val.toString());
        } catch (Exception e) {
            return 0L;
        }
    }

    private Integer toInteger(Object val) {
        if (val == null) return 0;
        if (val instanceof Number) return ((Number) val).intValue();
        try {
            return Integer.parseInt(val.toString());
        } catch (Exception e) {
            return 0;
        }
    }

    private Double toDouble(Object val) {
        if (val == null) return 0.0;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try {
            return Double.parseDouble(val.toString());
        } catch (Exception e) {
            return 0.0;
        }
    }
}
