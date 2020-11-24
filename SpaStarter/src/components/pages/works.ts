class WorksViewModel {
    public message = ko.observable("");
    constructor(params: any) {

    }

}

export default { viewModel: WorksViewModel, template: require('./works.html') };