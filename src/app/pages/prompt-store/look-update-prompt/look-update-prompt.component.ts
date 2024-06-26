import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";
import {TranslateModule} from "@ngx-translate/core";
import {SystemPromptService} from "../../../services/db-services/system-prompt.service";
import {SystemPromptItem} from "../../../models";

@Component({
  selector: 'app-look-update-prompt',
  templateUrl: './look-update-prompt.component.html',
  styleUrl: './look-update-prompt.component.css',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    TranslateModule
  ],
  standalone: true
})
export class LookUpdatePromptComponent {
  constructor(private fb: NonNullableFormBuilder,
              private systemPromptService: SystemPromptService,
              private notification: NzNotificationService) {

  }
  @Output()
    // eslint-disable-next-line @angular-eslint/no-output-native
  close = new EventEmitter<boolean>();
  _prompt: SystemPromptItem | undefined;
  @Input()
  set prompt(prompt: SystemPromptItem | undefined){
    if(prompt===undefined){
      this.close.emit(true);
    }
    this._prompt = prompt;
    this.validateForm.setValue({
      title: prompt?.title!,
      content: prompt?.content!
    });
  }
  validateForm: FormGroup<{
    title: FormControl<string>;
    content: FormControl<string>;
  }> = this.fb.group({
    title: ['',[Validators.required,Validators.minLength(1)]],
    content: ['',[Validators.required, Validators.minLength(2)]]
  });
  submitForm(){
    if(this.validateForm.valid){
      let value = this.validateForm.value;
      this._prompt!.title = value.title;
      this._prompt!.content = value.content!;
      this.notification.success("验证成功","");
      this.systemPromptService.addOrPutPrompts({
        id: this._prompt?.id,
        title: value.title,
        content: value.content!
      }).then(()=>{
        this.close.emit(true);
      })
      this.validateForm.reset();
    }
  }
}
