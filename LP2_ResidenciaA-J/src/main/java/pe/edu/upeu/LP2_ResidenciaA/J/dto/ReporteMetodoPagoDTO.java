package pe.edu.upeu.LP2_ResidenciaA.J.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para Reporte de Ingresos por Método de Pago")
public class ReporteMetodoPagoDTO {
    private String metodoPago;
    private Long cantidadTransacciones;
    private Double montoTotal;
    private Double porcentajeUso;

    public ReporteMetodoPagoDTO() {}

    public ReporteMetodoPagoDTO(String metodoPago, Long cantidadTransacciones, Double montoTotal, Double porcentajeUso) {
        this.metodoPago = metodoPago;
        this.cantidadTransacciones = cantidadTransacciones;
        this.montoTotal = montoTotal;
        this.porcentajeUso = porcentajeUso;
    }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public Long getCantidadTransacciones() { return cantidadTransacciones; }
    public void setCantidadTransacciones(Long cantidadTransacciones) { this.cantidadTransacciones = cantidadTransacciones; }

    public Double getMontoTotal() { return montoTotal; }
    public void setMontoTotal(Double montoTotal) { this.montoTotal = montoTotal; }

    public Double getPorcentajeUso() { return porcentajeUso; }
    public void setPorcentajeUso(Double porcentajeUso) { this.porcentajeUso = porcentajeUso; }
}

