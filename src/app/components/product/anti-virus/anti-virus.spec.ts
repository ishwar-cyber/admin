import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AntiVirus } from './anti-virus';

describe('AntiVirus', () => {
  let component: AntiVirus;
  let fixture: ComponentFixture<AntiVirus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AntiVirus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AntiVirus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
