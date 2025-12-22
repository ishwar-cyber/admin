import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { Auth } from '../../../services/auth';
import { StorageHandler } from '../../../services/storage-handler';
import { CookiesKeys, StorageKeys } from '../../../common/commonConstant';
import { LoginResponse } from '../../../models/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  // ---------------- DI ----------------
  private auth = inject(Auth);
  private storage = inject(StorageHandler);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // ---------------- FORMS ----------------
  readonly loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(6)]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  readonly forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  // ---------------- FORM SIGNALS ----------------
  readonly loginStatus = toSignal(this.loginForm.statusChanges, {
    initialValue: this.loginForm.status
  });

  readonly forgotStatus = toSignal(this.forgotForm.statusChanges, {
    initialValue: this.forgotForm.status
  });

  // ---------------- UI STATE (SIGNALS) ----------------
  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly showForgot = signal(false);

  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly attempts = signal(0);
  readonly locked = computed(() => this.attempts() >= 5);

  readonly canLogin = computed(
    () => this.loginStatus() === 'VALID' && !this.loading() && !this.locked()
  );

  readonly canReset = computed(
    () => this.forgotStatus() === 'VALID' && !this.loading()
  );

  // ---------------- LIFECYCLE ----------------
  constructor() {
  
  }

ngOnInit(): void {

  this.storage.deleteCookie(CookiesKeys.authToken);
  this.storage.removeSessionStorage(StorageKeys.currentUser);

  const remembered = localStorage.getItem('rememberedUsername');
  if (remembered) {
    this.loginForm.patchValue({
      username: remembered,
      rememberMe: true
    });
  }
}
  // ---------------- ACTIONS ----------------
  login(): void {
    if (!this.canLogin()) return;

    this.loading.set(true);
    this.error.set(null);

    const { username, password, rememberMe } = this.loginForm.value;
    const payload = {
      username: username,
      password: password
    }
    this.auth.login(payload).subscribe({
      next: (res: LoginResponse) => {
        if (!res?.token) return this.fail();

        this.storage.setCookie(CookiesKeys.authToken, res.token, 1);
        this.storage.setSessionStorage(StorageKeys.currentUser, res.user);

        rememberMe
          ? localStorage.setItem('rememberedUsername', username)
          : localStorage.removeItem('rememberedUsername');

        this.attempts.set(0);
        this.router.navigate(['/admin']);
      },
      error: () => this.fail(),
      complete: () => this.loading.set(false)
    });
  }

  private fail(): void {
    this.attempts.update(v => v + 1);
    this.error.set(
      this.locked()
        ? 'Account locked after multiple failed attempts'
        : `Invalid credentials (${this.attempts()}/5)`
    );
    this.loading.set(false);
  }

  sendResetLink(): void {
    if (!this.canReset()) return;

    this.loading.set(true);
    this.success.set(null);
    this.error.set(null);

    // Replace with API call
    setTimeout(() => {
      this.loading.set(false);
      this.success.set('Password reset link sent');
      this.forgotForm.reset();
    }, 1200);
  }

  // ---------------- UI HELPERS ----------------
  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  goForgot(): void {
    this.showForgot.set(true);
    this.error.set(null);
  }
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }
  goLogin(): void {
    this.showForgot.set(false);
    this.success.set(null);
  }
}
