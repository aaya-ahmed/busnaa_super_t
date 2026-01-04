import { Pipe, PipeTransform, Injector } from "@angular/core";
import { CustomdatePipe } from "./customdate.pipe";
import { NotnanPipe } from "./notnan.pipe";
import { pipeName } from "../model/pipeNames";

const pipeMap: { [key: string]: any } = {
  'CustomdatePipe':CustomdatePipe ,
  'NotnanPipe': NotnanPipe,
};
@Pipe({
  name: 'dynamicSwitchPipe',
})

export class DynamicSwitchPipe implements PipeTransform {
  constructor(private injector: Injector) {}
  transform(value: any, pipeName?: pipeName, ...args: any[]): any {
    if (!pipeName) {
      return value;
    }
    try {
      const pipeClass = pipeMap[pipeName];
      if (pipeClass) {
        const pipe = this.injector.get(pipeClass) as PipeTransform;
        return pipe.transform(value, ...args);
      }
      return value;
    } catch (error) {
      return value;
    }
  }
}
