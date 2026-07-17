import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // authInterceptor before errorInterceptor: 
    // the token needs to be on the request before it goes out; errorInterceptor only touches the response.
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    // Fetches /api/Auth/Config (and restores any existing session) before the app renders, 
    // so the header/guards have ssoEnabled()/isAuthenticated() available synchronously on first paint instead of flashing "signed out".
    provideAppInitializer(() => inject(AuthService).init()),
  ],
};
