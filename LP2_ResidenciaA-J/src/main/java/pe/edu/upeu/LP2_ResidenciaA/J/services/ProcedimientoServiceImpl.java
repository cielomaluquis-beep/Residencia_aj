package pe.edu.upeu.LP2_ResidenciaA.J.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.CambiarEstadoHabitacionSPDTO;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.RegistrarPagoSPDTO;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.SpDiccionarioResponseDTO;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.SpResponseDTO;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProcedimientoServiceImpl implements IProcedimientoService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public SpResponseDTO cambiarEstadoHabitacion(CambiarEstadoHabitacionSPDTO dto) {
        try {
            return jdbcTemplate.execute((Connection con) -> {
                String sql = "{call SP_CAMBIAR_ESTADO_HABITACION(?, ?, ?, ?)}";
                try (CallableStatement cs = con.prepareCall(sql)) {
                    cs.setLong(1, dto.getIdHabitacion());
                    cs.setString(2, dto.getNuevoEstado());
                    cs.registerOutParameter(3, Types.NUMERIC);
                    cs.registerOutParameter(4, Types.VARCHAR);

                    cs.execute();

                    int codigo = cs.getInt(3);
                    String mensaje = cs.getString(4);
                    return new SpResponseDTO(codigo, mensaje);
                }
            });
        } catch (Exception e) {
            String msg = obtenerMensajeRaiz(e);
            if (msg.contains("PLS-00201") || msg.contains("ORA-06550")) {
                return new SpResponseDTO(-1, "El procedimiento SP_CAMBIAR_ESTADO_HABITACION no está compilado en Oracle. Ejecuta 02_procedimientos_almacenados.sql en Oracle SQL Developer. Detalle: " + msg);
            }
            return new SpResponseDTO(-1, "Error en BD Oracle: " + msg);
        }
    }

    @Override
    public SpResponseDTO registrarPago(RegistrarPagoSPDTO dto) {
        try {
            return jdbcTemplate.execute((Connection con) -> {
                String sql = "{call SP_REGISTRAR_PAGO(?, ?, ?, ?, ?, ?, ?)}";
                try (CallableStatement cs = con.prepareCall(sql)) {
                    cs.setLong(1, dto.getIdContrato());
                    cs.setLong(2, dto.getIdUsuario());
                    cs.setDouble(3, dto.getMonto());
                    cs.setString(4, dto.getMetodoPago());
                    cs.registerOutParameter(5, Types.NUMERIC);
                    cs.registerOutParameter(6, Types.NUMERIC);
                    cs.registerOutParameter(7, Types.VARCHAR);

                    cs.execute();

                    long idGenerado = cs.getLong(5);
                    int codigo = cs.getInt(6);
                    String mensaje = cs.getString(7);
                    return new SpResponseDTO(codigo, mensaje, idGenerado > 0 ? idGenerado : null);
                }
            });
        } catch (Exception e) {
            String msg = obtenerMensajeRaiz(e);
            if (msg.contains("PLS-00201") || msg.contains("ORA-06550")) {
                return new SpResponseDTO(-1, "El procedimiento SP_REGISTRAR_PAGO no está compilado en Oracle. Ejecuta 02_procedimientos_almacenados.sql en Oracle SQL Developer. Detalle: " + msg);
            }
            return new SpResponseDTO(-1, "Error en BD Oracle: " + msg);
        }
    }

    @Override
    public SpDiccionarioResponseDTO ejecutarP333(String usuario) {
        return ejecutarProcedimientoDbmsOutput("P333", usuario);
    }

    @Override
    public SpDiccionarioResponseDTO ejecutarP334(String usuario) {
        return ejecutarProcedimientoDbmsOutput("P334", usuario);
    }

    @Override
    public SpDiccionarioResponseDTO ejecutarP336(String usuario) {
        return ejecutarProcedimientoDbmsOutput("P336", usuario);
    }

    private SpDiccionarioResponseDTO ejecutarProcedimientoDbmsOutput(String nombreProc, String usuario) {
        String userParam = (usuario == null || usuario.isBlank()) ? "RESIDENCIA_AJ" : usuario.trim().toUpperCase();
        try {
            return jdbcTemplate.execute((Connection con) -> {
                List<String> lineas = new ArrayList<>();

                // 1. Habilitar el buffer DBMS_OUTPUT de Oracle para la sesión JDBC actual
                try (CallableStatement enableStmt = con.prepareCall("{call DBMS_OUTPUT.ENABLE(1000000)}")) {
                    enableStmt.execute();
                }

                // 2. Ejecutar el procedimiento almacenado (P333, P334 o P336)
                try (CallableStatement procStmt = con.prepareCall("{call " + nombreProc + "(?)}")) {
                    procStmt.setString(1, userParam);
                    procStmt.execute();
                }

                // 3. Extraer línea por línea desde DBMS_OUTPUT
                try (CallableStatement getLineStmt = con.prepareCall("{call DBMS_OUTPUT.GET_LINE(?, ?)}")) {
                    getLineStmt.registerOutParameter(1, Types.VARCHAR);
                    getLineStmt.registerOutParameter(2, Types.NUMERIC);
                    while (true) {
                        getLineStmt.execute();
                        int status = getLineStmt.getInt(2);
                        if (status != 0) {
                            break;
                        }
                        String linea = getLineStmt.getString(1);
                        lineas.add(linea != null ? linea : "");
                    }
                }

                // 4. Deshabilitar DBMS_OUTPUT para limpiar memoria
                try (CallableStatement disableStmt = con.prepareCall("{call DBMS_OUTPUT.DISABLE}")) {
                    disableStmt.execute();
                }

                String salidaTexto = String.join("\n", lineas);
                return new SpDiccionarioResponseDTO(0, "Procedimiento " + nombreProc + " ejecutado correctamente para " + userParam, lineas, salidaTexto);
            });
        } catch (Exception e) {
            e.printStackTrace();
            String msg = obtenerMensajeRaiz(e);
            if (msg.contains("PLS-00201")) {
                return new SpDiccionarioResponseDTO(-1, "El procedimiento " + nombreProc + " no existe en Oracle. Abre 02_procedimientos_almacenados.sql en SQL Developer y ejecútalo con F5.", List.of(), "");
            }
            return new SpDiccionarioResponseDTO(-1, "Error ejecutando " + nombreProc + ": " + msg, List.of(), "");
        }
    }

    private String obtenerMensajeRaiz(Exception e) {
        Throwable root = NestedExceptionUtils.getMostSpecificCause(e);
        if (root != null && root.getMessage() != null) {
            return root.getMessage();
        }
        return e.getMessage() != null ? e.getMessage() : e.toString();
    }
}
