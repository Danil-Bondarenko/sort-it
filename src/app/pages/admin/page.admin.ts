import {Component} from '@angular/core';
import {ParseService} from "../../services/parse.service";
import {Router} from '@angular/router';

@Component({
    selector: 'app-page-admin',
    templateUrl: './page.admin.pug'
})

export class PageAdmin {
    user = this.parseService.User.current();

    constructor(private parseService: ParseService, private router: Router) {

    }

    logout() {
        this.parseService.Parse.User.logOut().then(() => {
            this.router.navigate(['/']);
        });
    }
}
