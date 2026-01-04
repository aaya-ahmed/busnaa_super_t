import { Component, effect, input, signal, untracked } from '@angular/core';
import { IschoolLocation, ISchoolLocationData } from '../../../../shared/model/schoolLocation';
import { form, pattern, required, Field, readonly, disabled } from '@angular/forms/signals';
import governmentList from '../../../../../assets/government.json'
import { SchoolLocationService } from '../../../../services/apis/schoolLocation.service';
import { take } from 'rxjs';
import { SidemanagerService } from '../../../../services/sidemanager.service';
import { TranslatePipe } from '@ngx-translate/core';
import { MatFormField, MatLabel, MatError } from "@angular/material/form-field";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { SchoolService } from '../../../../services/apis/school.service';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { ToastService } from '../../../../services/toast.service';
@Component({
  templateUrl: './schoolsLocationform.html',
  styleUrls: ['../../../../../_form.scss'],
  standalone: true,
  imports: [TranslatePipe, MatButton, MatFormField, MatInputModule, MatLabel, Field, MatError, MatSelect, MatOption, MatProgressSpinner]
})
export class SchoolsLocationformComponent {
  data = input<IschoolLocation>({
    key: '',
      location: '',
      name: '',
      account: 0,
      country: '',
      government: ''
  });
  governments: { name: string, nameEn: string }[] = governmentList;
  submitting = signal(false);
  language = signal(window.localStorage.getItem('page-lang'))
  dataForm = form(signal<ISchoolLocationData>({
    location: '',
    name: '',
    account: 0,
    country: '',
    government: ''
  }), (field) => {
    required(field.name, { message: 'name is required' });
    required(field.location, { message: 'location is required' });
    pattern(field.location, /^([+-]?((([0-8]?[0-9])|90)\.[0-9]{4,})),([+-]?((([0-9]?[0-9])|1[0-7][0-9]|180)\.[0-9]{4,}))$/, { message: 'location is invalid' })
    disabled(field.country!)
  });
  constructor(private schoolService: SchoolService,
    private schoolLocationService: SchoolLocationService,
    private sidebar: SidemanagerService,
    private toastService: ToastService
  ) {
    effect(() => {
      const data = this.data();
      untracked(() => {
        this.dataForm().setControlValue({
          name: data?.name ?? "",
          location: data?.location ?? '',
          government: data?.government ?? "",
          account: +(this.schoolService.getSchoolFromLocalStorage()?.key || 0),
          country: window.localStorage.getItem('page-lang') == 'en' ? 'Egypt' : 'مصر',
        })
      })
    })
  }
  save() {
    let dt = this.dataForm().value();
    this.submitting.set(true);
    if (this.data().key) {
      this.schoolLocationService.updateSchoolLocation({ key: this.data().key, ...dt }).pipe(take(1)).subscribe({
        next: () => {
          this.submitting.set(false);
          this.sidebar.load({ open: false, type: '', reLoad: true, data: null });
        }, error: (e) => {
          this.toastService.show('error', e)
        }
      });
    } else {
      this.schoolLocationService.addSchoolLocation(dt).pipe(take(1)).subscribe({
        next: () => {
          this.submitting.set(false);
          this.sidebar.load({ open: false, type: '', reLoad: true, data: null });
        }, error: (e) => {
          this.toastService.show('error', e)
        }
      });
    }
  }
  cancal() {
    this.sidebar.load({ open: false, type: '', reLoad: false, data: null });
  }

}
