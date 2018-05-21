import {Component, NgZone} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ParseService} from '../../../services/parse.service';

@Component({
    selector: 'app-page-dashboard',
    templateUrl: './page.dashboard.pug'
})

export class PageDashboard {
    AnswerModel = this.parseService.Object.extend('Answer');
    PlaceModel = this.parseService.Object.extend('Place');
    StaffModel = this.parseService.Object.extend('Staff');
    statisticForm: any;
    total = 0;
    statistic: any;
    results: any;
    places: any;
    staffList: any;

    constructor(private parseService: ParseService, private formBuilder: FormBuilder, private _ngZone: NgZone) {
        this.statisticForm = this.formBuilder.group({
            dateFrom: [],
            dateTo: [],
            place: [''],
            staff: ['']
        });

        new this.parseService.Parse.Query(this.PlaceModel).find().then(data => {
            this.places = data.map(item => item.toJSON());
        });

        new this.parseService.Parse.Query(this.StaffModel).find().then(data => {
            this.staffList = data.map(item => item.toJSON());
        });
    }

    getStatistic() {
        const options = this.statisticForm.value,
            dateFrom = options.dateFrom,
            dateTo = options.dateTo;

        dateFrom.setHours(0, 0, 0, 0);
        dateTo.setDate(dateTo.getDate() + 1);

        const query = new this.parseService.Parse.Query(this.AnswerModel);
        query.greaterThanOrEqualTo('createdAt', dateFrom);
        query.lessThan('createdAt', dateTo);
        if (options.place) {
            query.equalTo('place', new this.PlaceModel({objectId: options.place}));
        }
        if (options.staff) {
            query.equalTo('staff', new this.StaffModel({objectId: options.staff}));
        }
        query.limit(1000);
        query.find({
            success: data => {
                const result = {};
                this.total = data.length;
                data.forEach(answer => {
                    // console.log(answer);
                    answer.get('result').forEach(question => {
                        // console.log(question.question, question.result);
                        if (question.question) {
                            const id = question.question.objectId;
                            if (!result[id]) {
                                result[id] = question.question;
                                result[id].result = [];
                                result[id].total = 0;
                            }
                            result[id].total++;
                            if (question.question.type === 0) {
                                if (result[id].answers.indexOf(question.result) >= 0) {
                                    result[id].result[result[id].answers.indexOf(question.result)]++;
                                } else {
                                    result[id].answers.push(question.result);
                                    result[id].result.push(1);
                                }
                            } else {
                                if (!result[id].result[question.result]) {
                                    result[id].result[question.result] = 1;
                                } else {
                                    result[id].result[question.result]++;
                                }
                            }
                        }
                    });
                });
                console.log(result);
                this.statistic = result;
                this.results = Object.keys(result);
            }
        });
    }
}
