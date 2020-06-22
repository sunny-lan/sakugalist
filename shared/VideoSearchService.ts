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

    /**
     * should return whole list of videos, sorted by animator if query is empty
     * @param query
     * @param includeBookmarksInSearch
     */
    searchVideos(query:SearchQuery, includeBookmarksInSearch:boolean):VideoSearchResult[];

    /**
     * should return TODO empty or whole list of bookmarks if query empty
     * @param query
     * @param includeVideoMetaInSearch
     */
    searchBookmarks(query:SearchQuery, includeVideoMetaInSearch:boolean):BookmarkSearchResult[];
}
