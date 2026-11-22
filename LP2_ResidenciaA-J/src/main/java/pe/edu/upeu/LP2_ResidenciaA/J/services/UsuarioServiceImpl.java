package pe.edu.upeu.LP2_ResidenciaA.J.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.RegistroDTO;
import pe.edu.upeu.LP2_ResidenciaA.J.dto.UsuarioDTO;
import pe.edu.upeu.LP2_ResidenciaA.J.entity.Persona;
import pe.edu.upeu.LP2_ResidenciaA.J.entity.Rol;
import pe.edu.upeu.LP2_ResidenciaA.J.entity.Usuario;
import pe.edu.upeu.LP2_ResidenciaA.J.exception.DuplicateResourceException;
import pe.edu.upeu.LP2_ResidenciaA.J.repository.PersonaRepository;
import pe.edu.upeu.LP2_ResidenciaA.J.repository.RolRepository;
import pe.edu.upeu.LP2_ResidenciaA.J.repository.UsuarioRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioServiceImpl implements IUsuarioService {

    private final UsuarioRepository repository;
    private final PersonaRepository personaRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServiceImpl(UsuarioRepository repository,
                              PersonaRepository personaRepository,
                              RolRepository rolRepository,
                              PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.personaRepository = personaRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarTodo() {
        return repository.findAll().stream().map(this::convertToDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UsuarioDTO> buscarPorId(Long id) {
        return repository.findById(id).map(this::convertToDTO);
    }

    @Override
    @Transactional
    public UsuarioDTO crear(UsuarioDTO dto) {
        Usuario e = new Usuario();
        mapDtoToEntity(dto, e);
        return convertToDTO(repository.save(e));
    }

    @Override
    @Transactional
    public Optional<UsuarioDTO> actualizar(Long id, UsuarioDTO dto) {
        return repository.findById(id).map(e -> {
            mapDtoToEntity(dto, e);
            return convertToDTO(repository.save(e));
        });
    }

    @Override
    @Transactional
    public boolean eliminar(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public Optional<UsuarioDTO> registrarCliente(RegistroDTO dto) {
        // 1. Validar email único
        if (personaRepository.existsByEmail(dto.email())) {
            throw new DuplicateResourceException("El email '" + dto.email() + "' ya está registrado");
        }

        // 2. Validar nombre de usuario único
        if (repository.existsByNombre(dto.usuario())) {
            throw new DuplicateResourceException("El nombre de usuario '" + dto.usuario() + "' ya existe");
        }

        // 3. Crear Persona
        Persona p = new Persona();
        p.setNombres(dto.nombre());
        p.setEmail(dto.email());
        Persona personaGuardada = personaRepository.save(p);

        // 4. Crear Usuario
        Usuario u = new Usuario();
        u.setNombre(dto.usuario());
        u.setContrasena(passwordEncoder.encode(dto.password()));
        u.setPersona(personaGuardada);
        u.setEstado("1");
        u.setDescripcion("Usuario Registrado");

        // Buscar Rol (Estudiante, Residente, Cliente, o primer rol disponible)
        Rol rolAsignado = rolRepository.findAll().stream()
                .filter(r -> r.getNombre() != null &&
                        (r.getNombre().equalsIgnoreCase("Estudiante") ||
                         r.getNombre().equalsIgnoreCase("Residente") ||
                         r.getNombre().equalsIgnoreCase("CLIENTE") ||
                         r.getNombre().equalsIgnoreCase("USER")))
                .findFirst()
                .orElseGet(() -> {
                    List<Rol> todos = rolRepository.findAll();
                    if (!todos.isEmpty()) return todos.get(0);
                    Rol nuevo = new Rol();
                    nuevo.setNombre("CLIENTE");
                    nuevo.setDescripcion("Rol Cliente Residencia");
                    nuevo.setEstado("1");
                    return rolRepository.save(nuevo);
                });
        u.setRol(rolAsignado);

        Usuario usuarioGuardado = repository.save(u);
        return Optional.of(convertToDTO(usuarioGuardado));
    }

    private void mapDtoToEntity(UsuarioDTO dto, Usuario e) {
        e.setNombre(dto.nombre());
        e.setDescripcion(dto.descripcion());
        e.setEstado(dto.estado());

        if (dto.contrasena() != null && !dto.contrasena().isBlank()) {
            // Encriptar solo si no está encriptada con BCrypt
            if (!dto.contrasena().startsWith("$2a$") && !dto.contrasena().startsWith("$2b$") && !dto.contrasena().startsWith("$2y$")) {
                e.setContrasena(passwordEncoder.encode(dto.contrasena()));
            } else {
                e.setContrasena(dto.contrasena());
            }
        }

        if (dto.idPersona() != null) {
            e.setPersona(personaRepository.findById(dto.idPersona()).orElse(null));
        } else {
            e.setPersona(null);
        }

        if (dto.idRol() != null) {
            e.setRol(rolRepository.findById(dto.idRol()).orElse(null));
        } else {
            e.setRol(null);
        }
    }

    private UsuarioDTO convertToDTO(Usuario e) {
        return new UsuarioDTO(
                e.getIdUsuario(),
                e.getPersona() != null ? e.getPersona().getIdPersona() : null,
                e.getRol() != null ? e.getRol().getIdRol() : null,
                e.getNombre(),
                e.getDescripcion(),
                e.getEstado(),
                e.getContrasena()
        );
    }
}
