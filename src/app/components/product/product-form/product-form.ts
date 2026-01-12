import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrandService } from '../../../services/brand';
import { filter, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { MultipleSelect } from '../../../shareds/multiple-select/multiple-select';
import { UploadImage } from '../../../shareds/upload-image/upload-image';
import { CategoryS } from '../../../services/category';
import { ProductS } from '../../../services/product';
import { SubCategoryS } from '../../../services/sub-category';
import { PincodeS } from '../../../services/pincode';
import { CategoryM } from '../../../models/category';
import { BrandM } from '../../../models/brand';
import { ProductModal } from '../../../models/product';
import { SingleSelect } from '../../../shareds/single-select/single-select';
import { Editor, Toolbar, NgxEditorMenuComponent, NgxEditorComponent } from 'ngx-editor';
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxEditorComponent,
    MultipleSelect, UploadImage, RouterModule, NgbModule, SingleSelect, NgxEditorMenuComponent],
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
  subCategory = signal<any[]>([]);
  pincodes = signal<any[]>([]);
  editProduct = signal(false);
  previewUrl = signal<[]>([]);
  errorMessage = signal('');
  prepopulate = signal<any>([]);
  productId = signal<string>('');
  previewUrls: string[] = [];
  public selectedImages: FileList | null = null;
  readonly maxSizeMB = 10;
  @Input() item: any; // from modal
  maxFileSize = signal(10);
  allowedFileTypes = signal<string[]>(['image/jpeg', 'image/png']);
  uploadedImages = signal<any[]>([]);
  variantImages = signal<any[]>([]);
  selectedFiles = signal<File[]>([]);
  imageUploaded = signal<boolean>(false);
  serviceChargeFlag = signal<boolean>(false);

  productImages: any[] = [];
  variantImagesList: any[] = [];
    // 🔹 Reactive editor state
  editor = new Editor();
  // 🔹 Toolbar configuration
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline'],
    ['ordered_list', 'bullet_list'],
    ['align_left', 'align_center', 'align_right'],
  ];
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
      // pincodes: this.pincodeService.getPincode(),
    }).subscribe({
      next: ({ brands, categories, pincodes }: any) => {
        this.brands.set(brands.data);
        this.categories.set(categories.data); 
        // this.pincodes.update(() => {
        //   return pincodes.data.map((pincode: any) => ({
        //     name: pincode.pincode || '',
        //     id: pincode.id || '',
        //     status: pincode.status || false
        //   }));
        // });
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.activeModal.close(true);
      }
    });
    if(this.item !== null) {
        this.editProduct.set(true);
      // this.editMode.set(true);
      this.productId.set(this.item.id);
      if (this.item.pincode && this.item.pincode.length > 0) {
        this.serviceChargeFlag.set(true);
        this.productForm.controls['serviceCharge'].setValue(this.item.serviceCharges || 0);
      }
      this.prefillForm(); 
      this.item.images?.forEach((image: any) => {
        this.uploadedImages.update(value => [...value, image]);
      });
      console.log('this.uploadedImages()', this.uploadedImages());
      if(this.item.variants?.length) {
        this.item.variants.forEach((variant: any) => {
          this.addVariant(variant);
        });
      }
      // this.uploadedImages.set(this.item?.image);
    }
  }

prefillForm() {
  if (!this.item) return;

  /* ---------- Images ---------- */
  this.productImages = this.item.images || [];

  /* ---------- FORM ARRAYS ---------- */
  const offerPriceFA = this.productForm.get('offerPrice') as FormArray;
  const specificationsFA = this.productForm.get('specifications') as FormArray;
  // const brandId = this.brands().filter((item)=>{
  //   console.log('brand id',item.name === this.item.brand.name);
    
  // });
  offerPriceFA.clear();
  specificationsFA.clear();

  /* ---------- OFFER PRICES ---------- */
  if (this.item.offerPrices?.length) {
    this.item.offerPrices.forEach((offer: any) => {
      offerPriceFA.push(
        this.formBuilder.group({
          id: [offer.id],  
          quantity: [offer.quantity ?? 0],
          price: [offer.price ?? 0]
        })
      );
    });
  }

  /* ---------- SPECIFICATIONS ---------- */
  if (this.item.specifications?.length) {
    this.item.specifications.forEach((spec: any) => {
      specificationsFA.push(
        this.formBuilder.group({
          id: [spec.id],           // 👈 IMPORTANT
          name: [spec.name],
          value: [spec.value]
        })
      );
    });
  }
  /* ---------- PATCH SIMPLE FIELDS ---------- */
  this.productForm.patchValue({
    name: this.item.name,
    model: this.item.sku,
    status: this.item.status,
    price: this.item.price,
    stock: this.item.stock === 0 ? 'out' : 'in',
    weight: this.item.weight,
    length: this.item.length,
    height: this.item.height,
    width: this.item.width,
    description: this.item.description,

    brand: this.item.brand || '',
    category: this.item.category || '',
    subCategory: this.item.subCategory || '',

    warranty: {
      period: this.item.warranties?.[0]?.period ?? 0,
      type: this.item.warranties?.[0]?.type ?? ''
    },

    pincode: this.item.pincodes?.map((p: any) => ({
      id: p,
      name: p
    })) || []
  });
}

  selectedCategoryId(event: any){
    console.log('pincode', event);
    if(event && event.length > 0){
      this.serviceChargeFlag.set(true);
    } else {
      this.serviceChargeFlag.set(false);
      this.productForm.controls['serviceCharge'].setValue(0);
    }
  }

  selectedSubCategory(event: any){
    console.log('subCategory', event);
  }

  selectedCategory(event: any){
    const categoryId = event?.[0]?.id;
    if (!categoryId) return;
    of(categoryId)
      .pipe(
        tap(() => this.subCategory.set([])),
        switchMap(id =>
          this.subCategoryService.getSubcategoryByCategory(id)
        ),
        map((res: any) => res.data ?? []),
        filter(list => list.length > 0)
      )
      .subscribe(list => {
        this.subCategory.set(list);
    });
  }

  selectedBrand(event: any){
    console.log('brandId', event);
  }

 

handleImageUpload(event: {
  context: 'product' | 'variant';
  variantIndex: number | null;
  images: any[];
}) {
  if (event.context === 'product') {
    this.productImages = [...this.productImages, ...event.images];
  }

  if (
    event.context === 'variant' &&
    event.variantIndex !== null &&
    this.variantImagesList[event.variantIndex]
  ) {
    this.variantImagesList[event.variantIndex].images = [
      ...(this.variantImagesList[event.variantIndex].images || []),
      ...event.images
    ];
  }
}


  public loadProductData(){
    this.activatedRoute.params.subscribe(params => {
      // this.productId.set(params['id']);
      if (this.productId()) {
        this.editProduct.set(true);
        this.productService.getProductById(params['id']).subscribe((response: any) => {
          const product = response.data;
          this.productForm.patchValue(product);
          if(product.stock === 1 || product.stock === 0){
            this.productForm.controls['stock'].setValue(product.stock);
          }
          this.mainImagePreview = product.thumbnail;
          this.updateBrand(product.brand);
          this.prepopulate.set(product.category)
          this.productForm.controls['thumbnail'].patchValue(product.thumbnail);
          
         // Populate warranty
         if (product.warranty) {
         this.warranty.patchValue({
            period: product.warranty[0].period || 0,
            type: product.warranty[0].type || ''
          });
        }
        // Populate specifications
        if (product.specifications && product.specifications.length > 0) {
          // Clear existing specifications
          while (this.specifications.length) {
            this.specifications.removeAt(0);
          }
          
          // Add new specifications
          product.specifications.forEach((spec: any) => {
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
    const brandValue = this.brands().find((brand: any) => brand?.id === brandId || brand?._id === brandId);
    if (brandValue) {
      // patch the full object so createPayload can read brand._id
      this.productForm.patchValue({ brand: brandValue });
    }
  }

  public updateCategory(categoryId: string): void {
    const categoryValue = this.categories().find((category: any) => category?.id === categoryId || category?._id === categoryId);
    if (categoryValue) {
      this.productForm.patchValue({ category: categoryValue });
    }
  }

  public updateSubCategory(subCategoryId: string): void {
    const subValue = this.subCategories().find((s: any) => s?.id === subCategoryId || s?._id === subCategoryId);
    if (subValue) {
      this.productForm.patchValue({ subCategory: subValue });
    }
  }

  // Reload lookup lists (brands/categories/subcategories) -- call after an edit elsewhere
  public loadBrands(): void {
    this.brandsService.getBrands().subscribe({ next: (res: any) => this.brands.set(res.data), error: () => {} });
  }

  public loadCategories(): void {
    this.categoryService.getCategories().subscribe({ next: (res: any) => this.categories.set(res.data), error: () => {} });
  }

  public loadSubCategories(): void {
    this.subCategoryService.getSubCategories().subscribe({ next: (res: any) => this.subCategories.set(res.data), error: () => {} });
  }

  // Convenience: refresh all lookup lists
  public refreshLookups(): void {
    this.loadBrands();
    this.loadCategories();
    this.loadSubCategories();
  }

  // Helpers to set control after an edit (call these with the id returned from the modal)
  public setBrandById(brandId: string): void {
    this.loadBrands();
    // small delay not required, consumer can call refreshLookups then call this if needed
    const b = this.brands().find((x: any) => x?.id === brandId || x?._id === brandId);
    if (b) this.productForm.patchValue({ brand: b });
  }

  public setCategoryById(categoryId: string): void {
    this.loadCategories();
    const c = this.categories().find((x: any) => x?.id === categoryId || x?._id === categoryId);
    console.log('category option product', c);
    
    if (c) this.productForm.patchValue({ category: c });
  }

  public setSubCategoryById(subCategoryId: string): void {
    this.loadSubCategories();
    const s = this.subCategories().find((x: any) => x?.id === subCategoryId || x?._id === subCategoryId);
    if (s) this.productForm.patchValue({ subCategory: s });
  }

  public buildForm(){
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      brand: ['', Validators.required],
      category: ['', Validators.required],
      pincode: [[]],
      subCategory: ['', Validators.required],
      model: ['', Validators.required],
      status: [true],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: ['in', [Validators.required]],
      weight: [0.5, [Validators.required, Validators.min(0)]],
      length: [5, [Validators.required, Validators.min(0)]],
      height: [5, [Validators.required, Validators.min(0)]],
      width: [5, [Validators.required, Validators.min(0)]],

      description: ['', Validators.required],
      offerPrice: this.formBuilder.array([]),
      serviceCharge: [0, [Validators.min(0)]],
      variants: this.formBuilder.array([]),
      specifications: this.formBuilder.array([]),
      warranty: this.formBuilder.group({
        period: [''],
        type: ['Years'],
      }),
    });    
  }
  
  get f() { return this.productForm.controls; }
  get specifications(): FormArray { return this.productForm.get('specifications') as FormArray; }
  get offerPrice(): FormArray { return this.productForm.get('offerPrice') as FormArray; }
  get variants(): FormArray { return this.productForm.get('variants') as FormArray; }
  // get specification(): FormArray { return this.productForm.get('specifications') as FormArray; }
  get warranty(): FormGroup { return this.productForm.get('warranty') as FormGroup; }

addVariant(data?: any): void {
  this.variants.push(this.formBuilder.group({
    variantName: [data?.name || '', Validators.required],
    sku: [data?.sku || '', Validators.required],
    price: [data?.price ?? 0, [Validators.required, Validators.min(0), this.numberOnlyValidator()]],
    stock: [data?.stock ?? 'in', [Validators.required]]
  }));

  // ✅ IMPORTANT: create image holder per variant
  this.variantImagesList.push({
    images: data?.images || []
  });
}
removeVariant(index: number): void {
  this.variants.removeAt(index);
  this.variantImagesList.splice(index, 1);
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
  proccedNext(): void {
    this.submitted = true;
    if (this.productForm.valid) {
      const image = this.variants.controls.map((control) => control.get('image')?.value).filter((image: any) => image !== null);
      const payload = this.createPayload();
      let callApi: any;
      if(!this.editProduct()){
        callApi = this.productService.createProduct(payload);
      } else {
        callApi = this.productService.updateProduct(this.productId(), payload);
      }
      callApi.subscribe({
        next: (response:any) => {
          this.activeModal.close(true);
          this.resetForm();
          this.router.navigate(['/admin/product']);
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

    const specMap = new Map<string, any>();

  this.specifications.controls.forEach(control => {
    const name = (control.get('name')?.value || '').trim();
    const value = (control.get('value')?.value || '').trim();

    if (!name || !value) return;

    const key = `${name}::${value}`;
    specMap.set(key, { name, value });
  });

  const specificationsArray = Array.from(specMap.values());
  const offerMap = new Map<string, any>();

this.offerPrice.controls.forEach(control => {
  const quantity = Number(control.get('quantity')?.value || 0);
  const price = Number(control.get('price')?.value || 0);

  if (!quantity || !price) return;

  const key = `${quantity}::${price}`;
  offerMap.set(key, { quantity, price });
});

const offerPriceArray = Array.from(offerMap.values());


  const variantsArray = this.variants.controls.map((control, index) => ({
    name: control.get('variantName')?.value || '',
    sku: control.get('sku')?.value || '',
    price: Number(control.get('price')?.value || 0),
    stock: control.get('stock')?.value === 'in' ? 1 : 0,

    // ✅ each variant has its OWN images
    images: this.variantImagesList[index]?.images || []
  }));

  const warranty = {
    period: Number(this.productForm.get('warranty.period')?.value || 0),
    type: this.productForm.get('warranty.type')?.value || ''
  };
  console.log('this.productForm.value.brand?.id', this.productForm.value.brand);
  
  return {
    name: this.productForm.value.name,

    brand: this.productForm.value.brand?.id || this.productForm.value.brand?.id,
    category: this.productForm.value.category?.id || this.productForm.value.category?.id,
    subCategory: this.productForm.value.subCategory?.id || this.productForm.value.subCategory?.id,

    price: Number(this.productForm.value.price),
    stock: this.productForm.value.stock === 'in' ? 1 : 0,

    model: this.productForm.value.model,

    weight: Number(this.productForm.value.weight),
    width: Number(this.productForm.value.width),
    height: Number(this.productForm.value.height),
    length: Number(this.productForm.value.length),

    serviceCharge: Number(this.productForm.value.serviceCharge || 0),
    status: this.productForm.value.status,

    // ✅ product-level images
    productImages: this.productImages,

    // ✅ variant-level images (FIXED)
    variants: variantsArray,

    warranty,
    specifications: specificationsArray,
    offerPrice: offerPriceArray,

    pincode: [], // keep same as existing
    description: this.productForm.value.description
  };
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