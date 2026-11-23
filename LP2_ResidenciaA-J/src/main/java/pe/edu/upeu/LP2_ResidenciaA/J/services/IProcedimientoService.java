package pe.edu.upeu.LP2_ResidenciaA.J.services;

import pe.edu.upeu.LP2_ResidenciaA.J.dto.CambiarEstadoHabitacionSPDTO;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.RegistrarPagoSPDTO;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.SpDiccionarioResponseDTO;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.SpResponseDTO;

public interface IProcedimientoService {
    SpResponseDTO cambiarEstadoHabitacion(CambiarEstadoHabitacionSPDTO dto);
    SpResponseDTO registrarPago(RegistrarPagoSPDTO dto);
    SpDiccionarioResponseDTO ejecutarP333(String usuario);
    SpDiccionarioResponseDTO ejecutarP334(String usuario);
    SpDiccionarioResponseDTO ejecutarP336(String usuario);
}
