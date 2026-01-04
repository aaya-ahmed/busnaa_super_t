import { Component, ComponentRef, EventEmitter, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { loaderType, SidemanagerService } from '../../../services/sidemanager.service';
import { SupervisorformComponent } from '../../../pages/admin/supervisors/supervisorform/supervisorform';
import { SchoolsLocationformComponent } from '../../../pages/admin/schoolsLocation/schoolsLocationform/schoolsLocationform';
import { StudentformComponent } from '../../../pages/admin/students/studentform/studentform.component';
import { ProfileformComponent } from '../../../pages/admin/profile/profileform/profileform.component';
import { TripformComponent } from '../../../pages/admin/trips/trip-form/trip-form.component';

@Component({
  selector: 'busnaa-sidehost',
  templateUrl: './sidehost.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule
  ],
})
export class SidehostComponent implements OnInit {
  viewContainerRef: ComponentRef<any> | null = null;
  @Output() openSidebar = new EventEmitter<boolean>();

  @ViewChild('appComphost', { static: true }) appComphost!: HTMLElement;

  constructor(private sidebar: SidemanagerService, private containerRef: ViewContainerRef) { }

  ngOnInit(): void {
    this.sidebar._loader.subscribe(data => {
      if (data) {
        if (data.open) {
          this.openSidebar.emit(true);
          this.loadComponent(data);
        } else {
          this.openSidebar.emit(false);
        }
      }
    });
  }
  close() {
    this.openSidebar.emit(false);
    this.clear()
  }
  clear() {
    if (this.viewContainerRef) {
      this.viewContainerRef.destroy();
    }
  }

  async loadComponent(_data: loaderType) {
    this.viewContainerRef?.destroy();
    const container = (document.getElementsByClassName('rightside')[0] as HTMLElement);
    container.style.width = '100%';
    switch(_data.type){
      case 'supervisor':
        this.viewContainerRef = this.containerRef.createComponent(SupervisorformComponent);
        break;
      case 'location':
        this.viewContainerRef = this.containerRef.createComponent(SchoolsLocationformComponent);
        break;
      case 'student':
        this.viewContainerRef = this.containerRef.createComponent(StudentformComponent);
        break;
      case 'school':
        this.viewContainerRef = this.containerRef.createComponent(ProfileformComponent);
        break;
        case  'trip':
        this.viewContainerRef = this.containerRef.createComponent(TripformComponent);
          break;
    }
    if (this.viewContainerRef)
      this.viewContainerRef.instance.data = _data.data;
    // } else if(_data.type == 'parent'){
    //   this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(ParentformComponent);
    // } else if(_data.type == 'trip'){
    //   this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(TripformComponent);
    //   container.style.width = '100%';
    // } else if(_data.type == 'student'){
    //   this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(StudentformComponent);
    // } else if(_data.type == 'assign'){
    //   this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(AssignComponent);
    // }else if(_data.type == 'campaign'){
    //   this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(CampaignFormComponent);
    // }
  }

}
