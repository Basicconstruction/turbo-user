import {Component, Input, OnInit} from '@angular/core';
import {Embedding} from "../../../../models/images";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {IonicModule} from "@ionic/angular";
import {EmbeddingSectionComponent} from "../embedding-section/embedding-section.component";
import {NzModalModule} from "ng-zorro-antd/modal";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-embedding-list',
  templateUrl: './embedding-list.component.html',
  styleUrls: ['./embedding-list.component.scss'],
  standalone: true,
  imports: [
    NzIconDirective,
    IonicModule,
    EmbeddingSectionComponent,
    NzModalModule,
    TranslateModule
  ]
})
export class EmbeddingListComponent  implements OnInit {
  @Input() embeddings: Embedding[] | undefined;
  @Input() nsfw: boolean = false;

  constructor() { }

  ngOnInit() {
    console.log()
  }

  awareDelete($event: number) {
    this.embeddings?.splice($event,1);
  }

  addNewEmbedding() {
    this.embeddings?.push({
      model_name: ''
    })
  }
}
