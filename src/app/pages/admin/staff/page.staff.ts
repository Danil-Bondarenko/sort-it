import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {ParseService} from '../../../services/parse.service';

@Component({
    selector: 'app-page-staff',
    templateUrl: './page.staff.pug'
})

export class PageStaff {
    StaffModel = this.parseService.Object.extend('Staff');
    PlaceModel = this.parseService.Object.extend('Place');
    staffList: any = [];
    places = [];
    staffForm: FormGroup;
    displayedColumns = ['objectId', 'name', 'lastName', 'phone', 'place', 'action'];

    constructor(private parseService: ParseService, private formBuilder: FormBuilder) {
        this.staffForm = this.formBuilder.group({
            name: [],
            lastName: [],
            phone: [],
            place: []
        });

        new this.parseService.Parse.Query(this.PlaceModel).find().then(data => {
            this.places = data.map(item => item.toJSON());
            this.init();
        });
    }

    init() {
        const staffQuery = new this.parseService.Parse.Query(this.StaffModel);
        staffQuery.include('place');
        staffQuery.find().then(data => {
            this.staffList = data.map((item, i) => {
                item.get('place').query().find().then(places => {
                    this.staffList[i].place = places.map(place => place.toJSON());
                });
                return item.toJSON();
            });
            // console.log(this.staffList);
        });
    }

    delete(id) {
        const item = new this.StaffModel({objectId: id});
        item.destroy().then(() => {
            this.init();
        });
    }

    submit() {
        const options = this.staffForm.value,
            places = options.place;

        delete options.place;

        const staff = new this.StaffModel(options);
        const relation = staff.relation('place');

        places.map(place => {
            relation.add(new this.PlaceModel({objectId: place}));
        });

        staff.save().then(() => {
            this.staffForm.reset();
            this.init();
        });
    }
}
