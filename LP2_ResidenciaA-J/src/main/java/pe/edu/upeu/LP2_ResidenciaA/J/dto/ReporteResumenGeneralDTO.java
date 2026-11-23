package pe.edu.upeu.LP2_ResidenciaA.J.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para Resumen General de Métricas y KPIs de la Residencia")
public class ReporteResumenGeneralDTO {
    private Long totalHabitaciones;
    private Long habitacionesDisponibles;
    private Long habitacionesOcupadas;
    private Long totalContratosActivos;
    private Double totalRecaudado;
    private Long totalPagos;

    public ReporteResumenGeneralDTO() {}

    public ReporteResumenGeneralDTO(Long totalHabitaciones, Long habitacionesDisponibles, Long habitacionesOcupadas,
                                   Long totalContratosActivos, Double totalRecaudado, Long totalPagos) {
        this.totalHabitaciones = totalHabitaciones;
        this.habitacionesDisponibles = habitacionesDisponibles;
        this.habitacionesOcupadas = habitacionesOcupadas;
        this.totalContratosActivos = totalContratosActivos;
        this.totalRecaudado = totalRecaudado;
        this.totalPagos = totalPagos;
    }

    public Long getTotalHabitaciones() { return totalHabitaciones; }
    public void setTotalHabitaciones(Long totalHabitaciones) { this.totalHabitaciones = totalHabitaciones; }

    public Long getHabitacionesDisponibles() { return habitacionesDisponibles; }
    public void setHabitacionesDisponibles(Long habitacionesDisponibles) { this.habitacionesDisponibles = habitacionesDisponibles; }

    public Long getHabitacionesOcupadas() { return habitacionesOcupadas; }
    public void setHabitacionesOcupadas(Long habitacionesOcupadas) { this.habitacionesOcupadas = habitacionesOcupadas; }

    public Long getTotalContratosActivos() { return totalContratosActivos; }
    public void setTotalContratosActivos(Long totalContratosActivos) { this.totalContratosActivos = totalContratosActivos; }

    public Double getTotalRecaudado() { return totalRecaudado; }
    public void setTotalRecaudado(Double totalRecaudado) { this.totalRecaudado = totalRecaudado; }

    public Long getTotalPagos() { return totalPagos; }
    public void setTotalPagos(Long totalPagos) { this.totalPagos = totalPagos; }
}

