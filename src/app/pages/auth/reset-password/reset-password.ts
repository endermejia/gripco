import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase';
import { TranslationService } from '../../../services/translation';
import { TranslatePipe } from '../../../services/translate.pipe';
import { Router } from '@angular/router';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  template: `
    <div class="animate-fade min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-[440px] p-8 md:p-[48px] rounded-2xl bg-white/90 backdrop-blur-[10px] border border-[rgba(28,76,138,0.1)] shadow-lg">
        <h2 class="text-3xl md:text-4xl font-black text-secondary mb-8 text-center mt-0">
          {{ 'auth.update_password' | translate }}
        </h2>
        
        <form (submit)="handleUpdatePassword()" class="space-y-6">
          <div class="flex flex-col mb-5">
            <label class="block font-medium text-slate-700 mb-2 ml-1 text-[0.9rem]">{{ 'auth.new_password' | translate }}</label>
            <input type="password" [ngModel]="password()" (ngModelChange)="password.set($event)" 
                   name="password" required placeholder="******" autocomplete="new-password"
                   class="w-full py-[14px] px-4 border-2 border-black/5 rounded-xl text-[1.05rem] font-inherit bg-slate-50 transition-all duration-300 focus:outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(207,19,129,0.1)]">
          </div>

          @if (error()) {
            <div class="bg-[#fff0f0] text-[#ff4d4d] p-2.5 rounded-lg text-[0.9rem] mb-5 font-bold border border-red-100 animate-fade">
              {{ error() }}
            </div>
          }

          @if (success()) {
            <div class="bg-green-50 text-green-600 p-2.5 rounded-lg text-[0.9rem] mb-5 font-bold border border-green-100 animate-fade">
              {{ success() }}
            </div>
          }

          <button type="submit" class="btn btn-primary w-full py-5 text-xl mt-4 rounded-2xl hover:scale-105" [disabled]="loading()">
            @if (loading()) {
              <lucide-icon [name]="Loader2" size="24" class="animate-spin mr-2 inline-block align-middle"></lucide-icon>
            }
            {{ loading() ? ('common.loading' | translate) : ('auth.update_password' | translate) }}
          </button>
        </form>

        @if (success()) {
          <div class="mt-6 text-center">
            <button (click)="goToLogin()" class="text-primary font-bold hover:underline cursor-pointer">
              {{ 'auth.back_to_login' | translate }}
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class ResetPasswordComponent {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  i18n = inject(TranslationService);
  
  readonly Loader2 = Loader2;

  password = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  async handleUpdatePassword() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { error } = await this.supabase.client.auth.updateUser({
        password: this.password()
      });
      if (error) throw error;
      this.router.navigate(['/auth'], { queryParams: { reset: 'success' } });
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }

  goToLogin() {
    this.router.navigate(['/auth']);
  }
}
