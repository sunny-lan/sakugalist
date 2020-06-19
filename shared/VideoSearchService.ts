import {Bookmark, VideoList, VideoMetadata} from "./Video";

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
