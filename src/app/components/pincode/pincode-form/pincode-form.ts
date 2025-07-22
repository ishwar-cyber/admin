import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PincodeS } from '../../../services/pincode';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pincode-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pincode-form.html',
  styleUrl: './pincode-form.scss'
})
export class PincodeForm implements OnInit{

  pincodeForm!: FormGroup;
  private formBuilder = inject(FormBuilder);
  private productService = inject(PincodeS);
  public activeModal = inject(NgbActiveModal);
  isLoading = signal(false);


  ngOnInit(): void {
    this.pincodeForm = this.formBuilder.group({
      pincode: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  
  public procced(){
    let status = this.pincodeForm.value.status === 'true' ?  true : false;
      const payload = {
        pincode: this.pincodeForm.value.pincode,
        status: status
      }
      console.log('payload', payload);
      if(this.pincodeForm.valid){
        this.productService.addPincode(payload).subscribe({
          next:(response) => {
            this.activeModal.close(true);
            console.log('res pincode', response);
          },
          error:(err) => {
            this.activeModal.close(true);
            console.log(err); 
          },
        })
      }
  }

  allowOnlyNumbers(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }
}
