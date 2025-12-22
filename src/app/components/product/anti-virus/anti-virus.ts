import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { AntivirusService } from '../../../services/antivirus-service';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductS } from '../../../services/product';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-anti-virus',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './anti-virus.html',
  styleUrls: ['./anti-virus.scss']
})
export class AntiVirus implements OnInit {
 
  public readonly activeModal = inject(NgbActiveModal);
  private antiVirusService = inject(AntivirusService);
  private readonly productService = inject(ProductS)
  private fb = inject(FormBuilder);
 // 🔎 Search Text (Signal)
  searchText = signal<string>('');

  // Dummy product list (Replace with API)
  products = signal<any[]>([]);

  // Filtered list (computed)
  filteredProducts = computed(() =>
    this.products().filter(p =>
      p.name.toLowerCase().includes(this.searchText().toLowerCase())
    )
  );

  // Selected product
  selectedProduct = signal<any>(null);

  // 📌 Reactive Form
  keyForm: FormGroup = this.fb.group({
    keys: this.fb.array([])
  });

  ngOnInit(): void {
    this.productService.getProducts({ limit: 1000 }).subscribe({
      next: (res: any) => {
        const filtered = res.data.filter((item: any) =>  item.category.name.includes('anti')
        );
          console.log('filter', filtered);     
      }
    });
  }
  // Getter for Key FormArray
  get keysArray() {
    return this.keyForm.get('keys') as FormArray;
  }

  // ➕ Add new key row
  addKeyRow() {
    this.keysArray.push(
      this.fb.group({
        key: ['', Validators.required]
      })
    );
  }

  // ❌ Remove key row
  removeKeyRow(i: number) {
    this.keysArray.removeAt(i);
  }

  // Save final data
  saveAll() {
    if (!this.selectedProduct()) {
      alert('Please select product!');
      return;
    }

    if (this.keyForm.invalid || this.keysArray.length === 0) {
      alert('Please add at least one key!');
      return;
    }

    const payload = {
      productId: this.selectedProduct()._id,
      keys: this.keyForm.value.keys
    };

    console.log('Final Payload:', payload);
    this.antiVirusService.addKeys(payload.productId, payload.keys.map((k: any) => k.key)).subscribe({
      next: (res) => {
        console.log('ressss', res);
        
        alert('Saved successfully!');
        this.activeModal.close();
      },
      error: (err) => {
        alert('Error saving keys!');
      }
    });
  }
}
