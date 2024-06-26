import {Component, Inject, OnInit} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd/message";
import {catchError, Observer} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {Router} from "@angular/router";
import {NzCardComponent} from "ng-zorro-antd/card";
import {AuthService, VerificationService} from "../../../auth_module";
import {AuthCallService} from "../../../auth_module/auth-call.service";
import {Role} from "../../../models/accounts";
import {user_routes} from "../../../roots/routes";
import {loginSubject} from "../../../injection_tokens/subject.data";

@Component({
  selector: 'app-account-information',
  templateUrl: './account-information.component.html',
  styleUrl: './account-information.component.css',
  imports: [
    NzCardComponent
  ],
  standalone: true
})
export class AccountInformationComponent implements OnInit{
  constructor(private message: NzMessageService,
              private verificationService: VerificationService,
              private router: Router,
              private authService: AuthService,
              private call: AuthCallService,
              @Inject(loginSubject) private loginObserver:Observer<boolean>
              ) {

  }
  roles: Role[] | undefined;
  get user(){
    return this.authService.user;
  }
  ngOnInit() {
    this.verificationService.checkToken().pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401 || err.status === 403) {
            this.message.error("身份信息已经过期，请重新登录");
            this.router.navigate(user_routes.sign_in);
          }

        } else {
          this.message.error("网络错误")
        }
        throw err;
      })
    ).subscribe({
      next: value => {
        this.fetchRolesOfThisUser();
        console.log("ok")
      }
    })
  }
  fetchRolesOfThisUser(){
    this.call.getRolesWithUserId(this.user?.id!).subscribe({
      next: (roles: Role[]) =>{
        this.roles = roles;
      }
    })
  }

  logout() {
    this.authService.logout();
    this.ngOnInit();
    this.loginObserver.next(true);
  }
}
