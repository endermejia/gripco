import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { CartService } from '../../services/cart';
import { TranslationService } from '../../services/translation';
import { TranslatePipe } from '../../services/translate.pipe';
import { 
  LucideAngularModule, 
  ShoppingCart, 
  User, 
  LogOut, 
  ShoppingBag,
  Languages,
  Archive,
  Settings
} from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, TranslatePipe],
  templateUrl: './header.html'
})
export class HeaderComponent {
  supabase = inject(SupabaseService);
  cart = inject(CartService);
  i18n = inject(TranslationService);

  readonly ShoppingCart = ShoppingCart;
  readonly User = User;
  readonly Archive = Archive;
  readonly Languages = Languages;
  readonly Settings = Settings;
}

