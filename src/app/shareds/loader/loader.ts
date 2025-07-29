import { Component, inject } from '@angular/core';
import { LoaderService } from '../../services/loader';

@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.html',
  styleUrl: './loader.css'
})
export class Loader {
  public loader = inject(LoaderService);
}
