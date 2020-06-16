export interface Bookmark {
    time:number;
    tags:string;
    comment:string;
}

export interface Video {
    source:VideoSource;
    uri:string;
}

export enum VideoSource {
    LOCAL_FILE,
    WEB_URL
}

export enum MetadataSource{
    SERVER=2,
    LOCAL_STORAGE=1,
    UNTITLED=0,
}

export interface VideoMetadata {
    animator?:string;
    show?:string;
    episode?:string;
    tags:string;
    bookmarks:Bookmark[];//if null, assume to be no bookmarks
    fps:number;//if not present, default to 24 and log an error
    version:number;//incremented by 1 on each update
    source:MetadataSource;
}
