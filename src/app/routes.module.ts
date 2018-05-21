import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthGuard} from './services/auth.service';

import {PageAdmin} from './pages/admin/page.admin';
import {PageLogin} from './pages/admin/login/page.login';
import {PageDashboard} from './pages/admin/dashboard/page.dashboard';
import {PageAds} from './pages/admin/ads/page.ads';
import {PageStaff} from './pages/admin/staff/page.staff';
import {PagePlaces} from './pages/admin/places/page.places';
import {PageSchedule} from './pages/admin/schedule/page.schedule';
import {PagePolls} from './pages/admin/polls/page.polls';
import {PageMain} from './pages/main/page.main';
import {PageMainResolve} from './services/page.main.resolve.service';

export const appRoutes: Routes = [
    {
        path: 'admin',
        component: PageAdmin,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                component: PageDashboard
            }, {
                path: 'ads',
                component: PageAds
            }, {
                path: 'staff',
                component: PageStaff
            }, {
                path: 'places',
                component: PagePlaces
            }, {
                path: 'schedule',
                component: PageSchedule
            }, {
                path: 'polls',
                component: PagePolls
            }
        ]
    },
    {
        path: 'admin-login',
        component: PageLogin
    },
    {
        path: '',
        component: PageMain,
        children: [],
        resolve: {
            place: PageMainResolve
        }
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    exports: [
        RouterModule,
    ],
    providers: [AuthGuard]
})

export class AppRoutesModule {
}
