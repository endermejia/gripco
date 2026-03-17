import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CartSidebarComponent } from './cart-sidebar';

describe('CartSidebarComponent', () => {
  let component: CartSidebarComponent;
  let fixture: ComponentFixture<CartSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartSidebarComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CartSidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
