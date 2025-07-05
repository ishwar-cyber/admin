import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { httpInterceptor } from './common/interceptor/http-interceptor';
import { errorInterceptor } from './common/interceptor/error-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(), provideHttpClient(
       withInterceptors(
        [httpInterceptor, errorInterceptor]
      )
    ),provideAnimations(),
    provideRouter(routes), provideClientHydration(withEventReplay())
  ]
};
