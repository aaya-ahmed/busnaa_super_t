import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatDrawerMode, MatDrawerContainer, MatDrawer, MatDrawerContent } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from "../../shared/component/sidebar/sidebar.component";
import { HeaderComponent } from "../../shared/component/header/header.component";
import { SidehostComponent } from "../../shared/component/sidehost/sidehost.component";
import { FooterComponent } from "../../shared/component/footer/footer.component";
@Component({
  selector: 'busnaa-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  standalone:true,
  imports: [MatDrawerContainer, MatDrawer, MatDrawerContent, RouterOutlet, SidebarComponent, HeaderComponent, SidehostComponent, FooterComponent]
})
export class DefaultComponent implements OnInit {
  classes = 'rightside';
  openSide:boolean = false;
  menuOpen:string = 'yes';
  isopen:boolean = true;
  mode:MatDrawerMode = 'side';
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer,public breakpointObserver: BreakpointObserver) {

    iconRegistry.addSvgIcon(
      'students',
      sanitizer.bypassSecurityTrustResourceUrl('/images/students2.svg'));

    iconRegistry.addSvgIcon(
      'parents',
      sanitizer.bypassSecurityTrustResourceUrl('/images/family.svg'));

    iconRegistry.addSvgIcon(
      'school',
      sanitizer.bypassSecurityTrustResourceUrl('/images/school.svg'));

    // this.ngAuth.checkAuthentication();
  }

  ngOnInit(): void {
    console.log(Breakpoints)
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).subscribe(result => {
      if (result.breakpoints[Breakpoints.XSmall]) {
          // handle XSmall breakpoint
          ;
          this.isopen = false;
          this.menuOpen = "no";
          this.mode = "over";
      }
      if (result.breakpoints[Breakpoints.Small]) {
          // handle Small breakpoint
          ;
          this.isopen = false;
          this.menuOpen = "no";
          this.mode = "over";
      }
      if (result.breakpoints[Breakpoints.Medium]) {
          // handle Medium breakpoint
          ;
          this.isopen = false;
          this.menuOpen = "no";
          this.mode = "push";
      }
      if (result.breakpoints[Breakpoints.Large]) {
          // handle Large breakpoint
          ;
          this.isopen = true;
          this.menuOpen = "yes";
          this.mode = "side";
      }
      if (result.breakpoints[Breakpoints.XLarge]) {
          // handle XLarge breakpoint
          ;
          this.isopen = true;
          this.menuOpen = "yes";
          this.mode = "side";
      }
      // this.sd.currentQuery = { menuOpen : this.menuOpen, mode : this.mode};

      // this.sd._loader.subscribe(res => {
      //   this.classes = 'rightside ' + res.type;
      // });
    });
  }

  onChangeMenu(e:any){
    this.menuOpen = e ? 'yes' : 'no';
    // this.sd.currentQuery.menuOpen  = this.menuOpen;
  }

  toggleMenu(){
    this.menuOpen = this.menuOpen == 'yes' ? 'no' : 'yes';
    // this.sd.currentQuery.menuOpen  = this.menuOpen;
  }

  openSidebar($event:any){
    this.openSide = $event;
  }

  toggleExpandMenu(){
    this.isopen = !this.isopen;
    this.menuOpen = this.isopen ? 'yes' : 'no';
    // this.sd.currentQuery.menuOpen  = this.menuOpen;
  }
}
