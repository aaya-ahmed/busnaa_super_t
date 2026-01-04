import { Component, input, OnInit, signal } from '@angular/core';
import { SchoolService } from '../../../../services/apis/school.service';
import { form, required, Field, readonly, disabled } from '@angular/forms/signals';
import { Ischool } from '../../../../shared/model/school';
import { TranslatePipe } from '@ngx-translate/core';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { ToastService } from '../../../../services/toast.service';
import { SidemanagerService } from '../../../../services/sidemanager.service';

@Component({
  templateUrl: './profileform.component.html',
  imports: [TranslatePipe,
    MatInput,
    MatButton,
    MatFormField, MatLabel, Field],
  styleUrls: ['./profileform.component.scss', '../../../../../_form.scss']
})
export class ProfileformComponent implements OnInit {
  dataForm = form(signal<Required<Ischool>>({
    key: '',
    address: '',
    countryCode: '',
    location: '',
    name: '',
    phoneNumber: '',
    logo: ''
  }), (field) => {
    required(field.address);
    required(field.countryCode);
    required(field.name);
    required(field.phoneNumber);
    disabled(field.countryCode);
  });
  constructor(private schoolService: SchoolService,
        private toastService: ToastService,
        private sidebar:SidemanagerService
  ) { }

  ngOnInit(): void {
    // this.dataForm().se
    const schoolInfo = this.schoolService.getSchoolFromLocalStorage();
    if (schoolInfo) {
      this.dataForm().setControlValue({
        countryCode: schoolInfo.countryCode,
        name: schoolInfo.name,
        location: schoolInfo.location ?? '',
        address: schoolInfo.address,
        phoneNumber: schoolInfo.phoneNumber,
        key: schoolInfo.key,
        logo: schoolInfo.logo ?? ''
      });
    }
  }

  save() {
    this.schoolService.updateSchool({ ...this.dataForm().value(), key: this.dataForm().value().key }).subscribe({
      next: () => {
        this.toastService.show('success', 'data is updated')
        this.sidebar.load({ open: false, reLoad: false, type: '', data: null });
      },
      error: (e) => {
        this.toastService.show('error', e)
      }
    });
  }
}
