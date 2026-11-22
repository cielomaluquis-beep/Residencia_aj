package pe.edu.upeu.LP2_ResidenciaA.J.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import pe.edu.upeu.LP2_ResidenciaA.J.exception.CustomAccessDeniedHandler;
import pe.edu.upeu.LP2_ResidenciaA.J.exception.CustomAuthenticationEntryPoint;
import pe.edu.upeu.LP2_ResidenciaA.J.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final AuthenticationProvider authenticationProvider;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter,
                          AuthenticationProvider authenticationProvider,
                          CustomAccessDeniedHandler accessDeniedHandler,
                          CustomAuthenticationEntryPoint authenticationEntryPoint) {
        this.jwtFilter = jwtFilter;
        this.authenticationProvider = authenticationProvider;
        this.accessDeniedHandler = accessDeniedHandler;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(org.springframework.security.config.Customizer.withDefaults()) // Conexión a Angular
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 1. Rutas públicas
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/images/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        // Catálogo público de consulta (GET) - Igual que en el proyecto del profesor
                        .requestMatchers(HttpMethod.GET, "/api/v1/habitaciones/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/contratos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/clientes/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/pagos/**").permitAll()
                        // 2. Operaciones de gestión protegidas (Crear, Editar, Eliminar)
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess ->
                        sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint) // Maneja error 401
                        .accessDeniedHandler(accessDeniedHandler)           // Maneja error 403
                );
        return http.build();
    }
}

