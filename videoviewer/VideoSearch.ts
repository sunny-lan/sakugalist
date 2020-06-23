import {JQE} from "./util";
import {BookmarkSearchResult, VideoSearchService} from "../shared/VideoSearchService";
import {FuseSearchService} from "../shared/FuseSearchService";
import {VideoList} from "../shared/Video";
import {BookmarkLink} from "./BookmarkLink";
import {randomInt} from "../shared/util";

const html = `
<div class="videoSearch">
    <div class="searchBar">
    Search: <input class="searchQuery">
    Directly open url/file:
    <input class="directFile">
    <button class="directFileOpen">Open</button>
    <button class="randomize">Randomize bookmark</button>
    <button class="randomizeVideo">Randomize video</button>
    </div>
    <ul class="searchResults"></ul>
</div>
`;

const videoSearchResultHtml = `
<li class="videoSearchResult">
    <a class="videoLink" href=""></a>
    <ul class="bookmarks"></ul>
</li>
`;

export class VideoSearch {
    public readonly ui: JQE;
    private searchQuery: JQE;
    private searcher: VideoSearchService;
    private searchResults: JQE;
    private randomizableBookmarks: BookmarkLink[];
    private videoLinks:string[];
    private randomizeUi: JQE;
    private randomizeVideo: JQE;

    constructor() {
        this.ui = $(html);

        this.searchQuery = this.ui.find('.searchQuery');
        this.searchResults = this.ui.find('.searchResults');

        this.searcher = new FuseSearchService();

        this.searchQuery.on('input', () => this.doSearch());

        const directFile = this.ui.find('.directFile');
        this.ui.find('.directFileOpen').click(() => {
            window.location.href = `./videoviewer.html?videoUrl=${encodeURIComponent(directFile.val() as string)}`;
        });

        this.randomizeUi= this.ui.find('.randomize');
        this.randomizeUi.click(()=>this.randomize(false));

        this.randomizeVideo= this.ui.find('.randomizeVideo');
        this.randomizeVideo.click(()=>this.randomize(true));
    }

    private randomize(video:boolean){
        if(video){
            window.location.href=this.videoLinks[randomInt(0, this.videoLinks.length)];
        }else {
            const bk = this.randomizableBookmarks[randomInt(0, this.randomizableBookmarks.length)];
            bk.go();
        }
    }

    private doSearch() {
        const query = this.searchQuery.val() as string;
        this.searchResults.empty();
        const videos = this.searcher.searchVideos({query}, true);
        this.videoLinks=[];
        const searchResults: { [videoUrl: string]: JQE } = {};
        for (const video of videos) {
            const searchResult = $(videoSearchResultHtml);
            const videoLink = searchResult.find('.videoLink');
            const href=`./videoviewer.html?videoUrl=${video.videoUrl}`;
            this.videoLinks.push(href);
            videoLink.attr('href', href);

            //TODO replace with util function
            const meta = video.videoMetadata;
            videoLink.text(meta.description || '');
            if (meta.animator)
                videoLink.append(` | ${meta.animator}`);
            if (meta.show) {
                videoLink.append(` | ${meta.show}`);
            }
            if (meta.episode) {
                videoLink.append(` ep${meta.episode}`)
            }
            if(meta.tags){
                videoLink.append(`| ${meta.tags}`);
            }

            this.searchResults.append(searchResult);
            searchResults[video.videoUrl] = searchResult;
        }

        const bookmarks = this.searcher.searchBookmarks({query}, true);
        this.randomizableBookmarks=[];
        for (const bk of bookmarks) {
            //TODO show frame number instead of time
            const link = new BookmarkLink(bk.parentVideoUrl, bk.bookmark);
            const listItem = $('<li></li>');
            listItem.append(link.ui);
            searchResults[bk.parentVideoUrl].find('.bookmarks').append(listItem);

            if(bk.bookmark.includeInRandomize===undefined || bk.bookmark.includeInRandomize)
                this.randomizableBookmarks.push(link);
        }

        this.randomizeUi.prop('disabled', this.randomizableBookmarks.length===0);
    }

    public setVideoList(list: VideoList) {
        this.searcher.setVideos(list);
        this.doSearch();
    }


}
