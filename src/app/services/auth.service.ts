import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {ParseService} from './parse.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private parseService: ParseService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = this.parseService.Parse.User.current();
        if (currentUser) {
            return true;
        } else {
            this.router.navigate(['/admin-login']);
            return false;
        }
    }
}
