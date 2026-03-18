import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  
  private _session = signal<Session | null>(null);
  private _profile = signal<any | null>(null);

  session = computed(() => this._session());
  profile = computed(() => this._profile());
  user = computed(() => this._session()?.user ?? null);
  isAdmin = computed(() => this._profile()?.is_admin ?? false);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this._session.set(session);
      if (session) {
        this.getProfile(session.user.id);
      }
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
      if (session) {
        this.getProfile(session.user.id);
      } else {
        this._profile.set(null);
      }
    });
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      this._profile.set(data);
    }
    return { data, error };
  }

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (data) {
      this._profile.set(data);
    }
    return { data, error };
  }

  get client() {
    return this.supabase;
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }
}
