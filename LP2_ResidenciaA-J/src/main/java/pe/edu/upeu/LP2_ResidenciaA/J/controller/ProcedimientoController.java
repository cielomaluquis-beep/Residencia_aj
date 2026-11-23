package pe.edu.upeu.LP2_ResidenciaA.J.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.CambiarEstadoHabitacionSPDTO;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.RegistrarPagoSPDTO;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.SpDiccionarioResponseDTO;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.SpResponseDTO;
import pe.edu.upeu.LP2_ResidenciaA.J.services.IProcedimientoService;

@RestController
@RequestMapping("/api/v1/procedimientos")
@Tag(name = "Procedimientos Almacenados", description = "Llamadas a Procedimientos Almacenados (PL/SQL) en Oracle desde Spring Boot (LP)")
public class ProcedimientoController {

    @Autowired
    private IProcedimientoService procedimientoService;

    @PostMapping("/cambiar-estado-habitacion")
    @Operation(
        summary = "Ejecutar SP_CAMBIAR_ESTADO_HABITACION",
        description = "Invoca el procedimiento almacenado en Oracle para cambiar el estado de una habitación (D: Disponible, O: Ocupada, M: Mantenimiento)"
    )
    public ResponseEntity<SpResponseDTO> cambiarEstadoHabitacion(@Valid @RequestBody CambiarEstadoHabitacionSPDTO dto) {
        try {
            SpResponseDTO respuesta = procedimientoService.cambiarEstadoHabitacion(dto);
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(new SpResponseDTO(-1, "Error: " + e.getMessage()));
        }
    }

    @PostMapping("/registrar-pago")
    @Operation(
        summary = "Ejecutar SP_REGISTRAR_PAGO",
        description = "Invoca el procedimiento almacenado en Oracle para registrar un pago, validando contrato y generando el ID correspondiente"
    )
    public ResponseEntity<SpResponseDTO> registrarPago(@Valid @RequestBody RegistrarPagoSPDTO dto) {
        try {
            SpResponseDTO respuesta = procedimientoService.registrarPago(dto);
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(new SpResponseDTO(-1, "Error: " + e.getMessage()));
        }
    }

    @GetMapping("/p333")
    @Operation(
        summary = "Ejecutar P333 (DDL de Tablas de Usuario)",
        description = "Invoca el procedimiento de clase P333(PUS) capturando su salida DBMS_OUTPUT desde Spring Boot"
    )
    public ResponseEntity<SpDiccionarioResponseDTO> ejecutarP333(
            @Parameter(description = "Usuario dueño del esquema en Oracle", example = "RESIDENCIA_AJ")
            @RequestParam(defaultValue = "RESIDENCIA_AJ") String usuario) {
        return ResponseEntity.ok(procedimientoService.ejecutarP333(usuario));
    }

    @GetMapping("/p334")
    @Operation(
        summary = "Ejecutar P334 (Privilegios otorgados por Usuario)",
        description = "Invoca el procedimiento de clase P334(PUS) capturando su salida DBMS_OUTPUT desde Spring Boot"
    )
    public ResponseEntity<SpDiccionarioResponseDTO> ejecutarP334(
            @Parameter(description = "Usuario dueño del esquema en Oracle", example = "RESIDENCIA_AJ")
            @RequestParam(defaultValue = "RESIDENCIA_AJ") String usuario) {
        return ResponseEntity.ok(procedimientoService.ejecutarP334(usuario));
    }

    @GetMapping("/p336")
    @Operation(
        summary = "Ejecutar P336 (Espacio y % ocupado por Tablas)",
        description = "Invoca el procedimiento de clase P336(PUS) capturando su salida DBMS_OUTPUT desde Spring Boot"
    )
    public ResponseEntity<SpDiccionarioResponseDTO> ejecutarP336(
            @Parameter(description = "Usuario dueño del esquema en Oracle", example = "RESIDENCIA_AJ")
            @RequestParam(defaultValue = "RESIDENCIA_AJ") String usuario) {
        return ResponseEntity.ok(procedimientoService.ejecutarP336(usuario));
    }
}
