import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageReview } from './manage-review';

describe('ManageReview', () => {
  let component: ManageReview;
  let fixture: ComponentFixture<ManageReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageReview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
