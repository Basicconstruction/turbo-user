import {Component, DoCheck, HostListener, OnInit} from '@angular/core';
import {MenuAbleService} from "../../../services/normal-services/menu-able.service";
import {IonicModule, MenuController} from "@ionic/angular";
import {NovitaService} from "../../../services/fetch_services/novita.service";
import {Embedding, Lora, NovitaTask, UrlImage} from "../../../models/images";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {FormsModule} from "@angular/forms";
import {NzSliderComponent} from "ng-zorro-antd/slider";
import {NzInputNumberComponent} from "ng-zorro-antd/input-number";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {GalleryComponent} from "../gallery/gallery.component";
import {samplers} from "../../../models/images/fields/samplers";
import {TaskResult} from "../../../models/images";
import {CheckParameter, NovitaInit} from "../toolkits";
import {ModelCenterComponent} from "../../settings/model-center/model-center.component";
import {NzModalContentDirective, NzModalModule} from "ng-zorro-antd/modal";
import {NovitaModelSelectorComponent} from "../../media/novita-model-selector/novita-model-selector.component";
import {ImageModelComponent} from "../toolkits/image-model/image-model.component";
import {EmbeddingListComponent} from "../toolkits/embedding-list/embedding-list.component";
import {LoraListComponent} from "../toolkits/lora-list/lora-list.component";
import {NovitaCheck} from "../../../services/handlers";
import {GenerateTask} from "../../../models/media/generateTask";
import {AuthService} from "../../../auth_module";
import {UniversalService} from "../../../services/db-services/universal.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";
import {TranslateModule} from "@ngx-translate/core";
import {NzSwitchComponent} from "ng-zorro-antd/switch";

@Component({
  selector: 'app-novita-text2-img',
  templateUrl: './novita-text2-img.component.html',
  styleUrls: ['./novita-text2-img.component.scss'],
  standalone: true,
  imports: [
    NzRowDirective,
    NzColDirective,
    IonicModule,
    FormsModule,
    NzSliderComponent,
    NzInputNumberComponent,
    NzIconDirective,
    NzButtonComponent,
    GalleryComponent,
    ModelCenterComponent,
    NovitaModelSelectorComponent,
    NzModalContentDirective,
    ImageModelComponent,
    EmbeddingListComponent,
    LoraListComponent,
    NzTooltipDirective,
    TranslateModule,
    NzSwitchComponent
  ]
})
export class NovitaText2ImgComponent  implements OnInit,DoCheck,
  CheckParameter, NovitaInit{
  images: UrlImage[] | undefined = [];
  image_num: number = 1;
  image_num_old: number = 1;
  width: number = 1024;
  height: number = 800;
  model: string | undefined;
  prompt: string = '';
  negative_prompt: string = '';
  sampler: string = 'DPM++ 2S a Karras';
  samplerChoice: string[];
  guidance_scale: number = 7.5;
  steps: number = 20;
  seeds: number = -1;
  clipSkip: number = 1;
  loras: Lora[] = [];
  embeddings: Embedding[] = [];
  loading: boolean = false;
  nsfw: boolean = false;
  constructor(private menuAbleService: MenuAbleService,
              private menuCtrl: MenuController,
              private novitaService: NovitaService,
              private notification: NzNotificationService,
              private novitaCheck: NovitaCheck,
              private authService: AuthService,
              private universalService: UniversalService
  ) {
    this.menuAbleService.enableImage();
    this.novitaInit();
    this.samplerChoice = samplers;
  }

  novitaInit() {
    this.width = 256;
    this.height = 256;
    this.model = "dreamshaper_8_93211.safetensors";
    this.prompt = "";//Glowing jellyfish floating through a foggy forest at twilight
    this.negative_prompt = "nsfw, bottle,bad face";
    // this.loras.push({model_name: "weight_slider_v2_91681", strength: 1});
    // this.embeddings.push({model_name: "deformityv6-SDXL_267495"});
  }

  ngDoCheck(): void {
    if (this.image_num_old !== this.image_num) {
      this.setSize(this.image_num);
      this.image_num_old = this.image_num;
    }
  }

  setSize(size: number) {
    this.images!.length = 0;
    for (let i = 0; i < size; i++) {
      this.images?.push({image_url: "assets/placeholders/imgHolder.png"});
    }
  }

  ngOnInit() {
    this.setSize(this.image_num);

  }

  showImageMenu() {
    this.menuCtrl.open("image-menu");
  }
  async checkParameter(){
    return new Promise<boolean>((resolve,reject)=>{
      if(this.negative_prompt.indexOf(',')===-1) {
        this.notification.error("negative_prompt是必须的，至少提供一个，并且使用','分隔","");
        resolve(false);
      }
      resolve(true);
    })
  }
  precheck(){
    let res = this.novitaCheck.preCheck(this.loras);
    switch (res){
      case 0:
        break;
      case 1:
        this.notification.info("部分lora模型没有选择,已排除","");
        break;
      case 2:
        this.notification.info("选择的lora模型过多,生成时将会使用前5个使用的lora模型","");
        break;
      case 3:
        this.notification.info("部分lora模型没有选择,已排除.选择的lora模型过多,生成时将会使用前5个使用的lora模型","");
        break;
    }
    let res2 = this.novitaCheck.preCheck(this.embeddings);
    switch (res2){
      case 0:
        break;
      case 1:
        this.notification.info("部分embedding模型没有选择,已排除","");
        break;
      case 2:
        this.notification.info("选择的embedding模型过多,生成时将会使用前5个使用的embedding模型","");
        break;
      case 3:
        this.notification.info("部分embedding模型没有选择,已排除.选择的embedding模型过多,生成时将会使用前5个使用的lora模型","");
        break;
    }
  }
  async generateImages() {
    if(!await this.checkParameter()){
      return;
    }
    this.precheck();
    this.loading = true;
    let novitaTask: NovitaTask | undefined;
    try{
      novitaTask = await this.novitaService.text2({
        request: {
          model_name: this.model,
          prompt: this.prompt,
          negative_prompt: this.negative_prompt,
          sd_vae: "",
          loras: this.novitaCheck.filter(this.loras),
          embeddings: this.novitaCheck.filter(this.embeddings),
          hires_fix: undefined,
          refiner: undefined,
          height: this.height,
          width: this.width,
          image_num: this.image_num,
          steps: this.steps,
          seed: this.seeds,
          clip_skip: this.clipSkip,
          guidance_scale: this.guidance_scale,
          sampler_name: this.sampler
        }
      });
    }catch (error: any){
      this.loading = false;
      this.notification.error("生成图片失败"+error.message,"");
      return;
    }
    if (novitaTask === undefined) {
      this.loading = false;
      this.notification.error("生成图片失败","");
      return;
    }
    if(novitaTask.task_id==="null"){
      this.notification.error("生成视频失败,task_id=null","");
      return;
    }

    let generateTask: GenerateTask = {
      task_id: novitaTask.task_id,
      account_id: this.authService.user!.id,
      date: new Date(),
      task_type: "image"
    };
    this.universalService.addOrUpdateGenerateTask(generateTask).then(t=>{
      this.notification.info("获取到task_id","");
    });

    let taskResult: TaskResult | undefined;
    let first = true;
    let wait = 1000;
    while(taskResult===undefined || taskResult.images==null || taskResult.images.length===0){
      if(!first){
        console.log("wait "+wait+" ms")
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("wait out")
      }
      first = false;
      try{
        taskResult = await this.novitaService.novitaTask(novitaTask!.task_id!);
      }catch (error: any){
        this.loading = false;
        this.notification.info("获取任务结果失败","");
        return;
      }
    }
    generateTask.taskResult = taskResult;
    this.universalService.addOrUpdateGenerateTask(generateTask).then(c=>{
      this.notification.info("存储响应结果","");
    });
    this.images!.length = 0;
    this.loading = false;
    taskResult.images?.forEach(image=>{
      this.images?.push({
        image_url: image.image_url,
        image_url_ttl: image.image_url_ttl.toString(),
        image_type: image.image_type,
      })
    });

  }


  modelChange($event: any) {
    this.model = $event;
  }
}