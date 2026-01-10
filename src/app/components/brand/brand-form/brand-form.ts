import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrandM } from '../../../models/brand';
import { BrandService } from '../../../services/brand';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadImage } from '../../../shareds/upload-image/upload-image';
import { ToastrService } from 'ngx-toastr';
import { ProductS } from '../../../services/product';

@Component({
  selector: 'app-brand-form',
  imports: [ReactiveFormsModule, CommonModule, UploadImage],
  templateUrl: './brand-form.html',
  styleUrl: './brand-form.scss'
})
export class BrandForm implements OnInit {
  @Input() item: BrandM | null = null;
  isNewItem: boolean = false;
  brandFrom!: FormGroup;
  isLoading = signal(false);
  editMode = signal(false);
  brandImages = signal<string[]>([]);
  // State signals
  uploadedImages = signal<string[]>([]);
  selectedFiles = signal<File[]>([]);

  private formBuilder = inject(FormBuilder);
  private BrandService = inject(BrandService);
  public activeModal = inject(NgbActiveModal);
  private toastr = inject(ToastrService);
  ngOnInit(): void {
    this.initForm()
  }
 private initForm() {
    this.brandFrom = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      isActive: [true, Validators.required]
    });
  }
  saveItem(): void {
    const payload ={
      name: this.brandFrom.value.name,
      description: this.brandFrom.value.description,
      isActive: this.brandFrom.value.isActive,
      file: this.brandImages()
    }
    this.BrandService.createBrand(payload).subscribe({
      next: (res) => {
        this.activeModal.close(true);
         this.toastr.success('Brand created successfully', 'Success');
      },
      error:(err)=>{
        this.activeModal.close(true);
      }
    });
  }

  handleImageUpload(event: {
    context: 'product' | 'variant';
    variantIndex: number | null;
    images: any[];
  }) {
    if (event.context === 'product') {
      this.brandImages.set([...this.brandImages(), ...event.images]);
    }
  }
  
}
