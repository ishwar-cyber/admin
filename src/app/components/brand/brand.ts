import { Component, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Brands } from '../../models/brand';
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
  brands = signal<Brands[]>([]);
  private modalService = inject(NgbModal);
  private brandService = inject(BrandService)

  ngOnInit(): void {
    this.loadBrands();
  }
  loadBrands(){
    this.brandService.getBrands().subscribe({
      next: (brand : any) => {
        console.log('brand', brand);
        this.brands.set(brand.data)
      }
    })
  }
  openModal(item?: Brands): void {
    const modalRef = this.modalService.open(BrandForm, { size: 'lg' });
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

      },
     })
    // }
  }
}
