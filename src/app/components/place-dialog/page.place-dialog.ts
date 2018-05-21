import {Component} from '@angular/core';
import {ParseService} from '../../services/parse.service';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-page-place-dialog',
    templateUrl: './page.place-dialog.pug'
})

export class PagePlaceDialog {

    PlaceModel = this.parseService.Object.extend('Place');
    selectedPlace: any;
    places: any;

    constructor(private matDialogRef: MatDialogRef<PagePlaceDialog>, private parseService: ParseService, private router: Router) {
        new this.parseService.Parse.Query(this.PlaceModel).find().then(data => {
            // this.places = data.map(item => item.toJSON());
            this.places = data;
            this.selectedPlace = this.places[0];
        });
    }

    choose(): void {
        this.matDialogRef.close(this.selectedPlace);
    }
}
