import {Component, Input} from '@angular/core';
import {NzSpinModule} from "ng-zorro-antd/spin";
import {FormsModule} from "@angular/forms";
import {NzInputModule} from "ng-zorro-antd/input";
import {NgIf} from "@angular/common";
import {ChatModel} from "../../../models";

@Component({
  selector: 'app-model-editor',
  templateUrl: './model-editor.component.html',
  styleUrl: './model-editor.component.css',
  imports: [
    NzSpinModule,
    FormsModule,
    NzInputModule,
  ],
  standalone: true
})
export class ModelEditorComponent{
  @Input()
  chatModel: ChatModel | undefined;
}
