import { Component, signal} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldTree, form, Field, required } from '@angular/forms/signals';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { MatError } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { AuthenticationService } from '../../../services/apis/auth.service';
interface LoginForm {
  username: string;
  password: string;
}
@Component({
  selector: 'busnaa-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, MatProgressBarModule, MatProgressSpinnerModule, MatError, Field]

})
export class LoginComponent {
  viewLoader = signal(false);
  loginForm: FieldTree<{
    username: string;
    password: string;
  }, string | number> = form(
    signal<LoginForm>({ username: '', password: '' }),
    validations => {
      required(validations.username, { message: 'userName is required' });
      required(validations.password, { message: 'password is required' });
    }
  );

  constructor(
    private authService: AuthenticationService,
    private route: Router,
    private toastService:ToastService
  ) {}

  signIn() {
    this.viewLoader.set(true);
    this.authService.SignIn(this.loginForm().value()).then(() => {
      this.viewLoader.set(false);
      this.route.navigate(['/admin']);
    }).catch(() => {
      this.viewLoader.set(false);
      this.toastService.show('error','UserName / Password Not Valid')
    })
  }
}
