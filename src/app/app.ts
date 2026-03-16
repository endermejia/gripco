import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/layout/header';
import { CartSidebarComponent } from './components/cart/cart-sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CartSidebarComponent],
  template: `
    <app-header></app-header>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-outlet></router-outlet>
    </main>
    <app-cart-sidebar></app-cart-sidebar>
  `,
  styles: []
})
export class App {}
