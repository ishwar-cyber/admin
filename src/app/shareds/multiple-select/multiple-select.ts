import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, Output, signal, ViewChild } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-multiple-select',
  imports: [CommonModule, FormsModule],
  templateUrl: './multiple-select.html',
  styleUrl: './multiple-select.css',
   providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultipleSelect),
      multi: true
    }
  ],
})
export class MultipleSelect {

  @Input() options: any[] = [];
  @Input() placeholder = 'Select options';
  @Output() selectionChange = new EventEmitter<any[]>();
  @Input() prepopulate: any[] = []; // Prepopulate selected values
  selectedValues = new Set<any>();
  searchTerm = '';
  isOpen = signal(false);

  // ControlValueAccessor methods
  onChange: any = () => {};
  onTouched: any = () => {};
  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;
  
  ngAfterViewInit(): void {
    console.log('Dropdown container:', this.options);
    
    if (this.prepopulate && this.prepopulate?.length > 0) {
      this.prepopulate?.forEach((itemId: any) => {
        const foundOption = this.options?.find((option: any) => option.id === itemId);
        this.prepopulate = foundOption;
        if (foundOption) {
          this.toggleSelection(foundOption);
        } else {
          console.warn(`Option with id ${itemId} not found in options array`);
        }
      });
    }
  }
  writeValue(value: any[]): void {
    if (value) {
      this.selectedValues = new Set(value);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  get filteredOptions() {
    return this.options.filter(option =>
      option?.name.toLowerCase().includes(this.searchTerm?.toLowerCase())
    );
  }
  public filterOptions(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    if(!this.searchTerm) {
      let options = [...this.options]; // Reset to original options if search term is empty
      this.options = options.filter(option =>
        option.name.toLowerCase().includes(this.searchTerm.toLowerCase()) 
      );
    } else {
      console.log('this.options', this.options)
    }
    this.isOpen.set(true);
  }
  toggleSelection(value: any) {
    if (this.selectedValues.has(value)) {
      this.selectedValues.delete(value);
    } else {
      this.selectedValues.add(value);
    }
    this.updateChanges();
  }

  toggleSelectAll() {
    if (this.selectedValues.size === this.filteredOptions.length) {
      this.selectedValues.clear();
    } else {
      this.filteredOptions.forEach(option => 
        this.selectedValues.add(option)
      );
    }
    this.updateChanges();
  }

  private updateChanges() {
    this.onChange([...this.selectedValues]);
    this.selectionChange.emit([...this.selectedValues]);
    this.onTouched();
  }

  get buttonText() {
    return this.selectedValues.size > 0
      ? `${this.selectedValues.size} Selected`
      : this.placeholder;
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.dropdownContainer?.nativeElement?.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}


