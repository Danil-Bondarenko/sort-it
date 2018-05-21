import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {ParseService} from '../../../services/parse.service';

@Component({
    selector: 'app-page-polls',
    templateUrl: './page.polls.pug'
})

export class PagePolls {
    QuestionModel = this.parseService.Object.extend('Question');
    questionList: any = [];
    pollForm: FormGroup;
    displayedColumns = ['objectId', 'header', 'type', 'body', 'answers', 'action'];

    constructor(private parseService: ParseService, private formBuilder: FormBuilder) {
        this.pollForm = this.formBuilder.group({
            header: [],
            type: [],
            body: [],
            answers: this.formBuilder.array([])
        });

        this.init();
    }

    init() {
        new this.parseService.Parse.Query(this.QuestionModel).find().then(data => {
            this.questionList = data.map(item => item.toJSON());
            // console.log(this.staffList);
        });
    }

    initQuestion() {
        return this.formBuilder.group({
            name: []
        });
    }

    delete(id) {
        const item = new this.QuestionModel({objectId: id});
        item.destroy().then(() => {
            this.init();
        });
    }

    submit() {
        const options = this.pollForm.value;
        // console.log(options);
        new this.QuestionModel(options).save().then(() => {
            this.pollForm.reset();
            this.init();
        });
    }
}
