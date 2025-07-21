import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pincode } from './pincode';

describe('Pincode', () => {
  let component: Pincode;
  let fixture: ComponentFixture<Pincode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pincode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pincode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
