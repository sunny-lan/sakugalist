import {Bookmark, VideoMetadata} from "./Video";

export type VideoList = VideoListEntry[];

type VideoListEntry={
    videoUrl:string;
    videoMetadata:VideoMetadata;
};

export interface SearchQuery {
    query: string;
}

export interface VideoSearchResult {
    videoUrl:string;
    videoMetadata:VideoMetadata;
    score:number;
}

export interface BookmarkSearchResult {
    bookmark:Bookmark;
    parentVideoUrl:string;
    parentVideoMetadata:VideoMetadata;
    score:number;
}

export interface VideoSearchService {
    setVideos(list:VideoList);

    searchVideos(query:SearchQuery, includeBookmarksInSearch:boolean):VideoSearchResult[];

    searchBookmarks(query:SearchQuery, includeVideoMetaInSearch:boolean):BookmarkSearchResult[];
}
