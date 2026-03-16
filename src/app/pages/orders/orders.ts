import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';
import { CartService } from '../../services/cart';
import { TranslationService } from '../../services/translation';
import { LucideAngularModule, MapPin, Phone, User, Package, Clock, Truck, CheckCircle, ShoppingCart, Trash2, Archive, Settings, LogOut } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterModule, DatePipe],
  templateUrl: './orders.html'
})
export class OrdersComponent {
  supabase = inject(SupabaseService);
  cart = inject(CartService);
  i18n = inject(TranslationService);
  private router = inject(Router);

  // Icons
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly User = User;
  readonly Package = Package;
  readonly Clock = Clock;
  readonly Truck = Truck;
  readonly CheckCircle = CheckCircle;
  readonly ShoppingCart = ShoppingCart;
  readonly Trash2 = Trash2;

  // Form State
  address = signal('');
  phone = signal('');
  fullName = signal('');
  
  loading = signal(false);
  orders = signal<any[]>([]);

  constructor() {
    effect(() => {
      const user = this.supabase.user();
      if (user) {
        this.fetchOrders();
        // Pre-fill profile if exists
        const profile = this.supabase.profile();
        if (profile) {
          this.address.set(profile.address || '');
          this.phone.set(profile.phone || '');
          this.fullName.set(profile.full_name || '');
        }
      }
    });
  }

  async fetchOrders() {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (data) {
      this.orders.set(data);
    }
  }

  async submitOrder() {
    if (this.cart.items().length === 0) return;
    
    this.loading.set(true);
    const userId = this.supabase.user()?.id;

    try {
      // 1. Create order
      const { data: order, error: orderError } = await this.supabase.client
        .from('orders')
        .insert({
          user_id: userId,
          total_price: this.cart.total(),
          shipping_address: {
            full_name: this.fullName(),
            address: this.address(),
            phone: this.phone()
          }
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const items = this.cart.items().map(item => ({
        order_id: order.id,
        rubber_type: item.rubber,
        has_toe_patch: item.toePatch,
        price: item.itemTotal
      }));

      const { error: itemsError } = await this.supabase.client
        .from('order_items')
        .insert(items);

      if (itemsError) throw itemsError;

      // 3. Clear cart and refresh
      this.cart.clearCart();
      await this.fetchOrders();
      alert('Pedido realizado con éxito. Por favor, envía tus pies de gato a nuestra dirección.');
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      this.loading.set(false);
    }
  }

  getStatusLabel(status: string): string {
    return this.i18n.t()[`status.${status}`] || status;
  }
}
