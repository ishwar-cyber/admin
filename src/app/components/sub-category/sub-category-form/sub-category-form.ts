import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryS } from '../../../services/category';
import { UploadImage } from "../../../shareds/upload-image/upload-image";
import { SubCategoryS } from '../../../services/sub-category';

@Component({
  selector: 'app-sub-category-form',
  imports: [ReactiveFormsModule, CommonModule, UploadImage],
  templateUrl: './sub-category-form.html',
  styleUrl: './sub-category-form.scss'
})
export class SubCategoryForm implements OnInit {

  isLoading = signal(false);
  editMode = signal(false);
  subCategoryForm!: FormGroup;
  categories = signal<any[]>([]);
  maxFileSize = signal(3);
  allowedFileTypes = signal<string[]>(['image/jpeg', 'image/png']);
  uploadedImages = signal<string[]>([]);
  selectedFiles = signal<File[]>([]);
  public activeModal = inject(NgbActiveModal);
  private categoryService = inject(CategoryS);
  private formBuilder =inject(FormBuilder);
  private subCategoryService = inject(SubCategoryS)

  ngOnInit(): void {
    this.formBUild();
    this.loadCategory();
  }

  private formBUild(): void {
    this.subCategoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      status: ['active', Validators.required],
    });
  }
  loadCategory(){
    this.categoryService.getCategories().subscribe({
      next: (res: any)=>{
        this.categories.set(res.data)
      }, 
      error:()=>{

      }
    })
  }
  procced(){
    const payload ={
      name: this.subCategoryForm.value.name,
      category: this.subCategoryForm.value.category,
      status: this.subCategoryForm.value.status,
    }
    this.subCategoryService.addSubCategory(payload, this.selectedFiles).subscribe({
      next: (response)=>{
        this.activeModal.close(true);
      },error :(err) =>{
        this.activeModal.close(true);
       }
    })
  }

  onFilesSelected(files: File[]): void {
    // this.imageUploaded.set(true);
    this.selectedFiles.set(files);
  }

  onUploadComplete(imageUrls: string[]): void {
    this.uploadedImages.update(current => [...current, ...imageUrls]);
    console.log('Upload complete. Total images:', this.uploadedImages().length);
  }
}
