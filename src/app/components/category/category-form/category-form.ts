import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadImage } from "../../../shareds/upload-image/upload-image";
import { CategoryS } from '../../../services/category';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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
  private formBuilder = inject(FormBuilder);
  private categoryService = inject(CategoryS);
  public activeModal = inject(NgbActiveModal);

  ngOnInit(): void {
    this.buildForm();
  }
  public buildForm(){
    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      serviceCharges:[0, Validators.required],
      status: ['active', Validators.required],
    })
  }

  onFilesSelected(files: File[]): void {
    this.imageUploaded.set(true);
    this.selectedFiles.set(files);
  }

  public updateCategory(){}
  
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
        serviceCharges: this.categoryForm.value.serviceCharges,
        status: this.categoryForm.value.status === 'active' ? true : false,
      }
      return payload;
  }  
}
