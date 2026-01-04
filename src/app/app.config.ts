import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
// import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE, firebaseAuth, firebaseDB, firebaseStorage } from './firebase.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // provideRouter(routes, withHashLocation()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en'
    }),
    // { provide: FIREBASE_AUTH, useValue: firebaseAuth },
    // { provide: FIREBASE_DB, useValue: firebaseDB },
    // { provide: FIREBASE_STORAGE, useValue: firebaseStorage }
  ]
};
