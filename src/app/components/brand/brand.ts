import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BrandM } from '../../models/brand';
import { BrandService } from '../../services/brand';
import { BrandForm } from './brand-form/brand-form';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-brand',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './brand.html',
  styleUrl: './brand.scss'
})
export class Brand implements OnInit{
  isLoading = signal(false);
  editMode = signal(false);
  brands = signal<BrandM[]>([]);
  private modalService = inject(NgbModal);
  private brandService = inject(BrandService)
    // Search control with debounce
  searchControl = new FormControl('');
  ngOnInit(): void {
    this.loadBrands();
  }


  // Additional helper methods
  get totalBrands(): number {
    return this.brands().length;
  }

  get activeBrands(): number {
    return this.brands().filter(c => c.isActive === true).length;
  }
  loadBrands(){
    this.brandService.getBrands().subscribe({
      next: (brand : any) => {
        this.brands.set(brand.data)
      }
    })
  }
  openModal(item?: BrandM): void {
    const modalRef = this.modalService.open(BrandForm, { size: 'lg',  backdrop: false});
    if (modalRef && modalRef.componentInstance) {
      modalRef.componentInstance.item = item ? { ...item } : null;
      if (modalRef.result) {
        modalRef.result.then((result: any) => {
          if (result) {
            this.loadBrands();
          }
        }).catch(() => {});
      }
    }
  }
  public deleteBrand(brand: string) {
    // if (confirm(`Are you sure you want to delete ${brand?.name}?`)) {
     this.brandService.deleteBrandById(brand).subscribe({
      next :() =>{
        this.loadBrands();
      },
     })
    // }
  }

  searchBrand() {
    const query = this.searchControl.value?.toLowerCase() || '';
    let tempBrands = this.brands();
    if (!query) {
      this.loadBrands(); // Reload all brands if search query is empty
      return;
    }
    let filteredBrands = tempBrands.filter(brand => brand?.name?.toLowerCase().includes(query));
    this.brands.set(filteredBrands);
  }
}
