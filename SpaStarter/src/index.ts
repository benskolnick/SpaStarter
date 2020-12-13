/// <reference path ="../node_modules/moment/moment.d.ts"/>
/// <reference path ="../node_modules/@types/jquery/jquery.d.ts"/>
/// <reference path ="../node_modules/@types/bootstrap/index.d.ts"/>
/// <reference path ="../node_modules/@types/toastr/index.d.ts"/>

import { environment as globals } from './environment';

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    console.log('We are in development!');
    globals.apiUrl = 'https://localhost:44385/api/';
    globals.swaggerUrl = 'https://localhost:44385/swagger/';
}else if (process.env.NODE_ENV === 'production') {
    console.log('We are in production!');
    globals.apiUrl = '/api/';
}else if (process.env.NODE_ENV === 'staging') {
    console.log('We are in staging!');
}

require("expose-loader?ko!knockout");
import 'knockout.validation';
import RootComponent from './components/root/root';
import { createBrowserHistory } from 'history';

ko.components.register('root', RootComponent);

ko.validation.init({
    messagesOnModified: true,
    insertMessages: true,
    decorateInputElement: true,
    errorElementClass: 'is-invalid',
    errorMessageClass: 'invalid-message'
});

if (globals.navMode === "history") {
    const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href')!;
    const basename = baseUrl.substring(0, baseUrl.length - 1); // History component needs no trailing slash
    ko.applyBindings({ history: createBrowserHistory({ basename }), basename });
}
else {
    const basename = "./";
    ko.applyBindings({ basename });
}

if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => ko.cleanNode(document.body));
}