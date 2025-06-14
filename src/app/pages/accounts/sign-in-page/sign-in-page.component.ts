import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzIconModule} from "ng-zorro-antd/icon";
import {TranslateModule} from "@ngx-translate/core";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {NzFormControlComponent, NzFormDirective} from "ng-zorro-antd/form";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {NzCheckboxComponent} from "ng-zorro-antd/checkbox";
import {NzMessageService} from "ng-zorro-antd/message";
import {AuthService, VerificationService} from "../../../auth_module";
import {user_routes} from "../../../roots/routes";
import {loginSubject} from "../../../injection_tokens/subject.data";
import {Observer} from "rxjs";

@Component({
  standalone: true,
  imports: [
    NzCardModule,
    RouterLink,
    NzButtonModule,
    NzIconModule,
    TranslateModule,
    NzColDirective,
    ReactiveFormsModule,
    NzRowDirective,
    NzCheckboxComponent,
    FormsModule
  ],
  selector: 'app-sign-in-page',
  templateUrl: './sign-in-page.component.html',
  styleUrl: './sign-in-page.component.css'
})
export class SignInPageComponent {
  validateForm: FormGroup<{
    username: FormControl<string>;
    password: FormControl<string>;
    remember: FormControl<boolean>;
  }> = this.fb.group({
    username: ['', [Validators.required,Validators.minLength(3), Validators.maxLength(20)]],
    password: ['', [Validators.required,Validators.minLength(6), Validators.maxLength(20)]],
    remember: [true]
  });
  constructor(private authService: AuthService, private router: Router,
              private fb: NonNullableFormBuilder,
              private verificationService: VerificationService,
              private message: NzMessageService,
              @Inject(loginSubject) private loginObserver:Observer<boolean>
              ) {

  }
  @ViewChild("vCode")
  vCode: ElementRef |undefined;
  submitForm(): void {
    if (this.validateForm.valid) {
      if(this.code?.toLowerCase()!==this.vCode?.nativeElement.value.toLowerCase()){
        this.message.error("验证码错误");
        this.generateVerificationCode();
        return;
      }
      let username = this.validateForm.value.username;
      let password = this.validateForm.value.password!;
      this.authService.login(username!,password!)
        .subscribe({
          next: response => {
            // console.log(response)
            this.authService.restore({name: username!, id: response.id,password: password!}, response.token);
            this.router.navigate(user_routes.account_info);
            this.loginObserver.next(true);
            }
        });

    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
  ngOnInit(): void {
    this.generateVerificationCode();
  }
  code: string | undefined;
  codeUrl: string | undefined;
  generateVerificationCode() {
    this.verificationService.generateVerificationCode()
      .subscribe(
      {
        next: (value:any) => {
          this.code = value.code;
          this.codeUrl = 'data:image/jpeg;base64,' + value.img;
        }
      }
    );
  }

}
