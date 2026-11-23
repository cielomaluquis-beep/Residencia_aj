package pe.edu.upeu.LP2_ResidenciaA.J.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para Reporte de Ingresos por Período Mensual")
public class ReporteIngresoMesDTO {
    private String periodo;
    private Long totalPagos;
    private Double totalMonto;
    private Double promedioPago;

    public ReporteIngresoMesDTO() {}

    public ReporteIngresoMesDTO(String periodo, Long totalPagos, Double totalMonto, Double promedioPago) {
        this.periodo = periodo;
        this.totalPagos = totalPagos;
        this.totalMonto = totalMonto;
        this.promedioPago = promedioPago;
    }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public Long getTotalPagos() { return totalPagos; }
    public void setTotalPagos(Long totalPagos) { this.totalPagos = totalPagos; }

    public Double getTotalMonto() { return totalMonto; }
    public void setTotalMonto(Double totalMonto) { this.totalMonto = totalMonto; }

    public Double getPromedioPago() { return promedioPago; }
    public void setPromedioPago(Double promedioPago) { this.promedioPago = promedioPago; }
}

