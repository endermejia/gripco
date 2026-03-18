import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';
import { CartService } from '../../services/cart';
import { TranslationService } from '../../services/translation';
import { ModalService } from '../../services/modal';
import { TranslatePipe } from '../../services/translate.pipe';
import { LucideAngularModule, MapPin, Phone, User, Package, Clock, Truck, CheckCircle, ShoppingCart, Trash2, Archive, Settings, LogOut, XCircle } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterModule, DatePipe, TranslatePipe],
  templateUrl: './orders.html'
})
export class OrdersComponent {
  supabase = inject(SupabaseService);
  cart = inject(CartService);
  i18n = inject(TranslationService);
  private modal = inject(ModalService);
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
  readonly LogOut = LogOut;
  readonly XCircle = XCircle;

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

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/']);
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
      this.modal.show({
        title: this.i18n.translate('orders.summary'),
        message: 'Pedido realizado con éxito. Por favor, envía tus pies de gato a nuestra dirección.',
        type: 'success'
      });
    } catch (e: any) {
      this.modal.show({
        title: 'Error',
        message: e.message,
        type: 'error'
      });
    } finally {
      this.loading.set(false);
    }
  }

  async cancelOrder(orderId: string) {
    const confirmed = await this.modal.show({
      title: this.i18n.translate('orders.cancel'),
      message: this.i18n.translate('orders.cancel_confirm'),
      type: 'confirm'
    });

    if (!confirmed) return;

    try {
      const { error } = await this.supabase.client
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;
      
      this.modal.show({
        title: 'GripCo',
        message: this.i18n.translate('orders.cancelled_success'),
        type: 'success'
      });
      await this.fetchOrders();
    } catch (e: any) {
      this.modal.show({
        title: 'Error',
        message: e.message,
        type: 'error'
      });
    }
  }

  async clearCart() {
    const confirmed = await this.modal.show({
      title: this.i18n.translate('orders.discard'),
      message: this.i18n.translate('orders.discard_confirm'),
      type: 'confirm'
    });

    if (confirmed) {
      this.cart.clearCart();
    }
  }

  getStatusLabel(status: string): string {
    return this.i18n.translate(`status.${status}`);
  }

  getStatusClasses(status: string): string {
    const map: Record<string, string> = {
      'pending_to_gripco': 'bg-slate-100 text-slate-600',
      'sent_to_gripco': 'bg-indigo-50 text-indigo-600',
      'received_at_gripco': 'bg-blue-50 text-blue-600',
      'resoling': 'bg-amber-100 text-amber-700',
      'pending_to_client': 'bg-violet-50 text-violet-600',
      'sent_to_client': 'bg-sky-50 text-sky-600',
      'received_by_client': 'bg-emerald-100 text-emerald-700',
      'cancelled': 'bg-red-100 text-red-700'
    };
    return map[status] || 'bg-slate-100 text-slate-500';
  }
}
