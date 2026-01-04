import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { SidemanagerService } from '../../../services/sidemanager.service';
import { AuthenticationService } from '../../../services/apis/auth.service';

@Component({
  selector: 'busnaa-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    TranslatePipe
  ],
  template: `
  <mat-toolbar>
    <button mat-icon-button (click)="toggleMenu()">
      <mat-icon>menu</mat-icon>
    </button>
    <span>{{ 'title' | translate }}</span>
    <span class="spacer"></span>
    <button mat-icon-button [matMenuTriggerFor]="menu">
      <mat-icon>settings</mat-icon>
    </button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item (click)="openInfo()">
        <mat-icon mat-list-icon svgIcon="school" aria-hidden="false" aria-label="School"></mat-icon>
        <span>{{ 'profile' | translate }}</span>
      </button>
      <button mat-menu-item (click)="openSuper()">
        <mat-icon>fingerprint</mat-icon>
        <span>{{ 'super_access' | translate }}</span>
      </button>
      <button mat-menu-item (click)="signOut()">
        <mat-icon>power_settings_new</mat-icon>
        <span>{{ 'logout' | translate }}</span>
      </button>
    </mat-menu>
  </mat-toolbar>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() opened: boolean = false;
  private _menusopen: boolean = true;
  showsearch: boolean = true;

  @Output() menuStatus = new EventEmitter<string>();

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private dialog: MatDialog,
    private sidebar: SidemanagerService
  ) { }

  ngOnInit(): void {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.sidebar.load({ open: false,data:null,type:'' });
        if (this.sidebar.currentQuery.mode == 'over' && this.sidebar.currentQuery.menuOpen == 'yes') {
          this.menuStatus.emit(this._menusopen ? 'yes' : 'no');
        }
      }
    });
  }

  toggleMenu() {
    this._menusopen = !this._menusopen;
    this.menuStatus.emit(this._menusopen ? 'yes' : 'no');
  }

  signOut() {
    this.authService.SignOut();
  }

  openSuper() {
    // const dialogRef = this.dialog.open(SuperaccessComponent);
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result && result == '$mart@ccess23') {
    //     this.authService.accessSuper(true);
    //     alert('Super Mode : On');
    //     // this.router.navigate(['super'])
    //   } else {
    //     alert('Super Mode : Access Denied');
    //   }
    // });
  }

  openInfo() {
    // this.dialog.open(InfoComponent);
  }
}
