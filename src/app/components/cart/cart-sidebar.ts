import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { SupabaseService } from '../../services/supabase';
import { TranslationService } from '../../services/translation';
import { LucideAngularModule, X, ShoppingCart, Trash2, LogOut, User } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
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
  readonly LogOut = LogOut;
  readonly User = User;

  login() {
    this.cart.closeCart();
    this.router.navigate(['/auth']);
  }

  async logout() {
    this.cart.closeCart();
    await this.supabase.signOut();
    this.router.navigate(['/']);
  }

  checkout() {
    this.cart.closeCart();
    if (!this.supabase.user()) {
      this.router.navigate(['/auth']);
    } else {
      this.router.navigate(['/orders']);
    }
  }
}
