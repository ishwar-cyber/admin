import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Inventroy } from './inventroy';

describe('Inventroy', () => {
  let component: Inventroy;
  let fixture: ComponentFixture<Inventroy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inventroy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Inventroy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
