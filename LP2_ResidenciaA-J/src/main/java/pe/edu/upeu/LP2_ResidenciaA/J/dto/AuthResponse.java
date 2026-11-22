package pe.edu.upeu.LP2_ResidenciaA.J.dto;

public record AuthResponse(
        String token,
        String usuario,
        String rol,
        Long idPersona
) {}

