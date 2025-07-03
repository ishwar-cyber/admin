import { Component, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { PopUp } from "../../shareds/modal/modal";
import { Modal } from '../../services/modal';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-brand',
  imports: [PopUp, CommonModule, ReactiveFormsModule],
  templateUrl: './brand.html',
  styleUrl: './brand.scss'
})
export class Brand implements OnInit{
 
  brandFrom! : FormGroup;
  private modalService = inject(Modal);
  public openForm =signal<boolean>(false);
  isLoading = signal(false);
  editMode = signal(false);
  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>;
  private formBuilder = inject(FormBuilder);
  ngOnInit(): void {
    this.buildForm();
  }
  openBrandForm() {
    this.openForm.set(true)
    this.modalService.open({
      title: 'Example Modal',
      content: this.modalContent,
      size: 'sm'
    });
  }
  onModalClosed(){

  }
procced(){

}
public buildForm() {
  this.brandFrom = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    image:[null, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    status: ['active', Validators.required]
  });
}
}
