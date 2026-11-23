package pe.edu.upeu.LP2_ResidenciaA.J.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Respuesta devuelta por los procedimientos de diccionario/administración (P333, P334, P336) que usan DBMS_OUTPUT")
public class SpDiccionarioResponseDTO {

    private Integer codigo;
    private String mensaje;
    private List<String> lineas;
    private String salidaTexto;

    public SpDiccionarioResponseDTO() {}

    public SpDiccionarioResponseDTO(Integer codigo, String mensaje, List<String> lineas, String salidaTexto) {
        this.codigo = codigo;
        this.mensaje = mensaje;
        this.lineas = lineas;
        this.salidaTexto = salidaTexto;
    }

    public Integer getCodigo() { return codigo; }
    public void setCodigo(Integer codigo) { this.codigo = codigo; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public List<String> getLineas() { return lineas; }
    public void setLineas(List<String> lineas) { this.lineas = lineas; }

    public String getSalidaTexto() { return salidaTexto; }
    public void setSalidaTexto(String salidaTexto) { this.salidaTexto = salidaTexto; }
}

