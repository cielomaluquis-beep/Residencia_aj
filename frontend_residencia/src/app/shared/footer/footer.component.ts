import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  public autor: any = {
    nombre: 'Cielo',
    apellidos: 'Maluquis',
    anio: '2026',
    curso: 'Lenguaje de Programación (LP) - Grupo 1',
    institucion: 'Universidad Peruana Unión (UPeU)'
  };
}
