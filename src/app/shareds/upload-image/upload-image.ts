import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, model, output, signal } from '@angular/core';
@Component({
  selector: 'upload-image',
  imports: [CommonModule],
  templateUrl: './upload-image.html',
  styleUrl: './upload-image.scss'
})
export class UploadImage {
  maxFileSizeMB = input(5);
  allowedTypes = input<string[]>(['image/jpeg', 'image/png', 'image/gif']);

  // Outputs using new output() function
  filesSelected = output<File[]>();
  uploadComplete = output<string[]>();

  // Model for two-way binding (alternative to ngModel)
  previewUrls = model<string[]>([]);

  // State signals
  isDragging = signal(false);
  errorMessage = signal<string | null>(null);
  uploadProgress = signal<number | null>(null);
  isUploading = computed(() => this.uploadProgress() !== null);

  // Computed values
  allowedTypesText = computed(() => this.allowedTypes().join(', '));
  hasFiles = computed(() => this.previewUrls().length > 0);
  uploadButtonText = computed(() => 
    this.isUploading() 
      ? `Uploading... (${this.uploadProgress()}%)` 
      : `Upload ${this.previewUrls().length} Image(s)`
  );

  constructor() {
    // Log changes (for debugging)
    effect(() => {
      console.log('Current upload progress:', this.uploadProgress());
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFiles(input.files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  private handleFiles(files: FileList): void {
    this.errorMessage.set(null);
    const validFiles: File[] = [];
    
    Array.from(files).forEach(file => {
      if (!this.isFileTypeValid(file)) {
        this.errorMessage.set(
          `Invalid file type. Only ${this.allowedTypesText()} are allowed.`
        );
        return;
      }
      
      if (!this.isFileSizeValid(file)) {
        this.errorMessage.set(
          `File too large. Max size is ${this.maxFileSizeMB()}MB.`
        );
        return;
      }
      
      validFiles.push(file);
      this.previewImage(file);
    });

    if (validFiles.length > 0) {
      this.filesSelected.emit(validFiles);
    }
  }

  private previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.previewUrls.update(urls => [...urls, e.target!.result as string]);
      }
    };
    reader.readAsDataURL(file);
  }

  private isFileTypeValid(file: File): boolean {
    return this.allowedTypes().includes(file.type);
  }

  private isFileSizeValid(file: File): boolean {
    return file.size <= this.maxFileSizeMB() * 1024 * 1024;
  }

  removeImage(index: number): void {
    this.previewUrls.update(urls => urls.filter((_, i) => i !== index));
  }

  async uploadFiles(): Promise<void> {
    if (!this.hasFiles()) return;
    
    this.uploadProgress.set(0);
    
    // Simulate upload with progress updates
    while (this.uploadProgress()! < 100) {
      await new Promise(resolve => setTimeout(resolve, 200));
      this.uploadProgress.update(progress => Math.min(progress! + 10, 100));
    }
    
    // Complete the upload
    setTimeout(() => {
      this.uploadComplete.emit(this.previewUrls());
      this.uploadProgress.set(null);
    }, 500);
  }
}
