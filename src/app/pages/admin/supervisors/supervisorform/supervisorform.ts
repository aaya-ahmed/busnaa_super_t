import { Component, effect, input, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {  MatDialogModule } from '@angular/material/dialog';
import { SidemanagerService } from '../../../../services/sidemanager.service';
import { PhonevalidationService } from '../../../../services/phonevalidation.service';
import { TranslatePipe } from '@ngx-translate/core';
import { form, required, Field, validate, customError } from '@angular/forms/signals';
import { IPostSupervisorData, IPutSupervisorData, Isupervisor } from '../../../../shared/model/supervisor';
import { userTypes } from '../../../../shared/consts/const';
import { SchoolService } from '../../../../services/apis/school.service';
import { SupervisorService } from '../../../../services/apis/supervisor.service';
import { ToastService } from '../../../../services/toast.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { switchMap, take } from 'rxjs';
@Component({
  selector: 'busnaa-supervisor-form',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    TranslatePipe,
    Field
  ],
  templateUrl: './supervisorform.html',
  styleUrls: ['../../../../../_form.scss']
})
export class SupervisorformComponent {
  data = input<Isupervisor>({
    key: '',
      address: '',
      latlng: '',
      name: '',
      phone: '',
      schools: '',
      type: 0,
      user_key: '',
      isBlocked: false
  });
  submitting = signal(false);
  dataForm = form(signal<IPutSupervisorData>({
    key: '',
    isBlocked: false,
    name: '',
    phone: '',
    schools: '',
    type: userTypes.supervisor,
  }),
    field => {
      required(field.name,{message:'name is required'});
      validate(field.phone, (ctx) => {
        return this.phoneValidation.phoneValidator(ctx.value()) ? undefined :
          customError({ message: 'invalidphone', kind: 'invalidphone' });
      });
    }
  );
  constructor(
    private phoneValidation: PhonevalidationService,
    private sidebar: SidemanagerService,
    private schoolService: SchoolService,
    private supervisorService: SupervisorService,
    private toastService: ToastService,
    private confirmService:ConfirmService
  ) {
    this.dataForm().setControlValue({
      ...this.dataForm().value(),
      schools: this.schoolService.getSchoolFromLocalStorage()?.key ?? '',
      type: userTypes.supervisor
    });
    effect(() => {
      const data = this.data(); 
      if(data.key){
        untracked(() => {
          this.dataForm().setControlValue({
            ...this.dataForm().value(),
            key: data.key,
            isBlocked: !!data.isBlocked,
            name: data.name,
            phone: data.phone,
          });
        });
      }
    });
  }
  save() {
    if (this.dataForm().invalid()) {
      return;
    }
    const dt = this.dataForm().value();
    this.submitting.set(true);
    if (dt.key) {
      if (dt.key === parseInt(dt.phone).toString()) {
        this.updateSupervisor(dt);
      } else {
        this.confirmChangePhone();
      }
    } else {
      delete (dt as any).key
      this.addSupervisor(dt);
    }
  }

  addSupervisor(data: IPostSupervisorData) {
    this.supervisorService.addSupervisor(data).subscribe({
      next: () => {
        this.toastService.show('success', 'supervisor is added')
        this.sidebar.load({ open: false, reLoad: true, type: '', data: null });
      },
      error: (e) => {
        this.toastService.show('error', e)
      }
    });
  }

  updateSupervisor(data: IPutSupervisorData) {
    this.supervisorService.updateSupervisor(data).subscribe({
      next: () => {
        this.toastService.show('success', 'supervisor is updated')
        this.sidebar.load({ open: false, reLoad: true, type: '', data: null });
      },
      error: (e) => {
        this.toastService.show('error', e)
      }
    });
  }

  cloneSupervisor() {
    const dt = this.dataForm().value();
    this.supervisorService.cloneSupervisor(dt).pipe(
    ).subscribe({
      next: () => {
        this.toastService.show('success', 'supervisor is updated')
        this.sidebar.load({ open: false, reLoad: true, type: '', data: null });
      },
      error: (e) => {
        this.toastService.show('error', e)
      }
    });
  }

  cancal() {
    this.sidebar.load({ open: false, reLoad: false, data: null, type: 'supervisor' });
  }

  confirmChangePhone() {
    const dialog=this.confirmService.show({
      message:'you have changed supervisor phone number to an already existing supervisor',
      noText:'cancel',
      yesText:'confirm'
    });
    dialog.pipe(take(1)).subscribe({
      next:(responce)=>{
        if (responce) this.cloneSupervisor();
        else this.submitting.set(false)
      }
    });
  }
}
