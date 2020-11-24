import "signals";
import * as History from 'history';
import hasher = require("hasher");
import crossroads = require("crossroads");
import { environment as globals } from './environment';


// This module configures crossroads.js, a routing library. If you prefer, you
// can use any other routing library (or none at all) as Knockout is designed to
// compose cleanly with external libraries.
//
// You *don't* have to follow the pattern established here (each route entry
// specifies a 'page', which is a Knockout component) - there's nothing built into
// Knockout that requires or even knows about this technique. It's just one of
// many possible ways of setting up client-side routes.
export class Router {
    public currentRoute = ko.observable<Route>({});
    private clickEventListener: EventListener;
    private disposeHistory: () => void;
    private parseHash: (newHash: string, oldHash: string) => void;

    constructor(routes: Route[], basename: string, private history: History.History) {
        // Reset and configure Crossroads so it matches routes and updates this.currentRoute
        crossroads.removeAllRoutes();
        crossroads.resetState();
        (crossroads as any).normalizeFn = crossroads.NORM_AS_OBJECT;
        routes.forEach(route => {
            crossroads.addRoute(route.url, (requestParams: any) => {
                this.currentRoute(ko.utils.extend(requestParams, route.params));
            }).matched.add(function (r: Route) {
                document.title = [r.title, r.id].join(" ");
                $('.modal-backdrop').each(function () {
                    $(this).remove();
                });
                });
        });
        
        
        if (globals.navMode === "hasher") {
            this.parseHash = function (newHash: string, oldHash: string) {
                crossroads.parse(newHash);
            }
            hasher.initialized.add(this.parseHash); //parse initial hash
            hasher.changed.add(this.parseHash); //parse hash changes
            hasher.init(); //start listening for history change
        }
        else {
            this.parseHash = function (newHash: string, oldHash: string) {};
        }
        this.disposeHistory = function () { };
        if (globals.navMode === "history") {
            this.disposeHistory = history.listen(location => crossroads.parse(location.pathname));
        }

        this.clickEventListener = evt => {
            let target: any = evt.currentTarget;
            if (target && target.tagName === 'A') {
                let href = target.getAttribute('href');
                if (href && href.indexOf(basename + '/') === 0) {
                    const hrefAfterBasename = href.substring(basename.length);
                    if (globals.navMode==="history" && hrefAfterBasename != history.location.pathname) {
                        history.push(hrefAfterBasename);
                        //document.title = [this.currentRoute().title, this.currentRoute().id].join(' ');
                    }
                    evt.preventDefault();
                }
            }
        };
        $(document).on('click', 'a', this.clickEventListener);
        //add target _blank to fully qualified urls to open in new window
        $("body").on("click", "a",
            function (e) {
                var urlPath = $(this).attr("href")||"";
                if (urlPath.slice(0, 1) === "#") {
                    return true;
                }
                else if ($(this).attr("target")) {
                    return true;
                }
                else if (urlPath.slice(0, 7).toLowerCase() === "http://" || urlPath.slice(0, 8).toLowerCase() === "https://" || urlPath.slice(0, 5).toLowerCase() === "blob:") {
                    if ($(this).attr("target")) {
                        return true;
                    }
                    else {
                        $(this).attr("target", "_blank");
                        return true;
                    }
                }
                e.preventDefault();
                return true;
            });

        if (globals.navMode === "history") {
            crossroads.parse(history.location.pathname);
        }

    }
    public link(url: string): string {
        return this.history.createHref({ pathname: url });
    }

    public dispose() {
        this.disposeHistory();
        $(document).off('click', 'a');
    }
}

export interface Route {
    url?: string;
    title?: any;
    id?: any;
    params?: any;
}
