import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const isAuthenticated = !!localStorage.getItem('busnaa_user'); 
  if(isAuthenticated){
    return state.url === '/' ? router.parseUrl('/admin/supervisors') : true;
  }else{
    return state.url !== '/' ? router.parseUrl('/') : true;
  }
};
