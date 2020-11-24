import 'knockout.validation';
import { environment as globals } from '../../environment';

class ContactViewModel {
    public name = ko.observable("");
    public email = ko.observable("");
    public subject = ko.observable("");
    public message = ko.observable("");
    private Errors = ko.validation.group(this);

    constructor() {
        var self = this;
        self.name.extend({ required: true });
        self.email.extend({ required: true, email: true });
        self.subject.extend({ required: true });
        self.message.extend({ required: true });
    }
    public Clear() {
        var self = this;
        self.name("");
        self.email("");
        self.subject("");
        self.message("");
        self.Errors.showAllMessages(false);
    }
    public SendContactRequest () {
        var self = this;
        if (self.Errors().length > 0) {
            self.Errors.showAllMessages(true);
            return false;
        }

        //setup return values
        let returndata = {
            name: self.name(),
            email: self.email(),
            subject: self.subject(),
            message: self.message()
        }

        fetch(globals.apiUrl + "api/Contact/Us", {
            method: "POST",
            body: JSON.stringify(returndata),
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        }).then(function (response) {
            // response.status     //=> number 100–599
            // response.statusText //=> String
            // response.headers    //=> Headers
            // response.url        //=> String
            self.Clear();
            if (response.status !== 200) {
                throw ("bad");
            }
            toastr["success"]("Thank you for contacting iTech Northwest. We will get back to you as soon as possible.");

            return response.text()
        }).catch(error => {
            toastr["error"]("Mail services are currently down. Please Contact us another way, thank you.");
        });
        return true;
    }

}

export default { viewModel: ContactViewModel, template: require('./contact.html') };