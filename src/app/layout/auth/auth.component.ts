import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "../../shared/component/footer/footer.component";
@Component({
  selector: 'busnaa-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone:true,
  imports: [RouterOutlet, FooterComponent]
})
export class AuthComponent {
}
