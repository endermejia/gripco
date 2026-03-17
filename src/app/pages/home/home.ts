import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ShoppingCart } from 'lucide-angular';
import { Meta, Title } from '@angular/platform-browser';
import { CartService } from '../../services/cart';
import { SupabaseService } from '../../services/supabase';
import { TranslationService } from '../../services/translation';
import { TranslatePipe } from '../../services/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './home.html'
})
export class HomeComponent {
  cart = inject(CartService);
  supabase = inject(SupabaseService);
  i18n = inject(TranslationService);
  private meta = inject(Meta);
  private title = inject(Title);
  readonly ShoppingCart = ShoppingCart;
  rubberOptions = this.cart.rubberOptions;

  selectedRubber = signal(this.rubberOptions[0]);
  selectedToePatch = signal(false);

  currentPrice = computed(() => {
    return this.selectedRubber().price + (this.selectedToePatch() ? this.cart.TOE_PATCH_PRICE : 0);
  });

  constructor() {
    effect(() => {
      this.title.setTitle(this.i18n.translate('home.seo_title'));
      this.meta.updateTag({ name: 'description', content: this.i18n.translate('home.seo_desc') });
    });
  }

  addToCart() {
    const rubber = this.selectedRubber();
    this.cart.addItem(rubber.name, rubber.price, this.selectedToePatch());
  }
}
