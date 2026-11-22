package pe.edu.upeu.LP2_ResidenciaA.J.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "El usuario es obligatorio")
        String usuario,

        @NotBlank(message = "El password es obligatorio")
        String password
) {}

