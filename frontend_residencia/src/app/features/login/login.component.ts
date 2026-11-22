import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private alertService = inject(AlertService);
  private authService = inject(AuthService);

  username = '';
  password = '';
  isLoading = false;
  loginError = false;

  login(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.alertService.error('Por favor completa tu usuario y contraseña');
      return;
    }

    this.isLoading = true;
    this.loginError = false;

    this.authService.login({ usuario: this.username, password: this.password })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (success) => {
          if (success) {
            document.getElementById('closeLoginModal')?.click();
            const rol = this.authService.getRole() || 'Usuario';
            this.alertService.toast(`Bienvenido(a), ${this.authService.getUserName()} (${rol})`);
            this.password = '';
          } else {
            this.loginError = true;
            this.alertService.error('Usuario o contraseña incorrecta');
          }
        },
        error: () => {
          this.loginError = true;
          this.alertService.error('Error al conectar con el servidor');
        }
      });
  }
}
