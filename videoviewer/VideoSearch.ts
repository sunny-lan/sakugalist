import {JQE} from "./util";
import {VideoSearchService} from "../shared/VideoSearchService";
import {FuseSearchService} from "../shared/FuseSearchService";
import {VideoList} from "../shared/Video";
import {BookmarkLink} from "./BookmarkLink";

const html = `
<div class="videoSearch">
    Search: <input class="searchBar">
    Directly open url/file:
    <input class="directFile">
    <button class="directFileOpen">Open</button>
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
    private searchBar: JQE;
    private searcher: VideoSearchService;
    private searchResults: JQE;

    constructor() {
        this.ui = $(html);

        this.searchBar = this.ui.find('.searchBar');
        this.searchResults = this.ui.find('.searchResults');

        this.searcher = new FuseSearchService();

        this.searchBar.on('input', () => this.doSearch());

        const directFile = this.ui.find('.directFile');
        this.ui.find('.directFileOpen').click(() => {
            window.location.href = `./videoviewer.html?videoUrl=${encodeURIComponent(directFile.val() as string)}`;
        });
    }

    private doSearch() {
        const query = this.searchBar.val() as string;
        this.searchResults.empty();
        const videos = this.searcher.searchVideos({query}, true);
        const searchResults: { [videoUrl: string]: JQE } = {};
        for (const video of videos) {
            const searchResult = $(videoSearchResultHtml);
            const videoLink = searchResult.find('.videoLink');
            videoLink.attr('href', `./videoviewer.html?videoUrl=${video.videoUrl}`);

            //TODO replace with util function
            const meta = video.videoMetadata;
            videoLink.text(meta.description || '');
            if (meta.animator)
                videoLink.append(` | animator:${meta.animator}`);
            if (meta.show) {
                videoLink.append(` | source:${meta.show}`);
                if (meta.episode) {
                    videoLink.append(` episode:${meta.episode}`)
                }
            }

            this.searchResults.append(searchResult);
            searchResults[video.videoUrl] = searchResult;
        }

        const bookmarks = this.searcher.searchBookmarks({query}, true);

        for (const bk of bookmarks) {
            //TODO show frame number instead of time
            const link = new BookmarkLink(bk.parentVideoUrl, bk.bookmark);
            const listItem = $('<li></li>');
            listItem.append(link.ui);
            searchResults[bk.parentVideoUrl].find('.bookmarks').append(listItem);
        }
    }

    public setVideoList(list: VideoList) {
        this.searcher.setVideos(list);
        this.doSearch();
    }


}
