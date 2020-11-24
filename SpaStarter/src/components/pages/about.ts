import 'isomorphic-fetch';
import { environment as globals } from '../../environment';

interface Forcast {
    date: string;
    summary: string;
    temperatureC: number;
    temperatureF: number;
}

class AboutViewModel {
    public message = ko.observable("");
    public swagger = ko.observable("");
    constructor(params: any) {
        let vid: HTMLVideoElement = document.getElementById("myVideo") as HTMLVideoElement;
        vid.playbackRate = 0.5;
        this.swagger(globals.swaggerUrl);
        var fetchstring = globals.apiUrl + "weatherforecast";

        fetch(fetchstring).then(response => {
            if (response.status === 200) {
                return response.json() as Promise<Forcast[]>;
            } else {
                throw new Error("bad doggy");
            }
        }).then(data => {
            this.message(data[0].summary);
        }).catch(error => {
            toastr["error"](error);
        });
    }

}

export default { viewModel: AboutViewModel, template: require('./about.html') };