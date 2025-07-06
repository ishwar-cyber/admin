import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubCategoryForm } from './sub-category-form';

describe('SubCategoryForm', () => {
  let component: SubCategoryForm;
  let fixture: ComponentFixture<SubCategoryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubCategoryForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubCategoryForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
