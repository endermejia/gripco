import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';
import { TranslationService } from '../../services/translation';
import { TranslatePipe } from '../../services/translate.pipe';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslatePipe],
  templateUrl: './auth.html'
})
export class AuthComponent {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  i18n = inject(TranslationService);
  
  readonly Loader2 = Loader2;

  isLogin = signal(true);
  isForgotPassword = signal(false);
  email = signal('');
  password = signal('');
  fullName = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor() {
    const reset = this.route.snapshot.queryParamMap.get('reset');
    if (reset === 'success') {
      this.success.set(this.i18n.translate('auth.password_updated'));
      setTimeout(() => this.success.set(null), 5000);
    }
  }

  toggleMode() {
    this.isLogin.update(v => !v);
    this.isForgotPassword.set(false);
    this.error.set(null);
    this.success.set(null);
  }

  toggleForgotPassword() {
    this.isForgotPassword.update(v => !v);
    this.error.set(null);
    this.success.set(null);
  }

  async handleSubmit() {
    this.loading.set(true);
    this.error.set(null);

    try {
      if (this.isForgotPassword()) {
        const { error } = await this.supabase.client.auth.resetPasswordForEmail(this.email(), {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        this.success.set(this.i18n.translate('auth.reset_success'));
      } else if (this.isLogin()) {
        const { error } = await this.supabase.client.auth.signInWithPassword({
          email: this.email(),
          password: this.password()
        });
        if (error) throw error;
        this.router.navigate(['/']);
      } else {
        const { error } = await this.supabase.client.auth.signUp({
          email: this.email(),
          password: this.password(),
          options: {
            data: {
              full_name: this.fullName()
            }
          }
        });
        if (error) throw error;
        this.router.navigate(['/']);
      }
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }
}
