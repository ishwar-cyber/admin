import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PincodeForm } from './pincode-form';

describe('PincodeForm', () => {
  let component: PincodeForm;
  let fixture: ComponentFixture<PincodeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PincodeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PincodeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
