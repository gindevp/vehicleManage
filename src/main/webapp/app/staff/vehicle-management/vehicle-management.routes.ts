import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';
import { of } from 'rxjs';

import { IVehicle } from './vehicle-management.model';
import { VehicleManagementService } from './service/vehicle-management.service';

export const userManagementResolve: ResolveFn<IVehicle | null> = (route: ActivatedRouteSnapshot) => {
  const login = route.paramMap.get('login');
  if (login) {
    return inject(VehicleManagementService).find(login);
  }
  return of(null);
};

const VehicleManagementRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/vehicle-management.component'),
    data: {
      defaultSort: 'id,asc',
    },
  },
  // {
  //   path: ':login/view',
  //   loadComponent: () => import('./detail/user-management-detail.component'),
  //   resolve: {
  //     user: userManagementResolve,
  //   },
  // },
  // {
  //   path: 'new',
  //   loadComponent: () => import('./update/user-management-update.component'),
  //   resolve: {
  //     user: userManagementResolve,
  //   },
  // },
  // {
  //   path: ':login/edit',
  //   loadComponent: () => import('./update/user-management-update.component'),
  //   resolve: {
  //     user: userManagementResolve,
  //   },
  // },
];

export default VehicleManagementRoute;
