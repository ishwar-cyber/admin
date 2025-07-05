import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponseForm } from './couponse-form';

describe('CouponseForm', () => {
  let component: CouponseForm;
  let fixture: ComponentFixture<CouponseForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponseForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponseForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
