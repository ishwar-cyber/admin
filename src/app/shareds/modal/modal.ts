import { Component, DOCUMENT, EventEmitter, inject, Input, Output } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(20px)' }),
        animate('200ms ease-out', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(20px)' }))
      ])
    ])
  ]
})
export class PopUp {
private document = inject(DOCUMENT);

  // @Input() title = '';
  @Input() showCloseButton = true;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() backdropClose = true;
  @Output() closed = new EventEmitter<void>();

  // get sizeClasses() {
  //   return {
  //     'sm': 'max-w-[400px]',
  //     'md': 'max-w-[600px]',
  //     'lg': 'max-w-[800px]',
  //     'xl': 'max-w-[1200px]'
  //   }[this.size];
  // }

  get sizeClasses() {
  return {
    'sm': 'modal-sm',
    'md': '', // Bootstrap's default size doesn't need a class
    'lg': 'modal-lg',
    'xl': 'modal-xl'
  }[this.size];
}

  close() {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (this.backdropClose && (event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }
}

