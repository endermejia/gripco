import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';
import { TranslationService } from '../../services/translation';
import { LucideAngularModule, RefreshCw, ChevronDown } from 'lucide-angular';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin.html'
})
export class AdminComponent implements OnInit {
  supabase = inject(SupabaseService);
  i18n = inject(TranslationService);
  
  readonly RefreshCw = RefreshCw;
  readonly ChevronDown = ChevronDown;

  orders = signal<any[]>([]);
  loading = signal(false);

  statusOptions = [
    { value: 'pending_to_gripco', label: 'status.pending_to_gripco' },
    { value: 'sent_to_gripco', label: 'status.sent_to_gripco' },
    { value: 'received_at_gripco', label: 'status.received_at_gripco' },
    { value: 'resoling', label: 'status.resoling' },
    { value: 'pending_to_client', label: 'status.pending_to_client' },
    { value: 'sent_to_client', label: 'status.sent_to_client' },
    { value: 'received_by_client', label: 'status.received_by_client' }
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
      alert('Error actualizando estado: ' + error.message);
    } else {
      this.fetchOrders();
    }
  }

  getStatusLabel(status: string): string {
    return this.i18n.t()[`status.${status}`] || status;
  }

  getStatusClasses(status: string): string {
    const map: Record<string, string> = {
      'pending_to_gripco': 'bg-[#fff0f7] text-primary',
      'sent_to_gripco': 'bg-indigo-50 text-secondary',
      'received_at_gripco': 'bg-green-50 text-green-600',
      'resoling': 'bg-yellow-50 text-yellow-600',
      'pending_to_client': 'bg-fuchsia-50 text-fuchsia-700',
      'sent_to_client': 'bg-sky-50 text-sky-700',
      'received_by_client': 'bg-emerald-50 text-emerald-700'
    };
    return map[status] || 'bg-slate-100 text-slate-500';
  }
}
