import {isDevMode, NgModule, SecurityContext} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {RouteReuseStrategy, RouterOutlet} from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from "@angular/common/http";
import {CLIPBOARD_OPTIONS, ClipboardButtonComponent, MarkdownModule} from "ngx-markdown";
import {registerLocaleData} from "@angular/common";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import zh from '@angular/common/locales/zh';
import {FormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ServiceWorkerModule} from "@angular/service-worker";
import {NZ_I18N, zh_CN} from "ng-zorro-antd/i18n";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzSkeletonModule} from "ng-zorro-antd/skeleton";
import {ChatHistoryComponent} from "./pages/chat-history/chat-history.component";
import {ChatModule} from "./pages/chat.module";
import {AccountLabelComponent} from "./pages/accounts/account-label/account-label.component";
import {SignInPageComponent} from "./pages/accounts/sign-in-page/sign-in-page.component";
import {TokenInterceptorService} from "./roots";
import {
  backChatHistorySubject,
  chatSessionSubject,
  configurationChangeSubject, lastSessionToken, sizeReportToken,
  systemPromptChangeSubject
} from "./injection_tokens";
import {Subject} from "rxjs";
import {ChatHistoryTitle, Configuration, LastSessionModel} from "./models";
import {ConfigurationResolver} from "./services/db-services";
import {SystemPromptResolver} from "./services/db-services/system-prompt-resolver.service";
import {DynamicConfigService, SizeReportService, ThemeSwitcherService} from "./services/normal-services";
import {historyChangeSubject, loginSubject} from "./injection_tokens/subject.data";
import {ProdTranslateHttpLoader} from "./services/handlers";
registerLocaleData(zh);
export function HttpLoaderFactory(http: HttpClient) {
  return new ProdTranslateHttpLoader(http);
}
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    MarkdownModule.forRoot({
      clipboardOptions: {
        provide: CLIPBOARD_OPTIONS,
        useValue: {
          buttonComponent: ClipboardButtonComponent,
        },
      },
      sanitize: SecurityContext.HTML,
    }),
    TranslateModule.forRoot({
      defaultLanguage: 'zh',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BrowserModule, IonicModule.forRoot(), AppRoutingModule,
    FormsModule,
    ChatModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),

      registrationStrategy: 'registerWhenStable:30000'
    }),
  //   app
    NzButtonModule,
    NzIconModule,
    ChatHistoryComponent,
    AccountLabelComponent,
    NzSkeletonModule,
    RouterOutlet,
    TranslateModule,
    SignInPageComponent,
    HttpClientModule,
    IonicModule,
  //   app

  ],
  providers: [
    // base
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: NZ_I18N, useValue: zh_CN },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    {
      provide: configurationChangeSubject, useValue: new Subject<Configuration>()
    },
    ConfigurationResolver,
    SystemPromptResolver,
    ThemeSwitcherService,
    DynamicConfigService,
    SizeReportService,
    {
      provide: chatSessionSubject,useValue: new Subject<number>(),
    },
    {
      provide: backChatHistorySubject, useValue: new Subject<ChatHistoryTitle>()
    },
    {
      provide: systemPromptChangeSubject, useValue: new Subject<boolean>()
    },
    {
      provide: loginSubject, useValue: new Subject<boolean>()
    },
    {
      provide: historyChangeSubject, useValue: new Subject<boolean>()
    },
    {
      provide: sizeReportToken, useValue: new SizeReportService(),
    },
    {
      provide: lastSessionToken, useValue: new LastSessionModel(),
    },

  ],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule {}
