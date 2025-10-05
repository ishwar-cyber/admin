import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryS } from '../../../services/category';
import { UploadImage } from "../../../shareds/upload-image/upload-image";
import { SubCategoryS } from '../../../services/sub-category';
import { CommonConstants } from '../../../common/common-constant';

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
  statusMenu = signal<any[]>(CommonConstants.statusMenu);
  @Input() item: any; // from modal
  set category(value: any) {
    if (value) {
      this.subCategoryForm.patchValue({
        category: value.id,
      });
    }
  }
  public activeModal = inject(NgbActiveModal);
  private categoryService = inject(CategoryS);
  private formBuilder =inject(FormBuilder);
  private subCategoryService = inject(SubCategoryS)

  ngOnInit(): void {
    this.formBuild();
    this.loadCategory();
    
    if (this.item !== null) {
      this.editMode.set(true);
      let categoryFind = this.categories().filter(cat => cat.id === this.item.category?.id);
      
      this.subCategoryForm.patchValue({
        name: this.item.name,
        category: this.item.category?.id,
        serviceCharges: this.item.serviceCharges,
        isActive: this.item.isActive
      });
      this.uploadedImages.set(this.item?.image?.url || '');
    }
  }

  private formBuild(): void {
    this.subCategoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      serviceCharges: [0, [ Validators.min(0)]],
      isActive: [true, Validators.required],
    });
  }
  
  loadCategory(){
    this.categoryService.getCategories().subscribe({
      next: (res: any)=>{
        this.categories.set(res.data)
      }, 
      error:(errorResponse)=>{
        console.error('Error loading categories:', errorResponse);
      }
    })
  }
  procced(){
    const payload ={
      name: this.subCategoryForm.value.name,
      category: this.subCategoryForm.value.category,
      serviceCharges: this.subCategoryForm.value.serviceCharges,
      isActive: this.subCategoryForm.value.isActive,
    }
    const subCategoryRequest = this.editMode() ?
      this.subCategoryService.updateSubCategory(this.item.id, payload, this.selectedFiles()) :
      this.subCategoryService.addSubCategory(payload, this.selectedFiles());
    subCategoryRequest.subscribe({
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
  }
}
