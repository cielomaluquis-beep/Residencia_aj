package pe.edu.upeu.LP2_ResidenciaA.J.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Respuesta estándar devuelta por la ejecución de un Procedimiento Almacenado")
public class SpResponseDTO {

    @Schema(description = "Código de retorno (0 = Éxito, 1 = Error de validación, -1 = Error fatal)", example = "0")
    private Integer codigo;

    @Schema(description = "Mensaje explicativo devuelto por Oracle PL/SQL", example = "Éxito: Operación realizada correctamente")
    private String mensaje;

    @Schema(description = "ID del registro generado (si aplica)", example = "15")
    private Long idGenerado;

    public SpResponseDTO() {}

    public SpResponseDTO(Integer codigo, String mensaje) {
        this.codigo = codigo;
        this.mensaje = mensaje;
    }

    public SpResponseDTO(Integer codigo, String mensaje, Long idGenerado) {
        this.codigo = codigo;
        this.mensaje = mensaje;
        this.idGenerado = idGenerado;
    }

    public Integer getCodigo() { return codigo; }
    public void setCodigo(Integer codigo) { this.codigo = codigo; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public Long getIdGenerado() { return idGenerado; }
    public void setIdGenerado(Long idGenerado) { this.idGenerado = idGenerado; }
}

