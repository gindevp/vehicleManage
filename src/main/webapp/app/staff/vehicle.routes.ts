import { Routes } from '@angular/router';
/* jhipster-needle-add-admin-module-import - JHipster will add admin modules imports here */

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'vehicle-management',
  },
  {
    path: 'vehicle-management',
    loadChildren: () => import('./vehicle-management/vehicle-management.routes'),
    title: 'vehicleManagement.home.title',
  },
];

export default routes;
