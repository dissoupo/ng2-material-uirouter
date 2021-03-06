import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  NgModule,
  Injectable,
  ApplicationRef,
  Component,
  OnInit
} from '@angular/core';
import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer
} from '@angularclass/hmr';
import {
  MaterialModule,
  MdIconModule,
  MdIconRegistry,
} from '@angular/material';
import {
  trace,
  Category,
  UIRouterModule,
  UIView,
  UIRouter
} from 'ui-router-ng2';
import {
  PerfectScrollbarModule,
  PerfectScrollbarConfigInterface
} from 'angular2-perfect-scrollbar';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { UIROUTER_STATES } from './app.routes';
// App is our top level component
import { AppState, InternalStateType } from './app.service';
import { AppMainPageComponent } from './app-main-page';
import { HomeComponent } from './app-main-page/views/home';
import { AboutComponent } from './app-main-page/views/about';
import { AppNavigationComponent } from './app-main-page/navigation';
import { AppToolbarComponent } from './app-main-page/toolbar';
import { AppQuickPanelComponent } from './app-main-page/quick-panel';
import { AuthPageComponent, SigninComponent, SignupComponent } from './auth-page';
import { AppComponent } from './app.component';
import { KsNgComponentsModule } from '../../../components/ng';

import '../styles/styles.scss';
import '../styles/headings.scss';

// Application wide providers
const APP_PROVIDERS = [
  AppState,
  MdIconRegistry
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

// Enables tracing (check the console) of:
// - TRANSITION transition start, redirect, success, error, ignored
// - VIEWCONFIG ui-view component creation/destruction and viewconfig de/activation
// trace.enable(Category.TRANSITION, /*Category.HOOK, Category.UIVIEW,*/ Category.VIEWCONFIG);

/**
 * Create your own configuration class (if necessary) for any root/feature/lazy module.
 *
 * Pass it to the UIRouterModule.forRoot/forChild factory methods as `configClass`.
 *
 * The class will be added to the Injector and instantiate when the module loads.
 */
/*
@Injectable()
export class MyRootUIRouterConfig {
  constructor(uiRouter: UIRouter) {
    if ('production' === ENV) {
      // Production

    } else {
      // Show the ui-router visualizer
      var vis = require('ui-router-visualizer');
      vis.visualizer(uiRouter);
    }
  }
}
*/

const PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    AppComponent,
    AppMainPageComponent,
    AppToolbarComponent,
    AppNavigationComponent,
    AppQuickPanelComponent,
    AboutComponent,
    HomeComponent,
    AuthPageComponent,
    SigninComponent,
    SignupComponent
  ],
  imports: [
    // import Angular's modules
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    FlexLayoutModule.forRoot(),
    // Material
    MdIconModule,
    MaterialModule.forRoot(),
    // 3rd parties
    PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG),
    UIRouterModule.forRoot({
      states: UIROUTER_STATES,
      useHash: true,
      otherwise: { state: 'app.home', params: {} },
//      configClass: MyRootUIRouterConfig
    }),
    // Ekspand modules
    KsNgComponentsModule
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS,
  ]
})
export class AppModule {

  constructor(
    public appRef: ApplicationRef,
    public appState: AppState,
    public uiRouter: UIRouter,
    public mdIconRegistry: MdIconRegistry,
    public sanitizer: DomSanitizer
  ) {

    mdIconRegistry
      .addSvgIcon('brand', sanitizer.bypassSecurityTrustResourceUrl('/assets/img/logos/ekspand.svg'))
      .addSvgIconSetInNamespace('action', sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/sets/svg-sprite-action.svg'))
      .addSvgIconSetInNamespace('communication', sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/sets/svg-sprite-communication.svg'))
      .addSvgIconSetInNamespace('navigation', sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/sets/svg-sprite-navigation.svg'))
      .addSvgIconSetInNamespace('social', sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/sets/svg-sprite-social.svg'))
      .addSvgIconSetInNamespace('toggle', sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/sets/svg-sprite-toggle.svg'))
      .addSvgIconSetInNamespace('content', sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/sets/svg-sprite-content.svg'))
      .addSvgIconSetInNamespace('file', sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/sets/svg-sprite-file.svg'))
      .addSvgIconSetInNamespace('image', sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/sets/svg-sprite-image.svg'));

    console.log('AppModule');
  }

  public hmrOnInit(store: StoreType) {
    if (!store || !store.state) {
      return;
    }
    console.log('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  public hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map((cmp) => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues  = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  public hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
