import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {ParseService} from '../../../services/parse.service';

@Component({
    selector: 'app-page-ads',
    templateUrl: './page.ads.pug'
})

export class PageAds {
    BannerModel = this.parseService.Object.extend('Banner');
    ads: any = [];
    newAdFile: any;
    adForm: FormGroup;
    displayedColumns = ['objectId', 'title', 'image', 'action'];

    constructor(private parseService: ParseService, private formBuilder: FormBuilder) {
        this.adForm = this.formBuilder.group({
            title: [],
            image: []
        });

        this.init();
    }

    init() {
        new this.parseService.Parse.Query(this.BannerModel).find().then(data => {
            this.ads = data.map(item => item.toJSON());
            console.log(this.ads);
        });
    }

    fileChange(file) {
        this.newAdFile = file.target.files[0];
    }

    delete(id) {
        const item = new this.BannerModel({objectId: id});
        item.destroy().then(() => {
            this.init();
        });
    }

    submit() {
        const options = this.adForm.value, file = new this.parseService.Parse.File(this.newAdFile.name, this.newAdFile);
        file.save((data) => {
            options.image = data;
            new this.BannerModel(options).save().then(() => {
                this.adForm.reset();
                this.init();
            });
        });

    }
}
