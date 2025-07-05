import { Component, inject } from '@angular/core';
import { LoginResponse } from '../../../models/login';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../services/auth';
import { StorageHandler } from '../../../services/storage-handler';
import { CookiesKeys, StorageKeys } from '../../../common/commonConstant';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
loginForm: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;
  errorMessage: string = '';
  private authService = inject(Auth);
  private storageHandlerService = inject(StorageHandler);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router)
  constructor( ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if there's a stored email in localStorage
    this.storageHandlerService.deleteCookie(CookiesKeys.authToken);
    this.storageHandlerService.removeSessionStorage(StorageKeys.currentUser);
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail, rememberMe: true });
    }
  }

  async login() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const { email, password } = this.loginForm.value;
      const payload ={
        email: email,
        password: password
      }
      this.authService.login(payload).subscribe({
        next: (response:LoginResponse) => {
          console.log('response',response?.token);
          
            if(response?.token) {
                this.storageHandlerService.setCookie(CookiesKeys.authToken, response.token, 1);
                this.storageHandlerService.setSessionStorage(StorageKeys.currentUser, response.user);
                this.router.navigate(['/admin']);
                
            } else {
              this.errorMessage = 'Invalid email or password';
            }
          // Handle successful login
        },
        error: (err) => {
          console.error(err);
          
          this.errorMessage = 'Invalid email or password';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
     
      // // Handle "Remember Me" functionality
      // if (rememberMe) {
      //   localStorage.setItem('rememberedEmail', email);
      // } else {
      //   localStorage.removeItem('rememberedEmail');
      // }

      // try {
        // this.authService.login(payload);
        // this.router.navigate(['/admin']);
      // } catch (error) {
      //   this.errorMessage = 'Invalid email or password';
      // } finally {
      //   this.isLoading = false;
      // }
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
