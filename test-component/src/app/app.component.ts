import { Component } from '@angular/core';
import '../../dxf_viewer_module/dist/js/index.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public msg = "Xin chao ban";

  public functiona(data: any){
    console.log("Bat emit success!")
    console.log(data);
  }

}
