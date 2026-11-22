package pe.edu.upeu.LP2_ResidenciaA.J.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.AuthResponse;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.LoginRequest;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.RegistroDTO;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.UsuarioDTO;
import pe.edu.upeu.LP2_ResidenciaA.J.entity.Usuario;
import pe.edu.upeu.LP2_ResidenciaA.J.repository.UsuarioRepository;
import pe.edu.upeu.LP2_ResidenciaA.J.security.JwtService;
import pe.edu.upeu.LP2_ResidenciaA.J.security.UsuarioPrincipal;
import pe.edu.upeu.LP2_ResidenciaA.J.services.IUsuarioService;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final IUsuarioService usuarioService;
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    public AuthController(IUsuarioService usuarioService,
                          AuthenticationManager authenticationManager,
                          UsuarioRepository usuarioRepository,
                          JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioDTO> registrar(@Valid @RequestBody RegistroDTO dto) {
        return usuarioService.registrarCliente(dto)
                .map(user -> new ResponseEntity<>(user, HttpStatus.CREATED))
                .orElseThrow(() -> new RuntimeException("El email o nombre de usuario ya están en uso"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Usuario user = usuarioRepository.findByNombreIgnoreCase(request.usuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + request.usuario()));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getNombre(), request.password())
        );

        String jwtToken = jwtService.generateToken(new UsuarioPrincipal(user));

        return ResponseEntity.ok(new AuthResponse(
                jwtToken,
                user.getNombre(),
                user.getRol() != null && user.getRol().getNombre() != null ? user.getRol().getNombre() : "USER",
                user.getPersona() != null ? user.getPersona().getIdPersona() : null
        ));
    }
}
