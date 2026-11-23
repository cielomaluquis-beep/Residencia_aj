package pe.edu.upeu.LP2_ResidenciaA.J.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Datos de entrada para el procedimiento almacenado SP_CAMBIAR_ESTADO_HABITACION")
public class CambiarEstadoHabitacionSPDTO {

    @Schema(description = "ID de la habitación", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "El ID de la habitación es obligatorio")
    private Long idHabitacion;

    @Schema(description = "Nuevo estado: D (Disponible), O (Ocupada), M (Mantenimiento)", example = "D", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "El nuevo estado es obligatorio")
    @Pattern(regexp = "^[DOMdom]$", message = "El estado debe ser D, O o M")
    private String nuevoEstado;

    public CambiarEstadoHabitacionSPDTO() {}

    public CambiarEstadoHabitacionSPDTO(Long idHabitacion, String nuevoEstado) {
        this.idHabitacion = idHabitacion;
        this.nuevoEstado = nuevoEstado;
    }

    public Long getIdHabitacion() { return idHabitacion; }
    public void setIdHabitacion(Long idHabitacion) { this.idHabitacion = idHabitacion; }

    public String getNuevoEstado() { return nuevoEstado; }
    public void setNuevoEstado(String nuevoEstado) { this.nuevoEstado = nuevoEstado; }
}

