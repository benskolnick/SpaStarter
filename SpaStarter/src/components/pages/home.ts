﻿class HomeViewModel {
    public message = ko.observable("");
    public messages = ko.observableArray(Array<string>());
    public currentMessageIndex = -1;

    constructor() {
        var self = this;
        self.messages([
            "Complete Software Solutions",
            "Custom .Net Programming",
            "Third-Party API Integration",
            "Professional Skills Training",
            "Full Stack: Database - Restful API - HTML5/Javascript",
            "Single Page Application Development",
            "Symitar Integration and Services",
            "Technology Consulting",
            "Azure Hosting"
        ]);
        self.StartAnimation();
    }

    public StartAnimation() {
        let self = this;
        self.currentMessageIndex++;
        if (self.currentMessageIndex >= self.messages().length) {
            self.currentMessageIndex = 0;
        }
        self.message(self.messages()[self.currentMessageIndex]);

        $("#animated").animate({
            width: [$("#animation-wrapper").width(), "swing"],
            opacity: ["toggle", "swing"]
        }, 3000, "swing", function () {
        }).delay(3000).animate({
            width: [0, "swing"],
            opacity: ["toggle", "swing"]
        }, 3000, "swing", function () {
            self.StartAnimation();
        });
    }
}

export default { viewModel: HomeViewModel, template: require('./home.html') };