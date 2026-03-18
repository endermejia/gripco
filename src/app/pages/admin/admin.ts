import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';
import { TranslationService } from '../../services/translation';
import { ModalService } from '../../services/modal';
import { TranslatePipe } from '../../services/translate.pipe';
import { LucideAngularModule, RefreshCw, ChevronDown, Search, MessageSquare } from 'lucide-angular';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './admin.html'
})
export class AdminComponent implements OnInit {
  supabase = inject(SupabaseService);
  i18n = inject(TranslationService);
  private modal = inject(ModalService);
  
  readonly RefreshCw = RefreshCw;
  readonly ChevronDown = ChevronDown;
  readonly Search = Search;
  readonly MessageSquare = MessageSquare;

  orders = signal<any[]>([]);
  searchQuery = signal('');
  loading = signal(false);

  private normalizeStr(str: string): string {
    return (str || '')
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  filteredOrders = computed(() => {
    const query = this.normalizeStr(this.searchQuery());
    const all = this.orders();
    
    if (!query) return all;

    return all.filter(order => {
      const idStr = this.normalizeStr(order.id);
      const nameStr = this.normalizeStr(order.shipping_address?.full_name);
      const emailStr = this.normalizeStr(order.profiles?.email);
      const phoneStr = this.normalizeStr(order.shipping_address?.phone);
      const addressStr = this.normalizeStr(order.shipping_address?.address);

      return idStr.includes(query) || 
             nameStr.includes(query) || 
             emailStr.includes(query) || 
             phoneStr.includes(query) ||
             addressStr.includes(query);
    });
  });

  statusOptions = [
    { value: 'pending_to_gripco', label: 'status.pending_to_gripco' },
    { value: 'sent_to_gripco', label: 'status.sent_to_gripco' },
    { value: 'received_at_gripco', label: 'status.received_at_gripco' },
    { value: 'resoling', label: 'status.resoling' },
    { value: 'pending_to_client', label: 'status.pending_to_client' },
    { value: 'sent_to_client', label: 'status.sent_to_client' },
    { value: 'received_by_client', label: 'status.received_by_client' },
    { value: 'cancelled', label: 'status.cancelled' }
  ];

  ngOnInit() {
    this.fetchOrders();
  }

  async fetchOrders() {
    this.loading.set(true);
    const { data, error } = await this.supabase.client
      .from('orders')
      .select('*, order_items(*), profiles(full_name, email)')
      .order('created_at', { ascending: false });

    if (data) {
      this.orders.set(data);
    }
    this.loading.set(false);
  }

  async updateStatus(orderId: string, newStatus: string) {
    const { error } = await this.supabase.client
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      this.modal.show({
        title: 'Error',
        message: 'Error actualizando estado: ' + error.message,
        type: 'error'
      });
    } else {
      this.fetchOrders();
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
