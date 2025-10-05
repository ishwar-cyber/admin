import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, HostListener, input, OnChanges, OnInit, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CategoryM } from '../../models/category';

@Component({
  selector: 'app-single-select',
  imports: [CommonModule],
  templateUrl: './single-select.html',
  styleUrl: './single-select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SingleSelect),
      multi: true
    }
  ],
})
export class SingleSelect implements OnInit, OnChanges, ControlValueAccessor {
     // ✅ Input from parent
  options = input.required<CategoryM[]>();

  // ✅ Signals
  filteredOptions = signal<CategoryM[]>([]);
  selectedOption = signal<CategoryM | null>(null);
  isOpen = signal(false);

  // ✅ CVA callbacks
  private onChange: any = () => {};
  private onTouched: any = {};

  constructor(private eref: ElementRef) {
  }

  // ✅ Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.eref.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
  ngOnInit() {
    this.filteredOptions.set(this.options());
  }


  filterOptions(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredOptions.set(
      this.options().filter(opt =>
        opt.name.toLowerCase().includes(value)
      )
    );
  }

  selectOption(option: CategoryM) {
    // ✅ Update internal state
    this.selectedOption.set(option);
    this.isOpen.set(false);
    // ✅ Notify parent form (ControlValueAccessor)
    this.onChange(option);
    this.onTouched();
  }

  // ✅ ControlValueAccessor Implementation
  writeValue(value: any): void {
    this.selectedOption.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Handle disabled state if needed
  }

  ngOnChanges() {
    this.filteredOptions.set(this.options());
  }
}
