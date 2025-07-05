import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleSelect } from './multiple-select';

describe('MultipleSelect', () => {
  let component: MultipleSelect;
  let fixture: ComponentFixture<MultipleSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultipleSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
