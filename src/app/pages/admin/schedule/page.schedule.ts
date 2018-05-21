import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {ParseService} from '../../../services/parse.service';

import * as moment from 'moment';

@Component({
    selector: 'app-page-schedule',
    styleUrls: ['./styles.scss'],
    templateUrl: './page.schedule.pug'
})

export class PageSchedule {
    StaffModel = this.parseService.Object.extend('Staff');
    PlaceModel = this.parseService.Object.extend('Place');
    ScheduleModel = this.parseService.Object.extend('Schedule');
    scheduleList = [];
    places = [];
    staffList = [];
    monthArray = [];
    place: any;

    constructor(private parseService: ParseService, private formBuilder: FormBuilder) {
        const arr = [];
        for (let i = 0; i < moment().weekday() - 1; i++) {
            arr.push({});
        }
        for (let i = 0; i < 32; i++) {
            arr.push({date: moment().hour(0).minute(0).add(i, 'd').format()});
        }
        this.monthArray = arr;
        new this.parseService.Parse.Query(this.PlaceModel).find().then(data => {
            this.places = data.map(item => item.toJSON());
        });
    }

    init(id) {
        const place = new this.PlaceModel({objectId: id});
        new this.parseService.Parse.Query(this.ScheduleModel).include('staff').ascending('date').equalTo('place', place).find().then(data => {
            this.scheduleList = data.map(item => item.toJSON());
        });
    }

    selectedStaff(day) {
        const staff = this.scheduleList.filter(schedule => {
            // console.log(schedule.staff.name, new Date(schedule.date.iso).getUTCDate(), new Date(day.date).getUTCDate());
            // return false;
            // console.log(moment(schedule.date).date(), new Date(day.date).getUTCDate());
            return new Date(schedule.date.iso).getUTCDate() === new Date(day.date).getUTCDate() && new Date(schedule.date.iso).getMonth() === new Date(day.date).getMonth();
        })[0];
        return staff ? staff.staff.objectId : null;
    }

    updateSchedule(e, day) {
        const staff = new this.StaffModel({objectId: e.value});
        const options = {
            date: new Date(day.date),
            staff: staff,
            place: new this.PlaceModel({objectId: this.place})
        };
        if (this.selectedStaff(day)) {
            console.log('exist', options);
        } else {
            new this.ScheduleModel(options).save().then(() => {
                this.init(this.place);
            });
        }

    }

    selectPlace(e) {
        const place = new this.PlaceModel({objectId: e.value});
        this.place = e.value;
        new this.parseService.Parse.Query(this.StaffModel).equalTo('place', place).find().then(data => {
            this.staffList = data.map(item => item.toJSON());
            this.init(e.value);
        });
    }
}
