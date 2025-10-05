import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadImage } from "../../../shareds/upload-image/upload-image";
import { CategoryS } from '../../../services/category';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonConstants } from '../../../common/common-constant';

@Component({
  selector: 'app-category-form',
  imports: [CommonModule, ReactiveFormsModule, UploadImage],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss'
})
export class CategoryForm implements OnInit{
  editMode = signal<boolean>(false)
  isLoading = signal(false);
  categoryForm!: FormGroup;
  errorMessage = signal<string>('');
  maxFileSize = signal(3);
  allowedFileTypes = signal<string[]>(['image/jpeg', 'image/png']);
  uploadedImages = signal<string[]>([]);
  selectedFiles = signal<File[]>([]);
  imageUploaded = signal<boolean>(false);
  statusMenu = signal<any[]>(CommonConstants.statusMenu);
 @Input() item: any; // from modal

  private formBuilder = inject(FormBuilder);
  private categoryService = inject(CategoryS);
  public activeModal = inject(NgbActiveModal);

  ngOnInit(): void {
    this.buildForm();

    if(this.item !== null) {
      this.editMode.set(true);
      this.categoryForm.patchValue({
        name: this.item.name,
        isActive: this.item.isActive
      });
      this.uploadedImages.set(this.item?.image?.url || '');
    } 
  }
  public buildForm(){
    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      isActive: [true, Validators.required],
    })
  }

  onFilesSelected(files: File[]): void {
    this.imageUploaded.set(true);
    this.selectedFiles.set(files);
  }

  public updateCategory(){
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched(this.categoryForm);
      return;
    }
    const payload = this.createPayload();
    this.categoryService.updateCategory(this.item.id, payload, this.selectedFiles()).subscribe({
      next: (response) => {
        this.activeModal.close(true);
      },
      error: (error) => this.activeModal.close(true),
      complete: () => this.isLoading.set(false)
    });
  }
  
  public procced(){
       if (this.categoryForm.invalid) {
        this.markFormGroupTouched(this.categoryForm);
        return;
      }
      this.isLoading.set(true);
      const payload = this.createPayload();
      this.categoryService.createCategory(payload, this.selectedFiles()).subscribe({
      next: (response) => {
        this.activeModal.close(true);
      },
      error: (error) => this.activeModal.close(true),
      complete: () => this.isLoading.set(false)
    }); 
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  createPayload(){
     const payload ={
        name: this.categoryForm.value.name,
        isActive: this.categoryForm.value.isActive,
      }
      return payload;
  }  
}
