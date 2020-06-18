import {
    BookmarkSearchResult,
    SearchQuery,
    VideoSearchService,
    VideoList,
    VideoSearchResult
} from "./VideoSearchService";

// import Fuse from "fuse.js";
import {Bookmark, BookmarkSearchableKeys, VideoMetadata, VideoMetadataSearchableKeys, VideoSource} from "./Video";

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
    fps:string;
}

const videoKeys = [
    'videoUrl',
    ...VideoMetadataSearchableKeys.map(x => `videoMetadata.${x}`),
    'fps'
];

export class FuseSearchService implements VideoSearchService {
    private videoSearch: Fuse<VideoSearchable, {}>;
    private bookmarkSearch: Fuse<BookmarkSearchable, {}>;
    private bookmarkList: BookmarkSearchable[];
    private videoList: VideoSearchable[];

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
        //convert list to a searchable format
        this.videoList=[];
        this.bookmarkList=[];
        for (const video of list) {
            this.videoList.push({
                videoMetadata:video.videoMetadata,
                videoUrl:video.videoUrl,
                fps:video.videoMetadata.fps.toString(),
            });

            //invert list for bookmark search
            for (const bookmark of video.videoMetadata.bookmarks) {
                this.bookmarkList.push({
                    bookmark,
                    parentVideoMetadata: video.videoMetadata,
                    parentVideoUrl: video.videoUrl,
                });
            }
        }

        this.videoSearch = new Fuse<VideoSearchable, {}>(this.videoList, {keys: videoKeys});
        this.bookmarkSearch = new Fuse(this.bookmarkList, {keys: bookmarkKeys});
    }

}
