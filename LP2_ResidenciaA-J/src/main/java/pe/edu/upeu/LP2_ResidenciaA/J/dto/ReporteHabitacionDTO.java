package pe.edu.upeu.LP2_ResidenciaA.J.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para Reporte de Ocupación de Habitaciones por Piso")
public class ReporteHabitacionDTO {
    private Integer piso;
    private Long totalHabitaciones;
    private Long disponibles;
    private Long ocupadas;
    private Long mantenimiento;

    public ReporteHabitacionDTO() {}

    public ReporteHabitacionDTO(Integer piso, Long totalHabitaciones, Long disponibles, Long ocupadas, Long mantenimiento) {
        this.piso = piso;
        this.totalHabitaciones = totalHabitaciones;
        this.disponibles = disponibles;
        this.ocupadas = ocupadas;
        this.mantenimiento = mantenimiento;
    }

    public Integer getPiso() { return piso; }
    public void setPiso(Integer piso) { this.piso = piso; }

    public Long getTotalHabitaciones() { return totalHabitaciones; }
    public void setTotalHabitaciones(Long totalHabitaciones) { this.totalHabitaciones = totalHabitaciones; }

    public Long getDisponibles() { return disponibles; }
    public void setDisponibles(Long disponibles) { this.disponibles = disponibles; }

    public Long getOcupadas() { return ocupadas; }
    public void setOcupadas(Long ocupadas) { this.ocupadas = ocupadas; }

    public Long getMantenimiento() { return mantenimiento; }
    public void setMantenimiento(Long mantenimiento) { this.mantenimiento = mantenimiento; }
}

