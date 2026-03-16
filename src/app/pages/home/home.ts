import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { CartService } from '../../services/cart';
import { SupabaseService } from '../../services/supabase';
import { TranslationService } from '../../services/translation';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  cart = inject(CartService);
  supabase = inject(SupabaseService);
  i18n = inject(TranslationService);
  private meta = inject(Meta);
  private title = inject(Title);

  rubberOptions = [
    { name: 'XS Grip 4 mm', price: 28 },
    { name: 'XS Grip 5 mm', price: 31 },
    { name: 'XS Grip2 4 mm', price: 29 },
    { name: 'XS Grip2 5 mm', price: 32 },
    { name: 'XS Edge 4 mm', price: 29 },
    { name: 'XS Edge 5 mm', price: 32 }
  ];

  selectedRubber = signal(this.rubberOptions[0]);
  selectedToePatch = signal(false);

  currentPrice = computed(() => {
    return this.selectedRubber().price + (this.selectedToePatch() ? 5 : 0);
  });

  constructor() {
    effect(() => {
      this.title.setTitle(this.i18n.t()['home.seo_title']);
      this.meta.updateTag({ name: 'description', content: this.i18n.t()['home.seo_desc'] });
    });
  }

  addToCart() {
    const rubber = this.selectedRubber();
    this.cart.addItem(rubber.name, rubber.price, this.selectedToePatch());
  }
}
