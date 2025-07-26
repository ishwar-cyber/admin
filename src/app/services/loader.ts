import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Loader {

 isLoading = signal(false);

  show() { this.isLoading.set(true); }
  hide() { this.isLoading.set(false); }
}
