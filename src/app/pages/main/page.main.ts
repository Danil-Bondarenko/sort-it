import {Component, OnDestroy} from '@angular/core';
import {ParseService} from '../../services/parse.service';
import {ActivatedRoute
} from '@angular/router';

@Component({
    selector: 'app-page-main',
    templateUrl: './page.main.pug',
    styleUrls: ['./page.main.scss']
})

export class PageMain implements OnDestroy {
    ScheduleModel = this.parseService.Object.extend('Schedule');
    BannerModel = this.parseService.Object.extend('Banner');
    QuestionModel = this.parseService.Object.extend('Question');
    AnswerModel = this.parseService.Object.extend('Answer');
    PlaceModel = this.parseService.Object.extend('Place');

    place: any;
    signature: any;

    bannerQuerySubscription = this.parseService.bannerQuery.subscribe();
    quiz = false;
    quizStep = 0;
    answerFreeFrom: string;
    ads: any = [];
    public imageSources = [
        {}
    ];
    questionList: any = [];
    questionSubmit = [];
    timeout: any;

    user = this.parseService.User.current();

    constructor(private parseService: ParseService, private route: ActivatedRoute) {
        this.init();
        this.updateQuery();
        this.place = this.route.snapshot.data['place'].toJSON();
        this.signature = this.place.signature;
    }

    ngOnDestroy() {
        this.bannerQuerySubscription.unsubscribe();
    }

    init() {
        new this.parseService.Parse.Query(this.BannerModel).find().then(data => {
            this.imageSources = [this.imageSources[0]];
            data.map(item => {
                this.imageSources.push({url: item.toJSON().image.url});
            });
            this.imageSources.splice(0, 1);
            // this.imageSources = data.map(item=>{
            //     return {url:item.toJSON().image.url};
            // })
        });
    }

    updateQuery() {
        this.bannerQuerySubscription.on('create', () => {
            this.init();
        });
        this.bannerQuerySubscription.on('delete', () => {
            this.init();
        });
    }

    openQuiz() {
        this.quiz = true;
        this.quizStep = 0;
        this.questionSubmit = [];
        this.clearQuiz();
        new this.parseService.Parse.Query(this.QuestionModel).find().then(data => {
            this.questionList = data.map(item => item.toJSON());
            // console.log(this.staffList);
        });
    }

    clearQuiz() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.quiz = false;
            this.quizStep = 0;
            this.questionSubmit = [];
        }, 30000);
    }

    setAnswer(i) {
        this.clearQuiz();
        this.questionSubmit.push({question: this.questionList[this.quizStep], result: i});
        if (this.questionList.length - 1 > this.quizStep) {
            this.answerFreeFrom = '';
            this.quizStep++;
        } else {
            const dateFrom = new Date(),
                dateTo = new Date();

            dateFrom.setHours(0, 0, 0, 0);
            dateTo.setHours(23, 59, 59, 0);
            const staffQuery = new this.parseService.Parse.Query(this.ScheduleModel).include('staff');
            staffQuery.equalTo('place', new this.PlaceModel({objectId: this.place.objectId}));
            staffQuery.greaterThanOrEqualTo('date', dateFrom);
            staffQuery.lessThan('date', dateTo);
            staffQuery.first(data => {
                const staff = data ? data.get('staff') : null;
                new this.AnswerModel({result: this.questionSubmit, place: new this.PlaceModel({objectId: this.place.objectId}), staff: staff}).save();
                clearTimeout(this.timeout);
                this.quiz = false;
            });
        }
    }
}
