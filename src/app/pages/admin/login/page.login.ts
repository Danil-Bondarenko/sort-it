import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ParseService} from '../../../services/parse.service';

@Component({
    selector: 'app-page-login',
    templateUrl: './page.login.pug'
})

export class PageLogin {
    loginForm: FormGroup;

    constructor(private parseService: ParseService, private formBuilder: FormBuilder, private router: Router) {
        this.loginForm = this.formBuilder.group({
            username: [, [Validators.required]],
            password: [, [Validators.required]]
        });
    }

    loginSubmit() {
        this.parseService.login(this.loginForm.value).then(data => {
            if (!data.code) {
                this.router.navigate(['/admin']);
            }
        });
    }
}
