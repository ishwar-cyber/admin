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
  selectedCategory = signal<BrandM | null>(null);
  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);
    // Configuration signals
  maxFileSize = signal(1);
  allowedFileTypes = signal<string[]>(['image/jpeg', 'image/png']);
  
  // State signals
  uploadedImages = signal<string[]>([]);
  selectedFiles = signal<File[]>([]);
  
  // Computed values
  galleryEmpty = computed(() => this.uploadedImages().length === 0);
  totalFileSize = computed(() => 
    this.selectedFiles().reduce((sum, file) => sum + file.size, 0)
  );
  private formBuilder = inject(FormBuilder);
  private BrandService = inject(BrandService);
  public activeModal = inject(NgbActiveModal);
  private toastr = inject(ToastrService);
  private productService = inject(ProductS);
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
      file: this.selectedFiles()
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

  onFilesSelected(files: File[]): void {
    this.selectedFiles.set(files);
  }

  onUploadComplete(event: any): void {
    console.log('event file', event);
    
    this.selectedFiles.set(event);
  }
  
}
