import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { StorageService } from './storage';

export interface CartItem {
  id: string;
  rubber: string;
  price: number;
  toePatch: boolean;
  itemTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storage = inject(StorageService);
  private CAT_KEY = 'gripco_cart';

  private _items = signal<CartItem[]>([]);
  private _isOpen = signal(false);

  items = computed(() => this._items());
  isOpen = computed(() => this._isOpen());
  
  total = computed(() => 
    this._items().reduce((acc, item) => acc + item.itemTotal, 0)
  );

  count = computed(() => this._items().length);

  constructor() {
    // Load from storage
    const saved = this.storage.getItem(this.CAT_KEY);
    if (saved) {
      try {
        this._items.set(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing cart from storage', e);
      }
    }

    // Persist on change
    effect(() => {
      this.storage.setItem(this.CAT_KEY, JSON.stringify(this._items()));
    });
  }

  addItem(rubber: string, price: number, toePatch: boolean) {
    const itemTotal = price + (toePatch ? 5 : 0);
    const newItem: CartItem = {
      id: Math.random().toString(36).substring(2, 9),
      rubber,
      price,
      toePatch,
      itemTotal
    };
    this._items.update(items => [...items, newItem]);
    this._isOpen.set(true);
  }

  removeItem(id: string) {
    this._items.update(items => items.filter(i => i.id !== id));
  }

  clearCart() {
    this._items.set([]);
  }

  toggleCart() {
    this._isOpen.update(open => !open);
  }

  closeCart() {
    this._isOpen.set(false);
  }
}
