import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrandM } from '../../../models/brand';
import { BrandService } from '../../../services/brand';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadImage } from '../../../shareds/upload-image/upload-image';
import { ToastrService } from 'ngx-toastr';

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

  public procced(){
    this.isLoading.set(false);
    if(this.brandFrom.valid){
      this.isLoading.set(true);
      const payload ={
        name: this.brandFrom.value.name,
        description: this.brandFrom.value.description,
        isActive: this.brandFrom.value.isActive
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
      name: this.brandFrom.value.name,
      description: this.brandFrom.value.description,
      isActive: this.brandFrom.value.isActive
    }
    this.BrandService.createBrand(payload, this.selectedFiles()).subscribe({
      next: (res) => {
        this.activeModal.close(true);
         this.toastr.success('Brand created successfully', 'Success');
      },
      error:(err)=>{
        this.activeModal.close(true);
      }
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
