import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/layout/header';
import { CartSidebarComponent } from './components/cart/cart-sidebar';
import { ModalComponent } from './components/shared/modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CartSidebarComponent, ModalComponent],
  template: `
    <app-header></app-header>
    <main class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
      <router-outlet></router-outlet>
    </main>
    <app-cart-sidebar></app-cart-sidebar>
    <app-modal></app-modal>
  `,
  styles: []
})
export class App {}
