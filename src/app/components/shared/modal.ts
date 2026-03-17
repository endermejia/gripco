import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal';
import { LucideAngularModule, AlertCircle, HelpCircle, Info, X, CheckCircle } from 'lucide-angular';
import { TranslatePipe } from '../../services/translate.pipe';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslatePipe],
  template: `
    <div *ngIf="modal.isOpen()" 
         class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-secondary/40 backdrop-blur-sm animate-fade">
      <div class="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 border border-white/40 overflow-hidden transform transition-all animate-fade">
        <!-- Close Button -->
        <button (click)="modal.cancel()" class="absolute top-6 right-6 text-slate-400 hover:text-secondary transition-colors cursor-pointer">
          <lucide-icon [name]="X" size="24"></lucide-icon>
        </button>

        <div class="flex flex-col items-center text-center">
          <!-- Icon -->
          <div [ngClass]="{
            'bg-blue-50 text-blue-500': modal.options()?.type === 'info' || !modal.options()?.type,
            'bg-amber-50 text-amber-500': modal.options()?.type === 'confirm',
            'bg-red-50 text-red-500': modal.options()?.type === 'error',
            'bg-emerald-50 text-emerald-500': modal.options()?.type === 'success'
          }" class="p-4 rounded-full mb-6">
            <lucide-icon [name]="getIcon()" size="32"></lucide-icon>
          </div>

          <h3 class="text-2xl font-black text-secondary mb-3">{{ modal.options()?.title }}</h3>
          <p class="text-slate-500 font-medium mb-8">{{ modal.options()?.message }}</p>

          <div class="flex flex-col sm:flex-row gap-4 w-full mt-2">
            @if (modal.options()?.type === 'confirm') {
              <button (click)="modal.cancel()" class="btn bg-slate-100 text-slate-500 py-4 px-8 rounded-2xl font-bold flex-1 hover:bg-slate-200 transition-all cursor-pointer">
                {{ modal.options()?.cancelText || 'common.cancel' | translate }}
              </button>
            }
            <button (click)="modal.confirm()" class="btn btn-primary py-4 px-8 rounded-2xl font-black text-lg flex-2 hover:scale-105 transition-all cursor-pointer">
              {{ modal.options()?.confirmText || 'common.accept' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  modal = inject(ModalService);
  
  readonly AlertCircle = AlertCircle;
  readonly HelpCircle = HelpCircle;
  readonly Info = Info;
  readonly X = X;
  readonly CheckCircle = CheckCircle;

  getIcon() {
    const type = this.modal.options()?.type;
    if (type === 'error') return this.AlertCircle;
    if (type === 'confirm') return this.HelpCircle;
    if (type === 'success') return this.CheckCircle;
    return this.Info;
  }
}
