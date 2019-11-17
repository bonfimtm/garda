import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

declare var FB: any;

enum ConnectionStatus {
  Unknown = 0,
  Disconnected = 1,
  Connected = 2,
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  connectionStatus = ConnectionStatus.Unknown;

  meQuery = 'me';
  me = null;

  feedQuery = 'me/feed?fields=message,picture,full_picture&limit=9';
  feed = [];

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.poolFB();
  }

  poolFB() {
    if (typeof FB !== 'undefined') {
      // Load data
      this.loadMe();
      this.loadFeed();
    } else {
      // Try again in 100 ms
      setTimeout(_ => {
        this.poolFB();
      }, 100);
    }
  }

  login() {
    FB.login((response: any) => {
      if (response.authResponse) {
        this.loadMe();
        this.loadFeed();
      } else {
        alert('You cancelled login or did not fully authorize.');
      }
    });
  }

  loadMe() {
    FB.getLoginStatus((loginStatusResponse: any) => {
      if (loginStatusResponse.status === 'connected') {
        this.connectionStatus = ConnectionStatus.Connected;
        FB.api(this.meQuery, (meResponse: any) => {
          console.log('I am', meResponse);
          this.me = meResponse;
          this.changeDetectorRef.detectChanges();
        });
      } else {
        this.connectionStatus = ConnectionStatus.Disconnected;
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  loadFeed() {
    console.log('Loading user feed...');
    FB.getLoginStatus((loginStatusResponse: any) => {
      console.log('status:', loginStatusResponse.status);
      if (loginStatusResponse.status === 'connected') {
        FB.api(this.feedQuery, {}, (apiResponse: any) => {
          console.log(apiResponse);
          this.feed = apiResponse.data;
          this.changeDetectorRef.detectChanges();
        });
      }
    });
  }

}
