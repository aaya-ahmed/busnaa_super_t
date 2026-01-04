import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const tokenGuard: CanActivateFn = (route, state) => {
    const decodeJwt = (token: string) => {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch (e) {
            return null;
        }
    }
    const isTokenExpired = (token: string): boolean => {
        const decoded = decodeJwt(token);
        if (!decoded || !decoded.exp) return true;
        const exp = decoded.exp * 1000; // convert to ms
        const now = Date.now();
        return now > exp; // true if expired
    }
    const router = inject(Router);
    const isAuthenticated = !!localStorage.getItem('token');
    if (!isAuthenticated) {
        return router.parseUrl('/');
    }

    if (isTokenExpired(localStorage.getItem('token')!)) {
        localStorage.clear();
        return router.parseUrl('/');
    }
    return true;
};
