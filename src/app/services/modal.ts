import { Injectable, signal } from '@angular/core';

export interface ModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'confirm' | 'error' | 'success';
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  isOpen = signal(false);
  options = signal<ModalOptions | null>(null);
  
  private resolveCallback: ((value: boolean) => void) | null = null;

  show(options: ModalOptions): Promise<boolean> {
    this.options.set(options);
    this.isOpen.set(true);
    
    return new Promise((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  confirm() {
    this.close(true);
  }

  cancel() {
    this.close(false);
  }

  private close(result: boolean) {
    this.isOpen.set(false);
    if (this.resolveCallback) {
      this.resolveCallback(result);
      this.resolveCallback = null;
    }
  }
}
