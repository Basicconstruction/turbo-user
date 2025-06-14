import {Component, ElementRef, Inject, Renderer2, ViewChild} from '@angular/core';
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Subject} from "rxjs";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzModalModule} from "ng-zorro-antd/modal";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzPopoverModule} from "ng-zorro-antd/popover";
import {NzInputNumberModule} from "ng-zorro-antd/input-number";
import {NzSliderModule} from "ng-zorro-antd/slider";
import {FormsModule} from "@angular/forms";
import {NzInputModule} from "ng-zorro-antd/input";
import {RouterLink} from "@angular/router";
import {NgForOf, NgStyle} from "@angular/common";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzSwitchModule} from "ng-zorro-antd/switch";
import {NzSkeletonModule} from "ng-zorro-antd/skeleton";
import {ConfigExportComponent} from "./config-export/config-export.component";
import {ConfigImportComponent} from "./config-import/config-import.component";
import {NzToolTipModule} from "ng-zorro-antd/tooltip";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {IonicModule} from "@ionic/angular";
import {DynamicConfigService, SizeReportService, ThemeSwitcherService} from "../../services/normal-services";
import {Configuration, DynamicConfig} from "../../models";
import {configurationChangeSubject, sizeReportToken} from "../../injection_tokens";
import {ConfigurationService} from "../../services/db-services";
import { themes } from 'src/app/themes/theme';
import {ModelCenterComponent} from "./model-center/model-center.component";
import {details} from "../../models/enumerates/enum.type";
import {ServiceProvider} from "../../roots";
export const languages: string[] = [
  'zh','en','jp'
];
export const displayLanguages: { value: string, label: string }[] = [
  { value: 'zh', label: '简体中文' },
  { value: 'en', label: 'English' },
  { value: 'jp', label: '日本語' }
];
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  standalone: true,
  imports: [
    NzFormModule, NzModalModule, NzCardModule,
    NzButtonModule, NzIconModule, NzPopoverModule,
    NzInputNumberModule, NzSliderModule, FormsModule,
    NzInputModule, RouterLink, NgStyle,
    NzSelectModule, NzSwitchModule, NzSkeletonModule,
    ConfigExportComponent, ConfigImportComponent, NgForOf,
    NzToolTipModule, TranslateModule, IonicModule, ModelCenterComponent,
  ],
  providers: [
    ThemeSwitcherService,
    DynamicConfigService
  ]
})
export class SettingsComponent {
  dynamicConfig: DynamicConfig | undefined;
  configuration: Configuration;

  constructor(@Inject(sizeReportToken) private sizeReportService: SizeReportService,
              private themeSwitcherService: ThemeSwitcherService,
              private configurationService: ConfigurationService,
              private notification: NzNotificationService,
              @Inject(configurationChangeSubject) private configurationObserver: Subject<Configuration>,
              private renderer: Renderer2,
              private translate: TranslateService,
              private dynamicConfigService: DynamicConfigService,
              private serviceProvider: ServiceProvider
              ) {
    this.configuration = this.configurationService.configuration!;
    this.loadProperties();
    this.configurationObserver.subscribe((configuration) => {
      this.configuration = configuration;
      this.loadProperties();
      console.log("aware change");
      console.log(this.dynamicConfig);
    });

  }
  apiUrl(){
    return this.serviceProvider.apiUrl;
  }
  miniPhone() {
    return this.sizeReportService.miniPhoneView();
  }

  async resetConfiguration() {
    await this.configurationService.restoreConfiguration();
    this.notification
      .create(
        "success",
        '重置成功',
        '参数重置成功'
      );
    this.configurationObserver.next(this.configurationService.configuration!);
  }


  async applyChangeRightNow() {
    await this.configurationService.setConfigurationLocal();
    this.notification
      .create(
        "success",
        '应用成功',
        '保存到本地数据库成功'
      );
  }

  @ViewChild('settingPanel') private settingPanel: ElementRef | undefined;
  inputConfigVisible: boolean = false;
  outputConfigVisible: boolean = false;

  scrollToTop() {
    if (!this.settingPanel) return;
    this.renderer.setProperty(this.settingPanel.nativeElement, 'scrollTop', 0);
  }

  handleInputConfigOk() {
    this.inputConfigVisible = false;
  }

  closeOutput() {
    this.outputConfigVisible = false;
  }

  okAndCloseOutput() {
    this.outputConfigVisible = false;
  }

  handleInputCancel() {
    this.inputConfigVisible = false;
  }

  async handleConfigInput($event: Configuration) {
    this.configurationService.configuration = $event;
    this.configuration = $event;
    await this.configurationService.setConfigurationLocal();
  }

  protected readonly themes = themes;

  themeChange() {
    this.themeSwitcherService.load(this.dynamicConfig!.theme);
    this.dynamicConfigService.setDynamicConfig(this.configuration,this.dynamicConfig!);
  }

  protected readonly languages = languages;

  languageChange($event: string) {
    this.translate.use(this.dynamicConfig!.language!);
    this.dynamicConfig!.languageIsSet = true;
    this.dynamicConfigService.setDynamicConfig(this.configuration,this.dynamicConfig!);
  }

  protected readonly displayLanguages = displayLanguages;
  modelCenterVisible: boolean = false;

  private loadProperties() {
    let configDynamic = this.dynamicConfigService.getDynamicConfig(this.configuration);
    if(configDynamic===undefined){
      this.dynamicConfig = this.dynamicConfigService.getDefaultDynamicConfig();
    }else{
      this.dynamicConfig = configDynamic;
    }
    this.themeChange();
    this.languageChange(this.dynamicConfig.language===undefined?'':this.dynamicConfig.language);
  }

  protected readonly details = details;
}
