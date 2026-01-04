import { Component, OnInit } from '@angular/core';
import { SidemanagerService } from '../../../services/sidemanager.service';
import { MatDivider, MatListModule } from '@angular/material/list';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'busnaa-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    MatListModule,
    TranslatePipe,
    MatIconModule,
    MatDivider,
    RouterModule
  ],
})
export class SidebarComponent implements OnInit {
  // access:boolean=false;
  constructor(private sidebar:SidemanagerService) {

  }

  ngOnInit(): void {
    // this.auth.super.subscribe(
    //   (res:boolean)=>{ 
    //     this.access = res;
    //   }
    //  );
  }

  openInfo(){
    this.sidebar.load({ open: true , type : 'school' , data : null });
  }
}
