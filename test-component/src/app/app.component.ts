import { Component } from '@angular/core';
import '../../dxf_viewer_module/dist/js/index.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public msg = 'Xin chao ban';

  public addGroup(data: any) {
    console.log('new group contains: ', data.detail[0]);
  }

  public addDevice(data: any) {
    console.log('new devices contains: ', data.detail[0]);
  }
}
