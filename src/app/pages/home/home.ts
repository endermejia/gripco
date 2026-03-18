import { Component, inject, signal, computed, effect, afterNextRender } from '@angular/core';
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
  
  heroImages = ['hero1.jpg', 'hero2.jpg'];
  currentHeroIndex = signal(0);

  selectedRubber = signal<any>(null);
  selectedToePatch = signal(false);
 
  currentPrice = computed(() => {
    const rubber = this.selectedRubber();
    if (!rubber) return 0;
    return rubber.price + (this.selectedToePatch() ? this.cart.TOE_PATCH_PRICE : 0);
  });
 
  constructor() {
    afterNextRender(() => {
      setInterval(() => {
        this.currentHeroIndex.update(idx => (idx + 1) % this.heroImages.length);
      }, 5000);

      this.preloadImages();
    });

    effect(() => {
      this.title.setTitle(this.i18n.translate('home.seo_title'));
      this.meta.updateTag({ name: 'description', content: this.i18n.translate('home.seo_desc') });
    });
  }

  private preloadImages() {
    const images = [
      ...this.heroImages,
      'puntera.jpg',
      ...new Set(this.cart.rubberOptions.map(opt => opt.image))
    ];
    
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }
 
  addToCart() {
    const rubber = this.selectedRubber();
    if (!rubber) return;
    
    const fullName = `${rubber.name} ${rubber.thickness}mm`;
    this.cart.addItem(fullName, rubber.price, this.selectedToePatch());
    
    // Reset form
    this.selectedRubber.set(null);
    this.selectedToePatch.set(false);
  }
}
