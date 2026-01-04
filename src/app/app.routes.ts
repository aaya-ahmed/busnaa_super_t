import { Routes } from '@angular/router';
import { AuthComponent } from './layout/auth/auth.component';
import { DefaultComponent } from './layout/default/default.component';
import { authGuard } from './guards/auth-guard';
import { tokenGuard } from './guards/token-guard';


export const routes: Routes = [
  {
    path: "",
    component: AuthComponent,
    children: [
      {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
      }
    ]
  },
  {
    path: "admin",
    component: DefaultComponent,
    canActivate: [authGuard, tokenGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/supervisors/supervisors').then(m => m.SupervisorsComponent)
      },
      {
        path: 'supervisors',
        loadComponent: () => import('./pages/admin/supervisors/supervisors').then(m => m.SupervisorsComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./pages/admin/students/students').then(m => m.StudentsComponent)
      },
      {
        path: 'trips',
        loadComponent: () => import('./pages/admin/trips/trips.component').then(m => m.TripsComponent)
      }
      ,
      {
        path: 'bus-location',
        loadComponent: () => import('./pages/admin/schoolsLocation/schoolsLocation').then(m => m.SchoolsLocationComponent)
      },
      {
        path:'dashboard',
        loadComponent:()=>import('./pages/admin/dashboard/dashboard.component').then(m=>m.DashboardComponent)
      }

    ]
  },
];
