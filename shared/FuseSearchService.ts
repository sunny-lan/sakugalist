import {
    BookmarkSearchResult,
    SearchQuery,
    VideoSearchService,
    VideoList,
    VideoSearchResult
} from "./VideoSearchService";
import Fuse from 'fuse.js';
import {Bookmark, BookmarkSearchableKeys, VideoMetadata, VideoMetadataSearchableKeys} from "./Video";

interface BookmarkSearchable {
    bookmark: Bookmark;
    parentVideoUrl: string;
    parentVideoMetadata: VideoMetadata;
}

const bookmarkKeys = [
    ...BookmarkSearchableKeys.map(x => `bookmark.${x}`),
    'videoUrl',
    ...VideoMetadataSearchableKeys.map(x => `videoMetadata.${x}`),
];

interface VideoSearchable {
    videoUrl: string;
    videoMetadata: VideoMetadata;
}

const videoKeys = [
    'videoUrl',
    ...VideoMetadataSearchableKeys.map(x => `videoMetadata.${x}`),
];

export class FuseSearchService implements VideoSearchService {
    private videoSearch: Fuse<VideoSearchable, {}>;
    private bookmarkSearch: Fuse<BookmarkSearchable, {}>;
    private bookmarkList: BookmarkSearchable[];
    private videoList: VideoList;

    //TODO in
    searchBookmarks(query: SearchQuery): BookmarkSearchResult[] {
        //if empty return all results
        if(query.query.trim().length===0){
            return this.bookmarkList.map(x=>{
                return {...x, score:1};
            });
        }

        return this.bookmarkSearch.search(query.query).map(res => {
            return {
                ...res.item,
                score: res.score,
            }
        });
    }

    searchVideos(query: SearchQuery): VideoSearchResult[] {
        //if empty return all results
        if(query.query.trim().length===0){
            return this.videoList.map(x=>{
                return {...x, score:1};
            });
        }

        return this.videoSearch.search(query.query).map(res => {
            return {
                ...res.item,
                score: res.score,
            }
        });
    }

    setVideos(list: VideoList) {
        this.videoList=list;
        this.videoSearch = new Fuse(list, {keys: videoKeys});

        //invert list for bookmark search
        this.bookmarkList=[];
        for (const video of list) {
            for (const bookmark of video.videoMetadata.bookmarks) {
                this.bookmarkList.push({
                    bookmark,
                    parentVideoMetadata: video.videoMetadata,
                    parentVideoUrl: video.videoUrl,
                });
            }
        }

        this.bookmarkSearch = new Fuse(this.bookmarkList, {keys: bookmarkKeys});
    }

}
