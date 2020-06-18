import {JQE} from "./util";
import {VideoList, VideoSearchService} from "../shared/VideoSearchService";
import {FuseSearchService} from "../shared/FuseSearchService";

const html = `
<div class="videoSearch">
    <input class="searchBar">
    <ul class="searchResults"></ul>
</div>
`;

const videoSearchResultHtml=`
<li class="videoSearchResult">
    <a class="videoLink" href=""></a>
    <ul class="bookmarks"></ul>
</li>
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

        this.searchBar.on('input', () => this.doSearch());
    }

    private doSearch() {
        const query=this.searchBar.val() as string;
        this.searchResults.empty();
        const videos=this.searcher.searchVideos({query},true);

        for(const video of videos){
            const searchResult=$(videoSearchResultHtml);
            const videoLink=searchResult.find('.videoLink');
            videoLink.attr('href', `./videoviewer.html?videoUrl=${video.videoUrl}`);

            const meta=video.videoMetadata;
            videoLink.text(meta.description || '');
            if(meta.animator)
                videoLink.append(` | animator:${meta.animator}`);
            if(meta.show){
                videoLink.append(` | source:${meta.show}`);
                if(meta.episode){
                    videoLink.append(` episode:${meta.episode}`)
                }
            }

            this.searchResults.append(searchResult);
        }
    }

    public setVideoList(list: VideoList) {
        this.searcher.setVideos(list);
        this.doSearch();
    }


}
