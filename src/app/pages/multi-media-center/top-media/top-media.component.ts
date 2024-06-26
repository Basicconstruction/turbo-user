import { Component, OnInit } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {IonicModule} from "@ionic/angular";
import {MenuAbleService} from "../../../services/normal-services/menu-able.service";
import {NzImageService} from "ng-zorro-antd/image";

@Component({
  selector: 'app-top-media',
  templateUrl: './top-media.component.html',
  styleUrls: ['./top-media.component.scss'],
  standalone: true,
  imports: [
    RouterOutlet,
    IonicModule
  ],
  providers: [
    NzImageService
  ]
})
export class TopMediaComponent  implements OnInit {

  constructor(private menuAble: MenuAbleService) {
    this.menuAble.enableMedia()
  }

  ngOnInit() {
    console.log()
  }

}
