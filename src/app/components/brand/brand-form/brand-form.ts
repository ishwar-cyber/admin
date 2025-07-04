import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Brands } from '../../../models/brand';
import { BrandService } from '../../../services/brand';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-brand-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './brand-form.html',
  styleUrl: './brand-form.scss'
})
export class BrandForm implements OnInit {
 @Input() item: Brands | null = null;
  isNewItem: boolean = false;
  brandFrom!: FormGroup;
  isLoading = signal(false);
  editMode = signal(false);
  selectedCategory = signal<Brands | null>(null);
  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);
  private formBuilder = inject(FormBuilder);
  private BrandService = inject(BrandService);
  private activeModal = inject(NgbActiveModal);
  ngOnInit(): void {
    this.initForm()
  }
 private initForm() {
    this.brandFrom = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['active', Validators.required]
    });
  }

  public procced(){
    this.isLoading.set(false);
    if(this.brandFrom.valid){
      this.isLoading.set(true);
      const payload ={
        name: this.brandFrom.controls['name'].value,
        description: this.brandFrom.controls['description'].value,
        status: this.brandFrom.controls['status'].value
      }
      this.selectedFile && this.BrandService.createBrand(payload, this.selectedFile).subscribe({
        next: (res: any) => {
          this.imagePreview.set(null);
          this.selectedFile = null;
        },
        error(err) {
          console.log(err);
        }
      })
      this.isLoading.set(false);
    }

  }

   saveItem(): void {
    // if (this.item) {
      
      const operation = this.isNewItem 
        ? this.BrandService.createBrand(this.item, this.selectedFile)
        : this.BrandService.updateItem(this.item, this.selectedFile);

      // if (operation && typeof (operation as any).subscribe === 'function') {
        operation.subscribe(() => {
          this.activeModal.close(true);
        });
      // }
    // }
  }
  
}
