package pe.edu.upeu.LP2_ResidenciaA.J.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para Reporte de Contratos y Residentes con SQL Nativo")
public class ReporteContratoDetalleDTO {
    private Long idContrato;
    private String clienteNombre;
    private String nroDocumento;
    private String telefono;
    private String numeroHabitacion;
    private Integer piso;
    private String tipoContrato;
    private String fechaInicio;
    private String fechaFin;
    private Double montoPactado;
    private String estadoContrato;

    public ReporteContratoDetalleDTO() {}

    public ReporteContratoDetalleDTO(Long idContrato, String clienteNombre, String nroDocumento, String telefono,
                                     String numeroHabitacion, Integer piso, String tipoContrato, String fechaInicio,
                                     String fechaFin, Double montoPactado, String estadoContrato) {
        this.idContrato = idContrato;
        this.clienteNombre = clienteNombre;
        this.nroDocumento = nroDocumento;
        this.telefono = telefono;
        this.numeroHabitacion = numeroHabitacion;
        this.piso = piso;
        this.tipoContrato = tipoContrato;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.montoPactado = montoPactado;
        this.estadoContrato = estadoContrato;
    }

    public Long getIdContrato() { return idContrato; }
    public void setIdContrato(Long idContrato) { this.idContrato = idContrato; }

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public String getNroDocumento() { return nroDocumento; }
    public void setNroDocumento(String nroDocumento) { this.nroDocumento = nroDocumento; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getNumeroHabitacion() { return numeroHabitacion; }
    public void setNumeroHabitacion(String numeroHabitacion) { this.numeroHabitacion = numeroHabitacion; }

    public Integer getPiso() { return piso; }
    public void setPiso(Integer piso) { this.piso = piso; }

    public String getTipoContrato() { return tipoContrato; }
    public void setTipoContrato(String tipoContrato) { this.tipoContrato = tipoContrato; }

    public String getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(String fechaInicio) { this.fechaInicio = fechaInicio; }

    public String getFechaFin() { return fechaFin; }
    public void setFechaFin(String fechaFin) { this.fechaFin = fechaFin; }

    public Double getMontoPactado() { return montoPactado; }
    public void setMontoPactado(Double montoPactado) { this.montoPactado = montoPactado; }

    public String getEstadoContrato() { return estadoContrato; }
    public void setEstadoContrato(String estadoContrato) { this.estadoContrato = estadoContrato; }
}

