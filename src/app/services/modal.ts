import { Injectable, TemplateRef, ViewChild } from '@angular/core';
import { PopUp } from '../shareds/modal/modal';
@Injectable({
  providedIn: 'root'
})
export class Modal {

  @ViewChild(PopUp, { static: true }) modalComponent!: PopUp;
  open(config: {
    title: string;
    content: TemplateRef<any>;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
    backdropClose?: boolean;
  }) {
    const modal = this.modalComponent;
    // modal.title = config?.title;
    modal.size = config.size || 'md';
    modal.showCloseButton = config.showCloseButton ?? true;
    modal.backdropClose = config.backdropClose ?? true;
    // Additional logic to show modal
  }

  close() {
    this.modalComponent.close();
  }
}

