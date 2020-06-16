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

export interface VideoMetadata {
    animator?:string;
    show?:string;
    episode?:string;
    tags:string;
    bookmarks:Bookmark[];//if null, assume to be no bookmarks
    fps:number;//if not present, default to 24 and log an error
    version:number;//incremented by 1 on each update
}

export interface VideoView {
    //all measured in seconds
    time?:number;//default to 0

    loopBegin?:number; //default to 0
    loopEnd?:number;//default to video length
}
