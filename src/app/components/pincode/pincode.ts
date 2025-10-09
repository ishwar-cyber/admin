import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PincodeS } from '../../services/pincode';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PincodeForm } from './pincode-form/pincode-form';

@Component({
  selector: 'app-pincode',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pincode.html',
  styleUrl: './pincode.scss'
})
export class Pincode implements OnInit{
  
  searchControl = new FormControl('');
  public pincodes = signal<any[]>([]);
  // Add a signal to store the search term
  searchTerm = signal('');
  // Computed signal for filtered pincodes
  filteredPincodes = signal<any[]>([]);
  selectedCategory = signal<Response | null>(null);
  showModel = signal(false);
  filteredCategories = signal([]);


  private pincodeService = inject(PincodeS);
  private modalService = inject(NgbModal);  

  ngOnInit(): void {
    this.getPincode();
    // Subscribe to searchControl changes to filter pincodes
    this.searchControl.valueChanges.subscribe((value) => {
      this.searchTerm.set(value || '');
      this.filterPincode(value);
    });
  }
  get activePincodes() {
    return this.pincodes().filter(pincode => pincode.status === true).length;
  }
  public getPincode(){
    this.pincodeService.getPincode().subscribe({
      next:(response:any)=>{
        this.pincodes.set(response.data)
        // Update filteredPincodes initially
        this.filteredPincodes.set(response.data);
      }, 
      error(err) {
        
      },
    })
  }

  deletedPincode(id: string){
    this.pincodeService.deletePincode(id).subscribe({
      next :(res)=>{
        this.getPincode();
        alert('Pincode deleted');
      }
    })
  }

  openModal(item?: any): void {
    const modalRef = this.modalService.open(PincodeForm, { size: 'lg',  backdrop: false, keyboard: true});
    if (modalRef && modalRef.componentInstance) {
      modalRef.componentInstance.item = item ? { ...item } : null;
      if (modalRef.result) {
        modalRef.result.then((result: any) => {
          if (result) {
            this.getPincode();
          }
        }).catch(() => {});
      }
    }
  }

  public filterPincode(search: any): void {
    // Context: Filter pincodes based on the search term (by pincode or area)
    const term = (search || '').toLowerCase().trim();
    if (!term) {
      this.filteredPincodes.set(this.pincodes());
      return;
    }
    this.filteredPincodes.set(
      this.pincodes().filter(pincode =>
        (pincode.pincode && pincode.pincode.includes(term)))
    );
  }


}
