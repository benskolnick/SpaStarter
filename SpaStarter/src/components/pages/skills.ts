class SkillsViewModel {
    public trainingLink = ko.observable("");
    constructor(params: any) {
        let prefix = "";
        if (globals.navMode === "hasher") {
            prefix = "#";
        }

        this.trainingLink(prefix + "/training");
    }
    
    private dispose = function () {
        
    }
}

export default { viewModel: SkillsViewModel, template: require('./skills.html') };