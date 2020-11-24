import { Route, Router } from '../../router';
import { environment as globals } from '../../environment';


interface NavbarMenuParams {
    router: Router;
}

class NavBarViewModel {
    public router: Router;
    public route: KnockoutObservable<Route>;
    public homeLink = ko.observable("");
    public contactLink = ko.observable("");
    public aboutLink = ko.observable("");
    public skillsLink = ko.observable("");
    public developmentLink = ko.observable("");
    public consultingLink = ko.observable("");
    public worksLink = ko.observable("");

    constructor(params: NavbarMenuParams) {
        this.router = params.router;
        this.route = this.router.currentRoute;
        let prefix = "";
        if (globals.navMode === "hasher") {
            prefix = "#";
        }

        this.homeLink(prefix + "/");
        this.contactLink(prefix + "/contact");
        this.aboutLink(prefix + "/about");
        this.developmentLink(prefix + "/development");
        this.consultingLink(prefix + "/consulting");
        this.worksLink(prefix + "/works");

    }
}

export default { viewModel: NavBarViewModel, template: require('./navbar.html') };