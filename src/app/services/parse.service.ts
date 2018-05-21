import {Injectable} from '@angular/core';

import {environment} from '../../environments/environment';
import * as parse from 'parse';

parse.initialize(environment.ParseAppID);
parse.serverURL = environment.ParseServerUrl;

@Injectable()
export class ParseService {
    public Parse = parse;
    public User = parse.User;
    public Role = parse.Role;
    public Object = parse.Object;

    public bannerQuery = new this.Parse.Query('Banner');

    constructor() {

    }

    login(options) {
        return this.Parse.User.logIn(options.username, options.password).then(data => {
            console.log(data);
            return data;
        }).catch((error) => {
            return error;
        });
    }
}
