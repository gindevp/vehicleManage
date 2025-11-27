import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { Vehicle } from '../vehicle-management.model';
import { VehicleManagementService } from '../service/vehicle-management.service';

@Component({
  selector: 'jhi-user-mgmt-delete-dialog',
  templateUrl: './user-management-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export default class UserManagementDeleteDialogComponent {
  user?: any;

  private readonly vehicleService = inject(VehicleManagementService);
  private readonly activeModal = inject(NgbActiveModal);

  cancel(): void {
    console.log('checked mode delete', this.user);
    this.activeModal.dismiss();
  }

  confirmDelete(data: any): void {
    this.vehicleService.delete(data?.id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
