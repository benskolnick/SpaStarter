import * as History from 'history';
import { Route, Router } from '../../router';
import notfound from '../errors/notfound';
import navbarmenu from '../navbar/navbar';
import homepage from '../pages/home';
import aboutpage from '../pages/about';
import contactpage from '../pages/contact';
import skillspage from '../pages/skills';
import developmentpage from '../pages/development';
import consultingpage from '../pages/consulting';
import workspage from '../pages/works';

const routes: Route[] = [
    { url: '', params: { page: 'home', title: 'Home' } },
    { url: 'about/:id:', params: { page: 'about', title: 'About Us' } },
    { url: 'skills', params: { page: 'skills', title: 'Our Skills' } },
    { url: 'development', params: { page: 'development', title: 'Custom Development' } },
    { url: 'consulting', params: { page: 'consulting', title: 'Tailored Consulting' } },
    { url: 'works', params: { page: 'works', title: 'Our Works' } },
    { url: 'contact', params: { page: 'contact', title: 'Contact Me' } },
    { url: ':404*:', params: { page: 'notfound', title: '404 Not Found' } }
];

class RootViewModel {
    public route: KnockoutObservable<Route>;
    public router: Router;
    public message = ko.observable("");

    constructor(params: { basename: string, history: History.History }) {
        this.router = new Router(routes, params.basename, params.history);
        this.route = this.router.currentRoute;
        ko.components.register('notfound', notfound);
        ko.components.register('navbar', navbarmenu);
        ko.components.register('home', homepage);
        ko.components.register('about', aboutpage);
        ko.components.register('contact', contactpage);
        ko.components.register('skills', skillspage);
        ko.components.register('development', developmentpage);
        ko.components.register('consulting', consultingpage);
        ko.components.register('works', workspage);
    }

    public dispose() {
        this.router.dispose();
        Object.keys((<any>ko).components.dd).forEach(componentName => {
            ko.components.unregister(componentName);
        });
    }
}

export default { viewModel: RootViewModel, template: require('./root.html') };