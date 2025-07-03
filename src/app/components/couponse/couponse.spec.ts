import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Couponse } from './couponse';

describe('Couponse', () => {
  let component: Couponse;
  let fixture: ComponentFixture<Couponse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Couponse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Couponse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
