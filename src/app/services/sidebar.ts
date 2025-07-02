import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Sidebar {

  isCollapsed = signal(false);

  toggle() {
    this.isCollapsed.update(value => !value);
  }

  expand() {
    this.isCollapsed.set(false);
  }

  collapse() {
    this.isCollapsed.set(true);
  }
}
