import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';
import { CartService } from '../../services/cart';
import { TranslationService } from '../../services/translation';
import { ModalService } from '../../services/modal';
import { StorageService } from '../../services/storage';
import { TranslatePipe } from '../../services/translate.pipe';
import { LucideAngularModule, MapPin, Phone, User, MessageSquare, Package, Clock, Truck, CheckCircle, ShoppingCart, Trash2, Archive, Settings, LogOut, XCircle, Save, RefreshCcw } from 'lucide-angular';
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
  private storage = inject(StorageService);

  private STORAGE_KEY = 'gripco_checkout_info';

  // Icons
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly User = User;
  readonly MessageSquare = MessageSquare;
  readonly Package = Package;
  readonly Clock = Clock;
  readonly Truck = Truck;
  readonly CheckCircle = CheckCircle;
  readonly ShoppingCart = ShoppingCart;
  readonly Trash2 = Trash2;
  readonly LogOut = LogOut;
  readonly XCircle = XCircle;
  readonly Save = Save;
  readonly RefreshCcw = RefreshCcw;

  // Form State
  address = signal('');
  phone = signal('');
  fullName = signal('');
  notes = signal('');
  
  loading = signal(false);
  orders = signal<any[]>([]);

  constructor() {
    // 1. Load from storage FIRST
    const saved = this.storage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.address.set(data.address || '');
        this.phone.set(data.phone || '');
        this.fullName.set(data.fullName || '');
        this.notes.set(data.notes || '');
      } catch (e) {
        console.error('Error parsing saved checkout info', e);
      }
    }

    // 2. Persist changes to storage
    effect(() => {
      this.storage.setItem(this.STORAGE_KEY, JSON.stringify({
        address: this.address(),
        phone: this.phone(),
        fullName: this.fullName(),
        notes: this.notes()
      }));
    });

    // 3. Fallback to profile ONLY if storage was empty
    effect(() => {
      const user = this.supabase.user();
      if (user && !saved) {
        this.fetchOrders();
        const profile = this.supabase.profile();
        if (profile) {
          this.address.set(profile.address || '');
          this.phone.set(profile.phone || '');
          this.fullName.set(profile.full_name || '');
        }
      } else if (user) {
        // Still need to fetch orders regardless of storage
        this.fetchOrders();
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

      // Pre-fill from last order if individual fields are empty
      if (data.length > 0) {
        const lastOrder = data[0];
        const addr = lastOrder.shipping_address;
        if (addr) {
          if (!this.fullName()) this.fullName.set(addr.full_name || '');
          if (!this.address()) this.address.set(addr.address || '');
          if (!this.phone()) this.phone.set(addr.phone || '');
        }
      }
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
          notes: this.notes(),
          shipping_address: {
            full_name: this.fullName(),
            address: this.address(),
            phone: this.phone()
          }
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Update profile for consistency (if address/phone/name changed)
      if (userId) {
        await this.supabase.updateProfile(userId, {
          full_name: this.fullName(),
          address: this.address(),
          phone: this.phone()
        });
      }

      // 3. Create order items
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
      this.notes.set('');
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

  async repeatOrder(order: any) {
    // 1. Clear current cart
    this.cart.clearCart();
    
    // 2. Add items
    order.order_items.forEach((item: any) => {
      const basePrice = Number(item.price) - (item.has_toe_patch ? this.cart.TOE_PATCH_PRICE : 0);
      this.cart.addItem(item.rubber_type, basePrice, !!item.has_toe_patch);
    });
    
    // 3. Pre-fill form
    const addr = order.shipping_address;
    if (addr) {
      this.fullName.set(addr.full_name || '');
      this.address.set(addr.address || '');
      this.phone.set(addr.phone || '');
    }
    this.notes.set(order.notes || '');
    
    // 4. Feedback
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.modal.show({
      title: 'GripCo',
      message: this.i18n.translate('orders.repeat_success'),
      type: 'success'
    });
  }

  async updateNotes(orderId: string, notes: string) {
    const { error } = await this.supabase.client
      .from('orders')
      .update({ notes })
      .eq('id', orderId);

    if (error) {
      this.modal.show({ title: 'Error', message: error.message, type: 'error' });
    } else {
      await this.fetchOrders();
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
