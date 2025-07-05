import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Brands } from '../../../models/brand';
import { BrandService } from '../../../services/brand';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadImage } from '../../../shareds/upload-image/upload-image';

@Component({
  selector: 'app-brand-form',
  imports: [ReactiveFormsModule, CommonModule, UploadImage],
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
    // Configuration signals
  maxFileSize = signal(3);
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
    const payload ={
      name: this.brandFrom.controls['name'].value,
      description: this.brandFrom.controls['description'].value,
      status: this.brandFrom.controls['status'].value
    }
    this.BrandService.createBrand(payload, this.selectedFiles()).subscribe(() => {
          this.activeModal.close(true);
    });
      // }
    // }
  }



  onFilesSelected(files: File[]): void {
    console.log('Files selected:', files);
    this.selectedFiles.set(files);
  }

  onUploadComplete(imageUrls: string[]): void {
    this.uploadedImages.update(current => [...current, ...imageUrls]);
    console.log('Upload complete. Total images:', this.uploadedImages().length);
  }
  
}
