import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
// import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Ng2Webstorage} from 'ngx-webstorage';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
// Carousel
import {SlideshowModule} from 'ng-simple-slideshow';
// MATERIAL
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatTableModule} from '@angular/material/table';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule, MatNativeDateModule} from '@angular/material';

import {AppRoutesModule} from './routes.module';
import {ParseService} from './services/parse.service';
import {AppComponent} from './components/app.component';

import {PageAdmin} from './pages/admin/page.admin';
import {PageLogin} from './pages/admin/login/page.login';
import {PageDashboard} from './pages/admin/dashboard/page.dashboard';
import {PageAds} from './pages/admin/ads/page.ads';
import {PageStaff} from './pages/admin/staff/page.staff';
import {PagePlaces} from './pages/admin/places/page.places';
import {PageSchedule} from './pages/admin/schedule/page.schedule';
import {PagePolls} from './pages/admin/polls/page.polls';
import {PageMain} from './pages/main/page.main';
import {PagePlaceDialog} from './components/place-dialog/page.place-dialog';
import {PageMainResolve} from './services/page.main.resolve.service';


@NgModule({
    declarations: [
        AppComponent,
        // COMPONENTS:

        // PAGES:
        PageAdmin,
        PageLogin,
        PageDashboard,
        PageAds,
        PageStaff,
        PagePlaces,
        PageSchedule,
        PagePolls,
        PageMain,
        PagePlaceDialog
    ],
    imports: [
        BrowserModule,
        // BrowserAnimationsModule,
        NoopAnimationsModule,
        Ng2Webstorage,
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutesModule,
        // MATERIAL
        MatInputModule,
        MatFormFieldModule,
        MatCardModule,
        MatButtonModule,
        MatToolbarModule,
        MatMenuModule,
        MatIconModule,
        MatListModule,
        MatTableModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDialogModule,
        // Carousel
        SlideshowModule
    ],
    entryComponents: [PagePlaceDialog],
    providers: [
        ParseService,
        PageMainResolve
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule {
}
