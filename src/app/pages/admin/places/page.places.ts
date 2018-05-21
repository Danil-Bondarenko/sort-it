import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {ParseService} from '../../../services/parse.service';

@Component({
    selector: 'app-page-places',
    templateUrl: './page.places.pug'
})

export class PagePlaces {
    PlaceModel = this.parseService.Object.extend('Place');
    places: any = [];
    placeForm: FormGroup;
    displayedColumns = ['objectId', 'name', 'address', 'phone', 'signature', 'action'];

    constructor(private parseService: ParseService, private formBuilder: FormBuilder) {
        this.placeForm = this.formBuilder.group({
            name: [],
            address: [],
            phone: [],
            signature: []
        });

        this.init();
    }

    init() {
        new this.parseService.Parse.Query(this.PlaceModel).find().then(data => {
            this.places = data.map(item => item.toJSON());
            console.log(this.places);
        });
    }

    delete(id) {
        const item = new this.PlaceModel({objectId: id});
        item.destroy().then(() => {
            this.init();
        });
    }

    submit() {
        const options = this.placeForm.value;
        new this.PlaceModel(options).save().then(() => {
            this.placeForm.reset();
            this.init();
        });
    }
}
