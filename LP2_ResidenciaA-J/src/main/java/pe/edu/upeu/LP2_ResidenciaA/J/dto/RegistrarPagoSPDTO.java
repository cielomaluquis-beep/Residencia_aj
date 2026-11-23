package pe.edu.upeu.LP2_ResidenciaA.J.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Datos de entrada para el procedimiento almacenado SP_REGISTRAR_PAGO")
public class RegistrarPagoSPDTO {

    @Schema(description = "ID del contrato al que pertenece el pago", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "El ID del contrato es obligatorio")
    private Long idContrato;

    @Schema(description = "ID del usuario/operador que registra el pago", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "El ID del usuario es obligatorio")
    private Long idUsuario;

    @Schema(description = "Monto pagado", example = "350.00", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a cero")
    private Double monto;

    @Schema(description = "Método de pago (Efectivo, Yape, Plin, Transferencia)", example = "Efectivo", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "El método de pago es obligatorio")
    private String metodoPago;

    public RegistrarPagoSPDTO() {}

    public RegistrarPagoSPDTO(Long idContrato, Long idUsuario, Double monto, String metodoPago) {
        this.idContrato = idContrato;
        this.idUsuario = idUsuario;
        this.monto = monto;
        this.metodoPago = metodoPago;
    }

    public Long getIdContrato() { return idContrato; }
    public void setIdContrato(Long idContrato) { this.idContrato = idContrato; }

    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
}

