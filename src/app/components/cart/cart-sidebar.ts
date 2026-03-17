import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { SupabaseService } from '../../services/supabase';
import { TranslationService } from '../../services/translation';
import { LucideAngularModule, X, ShoppingCart, Trash2 } from 'lucide-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './cart-sidebar.html'
})
export class CartSidebarComponent {
  cart = inject(CartService);
  supabase = inject(SupabaseService);
  i18n = inject(TranslationService);
  private router = inject(Router);

  readonly X = X;
  readonly Trash2 = Trash2;
  readonly ShoppingCart = ShoppingCart;

  checkout() {
    if (!this.supabase.user()) {
      this.cart.closeCart();
      this.router.navigate(['/auth']);
    } else {
      // Logic for creating order with Stripe
      console.log('Proceeding to checkout...');
    }
  }
}
