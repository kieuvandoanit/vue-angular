import { Component } from '@angular/core';
import '../../dxf_viewer_module/dist/js/index.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public name = {
    device: 1,
    group: "group id"
  };

  public msg = "Xin chao ban";

  public saveDevice(data: any){
    console.log(data?.detail[0])
  }

}
