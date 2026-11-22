package pe.edu.upeu.LP2_ResidenciaA.J.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.LP2_ResidenciaA.J.entity.Usuario;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByNombre(String nombre);
    Optional<Usuario> findByNombreIgnoreCase(String nombre);
    boolean existsByNombre(String nombre);
    boolean existsByNombreIgnoreCase(String nombre);
}
