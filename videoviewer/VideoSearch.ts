import {JQE} from "./util";
import {VideoList, VideoSearchService} from "../shared/VideoSearchService";
import {FuseSearchService} from "../shared/FuseSearchService";

const html = `
<div class="videoSearch">
    <input class="searchBar">
    <ul class="searchResults"></ul>
</div>
`;

export class VideoSearch {
    public readonly ui: JQE;
    private searchBar: JQE;
    private searcher: VideoSearchService;
    private searchResults:JQE;

    constructor() {
        this.ui = $(html);

        this.searchBar = this.ui.find('.searchBar');
        this.searchResults=this.ui.find('.searchResults');

        this.searcher = new FuseSearchService();

        this.searchBar.change(() => this.doSearch(this.searchBar.val() as string));
    }

    private doSearch(query: string) {
        this.searchResults.val('');
    }

    public setVideoList(list: VideoList) {
        this.searcher.setVideos(list);
    }


}
