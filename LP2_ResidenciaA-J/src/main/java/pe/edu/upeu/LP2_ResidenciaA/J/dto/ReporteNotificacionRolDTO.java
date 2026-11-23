package pe.edu.upeu.LP2_ResidenciaA.J.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para Reporte R5: Notificaciones sin leer por rol")
public class ReporteNotificacionRolDTO {
    private String rol;
    private Long sinLeer;

    public ReporteNotificacionRolDTO() {}

    public ReporteNotificacionRolDTO(String rol, Long sinLeer) {
        this.rol = rol;
        this.sinLeer = sinLeer;
    }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public Long getSinLeer() { return sinLeer; }
    public void setSinLeer(Long sinLeer) { this.sinLeer = sinLeer; }
}

