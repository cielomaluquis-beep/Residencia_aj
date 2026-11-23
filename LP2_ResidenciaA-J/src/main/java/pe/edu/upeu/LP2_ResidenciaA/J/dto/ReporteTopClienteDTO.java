package pe.edu.upeu.LP2_ResidenciaA.J.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para Reporte R2: Top 10 clientes que más han pagado")
public class ReporteTopClienteDTO {
    private Long idCliente;
    private String cliente;
    private String nroDocumento;
    private Long nroPagos;
    private Double totalPagado;

    public ReporteTopClienteDTO() {}

    public ReporteTopClienteDTO(Long idCliente, String cliente, String nroDocumento, Long nroPagos, Double totalPagado) {
        this.idCliente = idCliente;
        this.cliente = cliente;
        this.nroDocumento = nroDocumento;
        this.nroPagos = nroPagos;
        this.totalPagado = totalPagado;
    }

    public Long getIdCliente() { return idCliente; }
    public void setIdCliente(Long idCliente) { this.idCliente = idCliente; }

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public String getNroDocumento() { return nroDocumento; }
    public void setNroDocumento(String nroDocumento) { this.nroDocumento = nroDocumento; }

    public Long getNroPagos() { return nroPagos; }
    public void setNroPagos(Long nroPagos) { this.nroPagos = nroPagos; }

    public Double getTotalPagado() { return totalPagado; }
    public void setTotalPagado(Double totalPagado) { this.totalPagado = totalPagado; }
}

