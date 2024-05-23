import {Injectable} from "@angular/core";
import {ChatModel, Configuration, Message, SystemRole} from "../../models";
import {ShowType} from "../../models/enumerates";
import {ChatContext, SystemContext} from "../normal-services";

@Injectable()
export class ChatContextHandler{
  handler(back: number | undefined,
          configuration: Configuration,
          chatModels: ChatModel[],
          endPointer: number | undefined): Message[]{
    let sessionLength = configuration?.chatConfiguration.historySessionLength!;
    let messages: Message[] = [];
    const originalArray = [...chatModels]; // 创建 chatModels 的副本
    const reversedArray = originalArray.reverse();
    for (let chatModel of reversedArray) {
      if (messages.length >= sessionLength) break;
      if(endPointer!==undefined && chatModel.dataId!>endPointer!){
        // 如果传递了 结束指针，就跳过结束指针之后的聊天模型对象
        continue;
      }
      if (chatModel.dataId! >= back!) {
        let content = chatModel.content;
        if(chatModel.fileList===undefined||chatModel.fileList.length===0){

        }else{
          for (let file of chatModel.fileList!){
            content += `\n filename: ${file.fileName} \n parsed file content: ${file.parsedContent}\n`
              ;
          }
        }
        // 添加promiseChat是为了容错，避免没有及时的转为静态类型
        messages.splice(0, 0, {
          role: chatModel.role,
          content: content
          //chatModel.content
        })
      }
    }
    return messages;
  }

  handlerBefore(chatContext: ChatContext,
                chatModels: ChatModel[],
                messages: Message[]) {
    let systemMs = chatContext.systems!;
    let ignores: SystemContext[] = systemMs;
    if(chatContext.pointer!==undefined){
      ignores = systemMs.filter(ms=>ms.id < chatContext.pointer! && ms.in);
    }
    for (let ms of ignores){
      let chatModel = chatModels.find(m=>m.dataId===ms.id);
      if(chatModel!==undefined){
        messages.splice(0,0,
          {
            role: SystemRole,
            content: chatModel.content,
          }
        );
      }
    }
  }
}
