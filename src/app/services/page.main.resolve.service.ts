import {Injectable} from '@angular/core';
import {
    Router, Resolve,
    ActivatedRouteSnapshot
} from '@angular/router';
import {ParseService} from './parse.service';
import {MatDialog} from '@angular/material';
import {PagePlaceDialog} from '../components/place-dialog/page.place-dialog';


@Injectable()
export class PageMainResolve implements Resolve<any> {
    constructor(private parseService: ParseService, private dialog: MatDialog) {
    }

    resolve(route: ActivatedRouteSnapshot): Promise<any> {
        const dialogRef = this.dialog.open(PagePlaceDialog, {disableClose: true});
        return dialogRef.afterClosed().toPromise().then( (place) => {
            return place;
        });
    }
}
