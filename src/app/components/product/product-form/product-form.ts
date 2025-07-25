import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrandService } from '../../../services/brand';
import { forkJoin } from 'rxjs';
import { MultipleSelect } from '../../../shareds/multiple-select/multiple-select';
import { UploadImage } from '../../../shareds/upload-image/upload-image';
import { CategoryS } from '../../../services/category';
import { ProductS } from '../../../services/product';
import { SubCategoryS } from '../../../services/sub-category';
import { PincodeS } from '../../../services/pincode';
import { CategoryM } from '../../../models/category';
import { BrandM } from '../../../models/brand';
import { ProductModal } from '../../../models/product';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule,
    MultipleSelect, UploadImage, RouterModule,  NgbModule ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm implements OnInit {
  // Services
  public readonly activeModal = inject(NgbActiveModal);
  private readonly brandsService = inject(BrandService);
  private readonly categoryService = inject(CategoryS);
  private readonly productService = inject(ProductS);
  private readonly formBuilder = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subCategoryService = inject(SubCategoryS);
  private readonly pincodeService = inject(PincodeS);

  // Form
  productForm!: FormGroup;
  submitted = false;
  mainImagePreview?: string

  categories = signal<CategoryM[]>([]);
  brands = signal<any[]>([]);
  subCategories = signal<any[]>([]);
  pincodes = signal<any[]>([]);
  editProduct = signal(false);
  previewUrl = signal<[]>([]);
  errorMessage = signal('');
  prepopulate = signal<any>([]);
  productId = signal<string>('');
  previewUrls: string[] = [];
  public selectedImages: FileList | null = null;
  readonly maxSizeMB = 10;

  maxFileSize = signal(10);
  allowedFileTypes = signal<string[]>(['image/jpeg', 'image/png']);
  uploadedImages = signal<any[]>([]);
  selectedFiles = signal<File[]>([]);
  imageUploaded = signal<boolean>(false);
  constructor() {}

 public productStock = signal<any[]>([
    { value: 'in', label: 'In Stock' },
    { value: 'out', label: 'Out Stock' }
  ]);

  ngOnInit(): void {
    this.buildForm();
    forkJoin({
      brands: this.brandsService.getBrands(),
      categories: this.categoryService.getCategories(),
      pincodes: this.pincodeService.getPincode(),
      subCategories: this.subCategoryService.getSubCategories()
    }).subscribe({
      next: ({ brands, categories, pincodes, subCategories }: any) => {
        this.brands.set(brands.data);
        this.categories.set(categories.data);
        this.subCategories.set(subCategories.data);

        this.pincodes.update(() => {
          return pincodes.data.map((pincode: any) => ({
            name: pincode.pincode || '',
            id: pincode.id || '',
            status: pincode.status || false
          }));
        });
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.activeModal.close(true);
      }
    });
    this.productForm?.get('stockStatus')?.valueChanges.subscribe(stockStatus => { 
        console.log('stockStatus', stockStatus);
    }); 
  }

  selectedCategoryId(event: any){
    console.log('pinocde and category', event);
  }

  onFilesSelected(files: File[]): void {
    this.imageUploaded.set(true);
    this.selectedFiles.set(files);
  }

  onUploadComplete(files: File[]): void {
    // this.uploadedImages.update(current => [...current, ...imageUrls]);

    this.productService.uploadImage(files).subscribe({
      next: (res:any) =>{
        for(const image of res.data){
        this.uploadedImages().push(image);

        }
        console.log('Upload complete. Total images:', this.uploadedImages());
      },
      error : (err)=>{

      }
    })
    // console.log('Upload complete. Total images:', this.uploadedImages());
  }

  public loadProductData(){
    this.activatedRoute.params.subscribe(params => {
      this.productId.set(params['id']);
      if (this.productId()) {
        this.editProduct.set(true);
        this.productService.getProductById(params['id']).subscribe((response: any) => {
          const product = response.data;
          this.productForm.patchValue(product);
          if(product.stock === 'in' || product.stock === 'out'){
            this.productForm.controls['stockStatus'].setValue(true)
            this.productForm.controls['stock'].setValue(product.stock);
          }
          this.mainImagePreview = product.thumbnail;
          this.updateBrand(product.brand);
          this.prepopulate.set(product.category)
          this.productForm.controls['thumbnail'].patchValue(product.thumbnail);
          console.log('product image', product.thumbnail);
          
         // Populate warranty
         if (product.warranty) {
         this.warranty.patchValue({
            period: product.warranty[0].period || 0,
            type: product.warranty[0].type || '',
            details: product.warranty[0].details || ''
          });
        }

        console.log('specifications', product.specifications);
        
           // Populate specifications
        if (product.specifications && product.specifications.length > 0) {
          // Clear existing specifications
          while (this.specifications.length) {
            this.specifications.removeAt(0);
          }
          
          // Add new specifications
          product.specifications.forEach((spec: any) => {
            console.log('spec', spec);
            this.specifications.push(
              this.formBuilder.group({
                name: [spec.name || ''],
                value: [spec.value || '']
              })
            );
          });
        }
          
        // Populate variants
        if (product.variants && product.variants.length > 0) {
          // Clear existing variants
          while (this.variants.length) {
            this.variants.removeAt(0);
          }
          
          // Add new variants
          product.variants.forEach((variant: any) => {
            this.variants.push(
              this.formBuilder.group({
                variantName: [variant.variantName || ''],
                sku: [variant.sku || ''],
                price: [variant.price || 0],
                stock: [variant.stock || 0],
                image: [null] // Initialize with null, will be set on file change
              })
            );
          });
        }
        });
      }
    });
  }
  private updateBrand(brandId: string): void {
    const brandValue =  this.brands().filter((brand: BrandM) => {
      return brand?.id === brandId;  
    });
    this.productForm.patchValue({ brand: brandValue[0]._id });
  }

  public updateCategory(categoryId: string): void {
    const categoryValue = this.categories().filter((category: CategoryM) => {
        return category?.id === categoryId;
    });
    this.productForm.patchValue({ category: categoryValue[0].id });
  }

  public buildForm(){
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      brand: ['', Validators.required],
      category: [[], Validators.required],
      pincode: [[]],
      subCategory: ['', Validators.required],
      model: ['', Validators.required],
      status: [true],
      stockStatus: [false],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      weight: [0.5, [Validators.required, Validators.min(0)]],
      length: [5, [Validators.required, Validators.min(0)]],
      height: [5, [Validators.required, Validators.min(0)]],
      width: [5, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      offerPrice: this.formBuilder.array([]),
      variants: this.formBuilder.array([]),
      specifications: this.formBuilder.array([]),
      warranty: this.formBuilder.group({
        period: ['', Validators.required],
        type: ['Years', Validators.required],
        details: ['', Validators.required]
      })
    });    
  }
  
  get f() { return this.productForm.controls; }
  get specifications(): FormArray { return this.productForm.get('specifications') as FormArray; }
  get offerPrice(): FormArray { return this.productForm.get('offerPrice') as FormArray; }
  get variants(): FormArray { return this.productForm.get('variants') as FormArray; }
  // get specification(): FormArray { return this.productForm.get('specifications') as FormArray; }
  get warranty(): FormGroup { return this.productForm.get('warranty') as FormGroup; }

  addVariant(): void {
    this.variants.push(this.formBuilder.group({
      variantName: ['', Validators.required],
      sku: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0),this.numberOnlyValidator()]],
      stock: [0, [Validators.required, Validators.min(0),this.numberOnlyValidator()]],
      image: [null],
    }));
  }
  removeVariant(index: number): void {
    this.variants.removeAt(index);
  }
  removeOfferPrice(index: number){
    if(this.offerPrice.length > 1) this.offerPrice.removeAt(index)
  }
  removeSpecification(index: number): void {
    if (this.specifications.length > 1) {
      this.specifications.removeAt(index);
    }
  }

  addSpecification(): void {
    this.specifications.push(this.formBuilder.group({
      name:[null],
      value:[null],
    }));
  }

  addOfferPrice(): void {
    this.offerPrice.push(this.formBuilder.group({
      quantity:[null, this.numberOnlyValidator()],
      price:[null, this.numberOnlyValidator()],
    }));
  }
  public onStockStatusChange(event: any): void {
    const status = event.target.value;
    console.log('Stock status', status);
    if(status){

    }
  }
  

  onVariantImageChange(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      const variantGroup = this.variants.at(index);
      variantGroup.patchValue({ image: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        variantGroup.patchValue({ imagePreview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  proccedNext(): void {
    this.submitted = true;
    if (this.productForm.valid) {
      const mainImageFile = this.selectedFiles();
      const variantsImages = this.variants.controls.map((control) => control.get('image')?.value).filter((image: any) => image !== null);
      const payload = this.createPayload();
      let callApi: any;
      // if(!this.editProduct()){
        callApi = this.productService.createProduct(payload, variantsImages);
      // } else {
        // callApi = this.productService.updateProduct(this.productId(), payload, mainImageFile, variantsImages);
      // }
      callApi.subscribe({
        next: (response:any) => {
          console.log('Product created:', response);
           this.activeModal.close(true);
          this.resetForm();
          this.router.navigate(['/admin/products']);
        },
        error: (error:any) => {
          console.error('Error creating product:', error);
          this.activeModal.close(true);
        }
      });
    } else {
      this.productForm.markAllAsDirty();
    }
  }

  public createPayload() {
    const specificationsArray = this.specifications.controls.map(control => ({
      name: control.get('name')?.value || '',
      value: control.get('value')?.value || ''
    }));

    const offerPriceArray = this.offerPrice.controls.map(control => ({
      quantity: control.get('quantity')?.value || '',
      price: control.get('price')?.value || 0
    }));
    let category:any = [];
    let pincode: any = [];
    this.productForm.value.category.forEach((categoryId: any) => {
      category.push(categoryId.id);
    });
    this.productForm.value.pincode.forEach((pincodeId: any) => {
      pincode.push(pincodeId.id);
      console.log('pincode', pincode);
      
    });
    const variantsArray = this.variants.controls.map(control => ({
      variantName: control.get('variantName')?.value || '',
      sku: control.get('sku')?.value || '',
      price: control.get('price')?.value || 0,
      stock: control.get('stock')?.value || 0,
    }));
   const warranty = {
      period: this.productForm.get('warranty.period')?.value || 0,
      type: this.productForm.get('warranty.type')?.value || '',
      details: this.productForm.get('warranty.details')?.value || ''
    };
    const payload: ProductModal = {
      name: this.productForm.value.name,
      brand: this.productForm.value.brand,
      category: category,
      pincode: pincode,
      productImages: this.uploadedImages(),
      subCategory: this.productForm.value.subCategory,
      stock: this.productForm.value.stock,
      price: this.productForm.value.price,
      model: this.productForm.value.model,
      width: this.productForm.value.width,
      height: this.productForm.value.height,
      length: this.productForm.value.length,
      variants: variantsArray,
      description: this.productForm.value.description,
      weight: this.productForm.value.weight,
      warranty: warranty || {},
      specifications: specificationsArray,
      offerPrice: offerPriceArray || [],
      status: this.productForm.value.status,
    }
    return payload;
  }


  // File handling methods
  public onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    this.processFile(file ?? null);
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.processFile(file || null);
  }

  private processFile(file: File | null): void {
    if (!file) return;

    if (file.size > this.maxSizeMB * 1024 * 1024) {
      this.errorMessage.set(`File size exceeds ${this.maxSizeMB}MB limit.`);
      return;
    }
    const reader = new FileReader();
    this.selectedImages = file ? { 0: file, length: 1, item: (index: number) => (index === 0 ? file : null) } as unknown as FileList : null;
    reader.onload = (event) => this.previewUrl.update(...this.previewUrl(),event.target?.result as any);
    reader.onerror = () => this.errorMessage.set('Error reading file for preview.');
    reader.readAsDataURL(file);
  }


  private resetForm(): void {
    this.productForm.reset();
    this.selectedImages = null;
    this.previewUrls = [];
    this.mainImagePreview = undefined;
    this.submitted = false;
  }

  numberOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === '') return null;
      const isValid = /^\d+$/.test(value);
      return isValid ? null : { numberOnly: true };
    };
  }
}