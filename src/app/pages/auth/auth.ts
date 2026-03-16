import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';
import { TranslationService } from '../../services/translation';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  i18n = inject(TranslationService);

  isLogin = signal(true);
  email = signal('');
  password = signal('');
  fullName = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  toggleMode() {
    this.isLogin.update(v => !v);
    this.error.set(null);
  }

  async handleSubmit() {
    this.loading.set(true);
    this.error.set(null);

    try {
      if (this.isLogin()) {
        const { error } = await this.supabase.client.auth.signInWithPassword({
          email: this.email(),
          password: this.password()
        });
        if (error) throw error;
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
      }
      this.router.navigate(['/']);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }
}
