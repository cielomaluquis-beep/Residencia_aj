package pe.edu.upeu.LP2_ResidenciaA.J.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.LP2_ResidenciaA.J.entity.Persona;

import java.util.Optional;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Long> {
    Optional<Persona> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Persona> findByNroDocumento(String nroDocumento);
    boolean existsByNroDocumento(String nroDocumento);
}
