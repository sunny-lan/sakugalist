export interface Bookmark {
    time: number;
    tags: string;
    comment: string;
    animator?:string;
}

export const BookmarkSearchableKeys: string[] = ['tags', 'comment'];

export type VideoList = VideoListEntry[];

type VideoListEntry={
    videoUrl:string;
    videoMetadata:VideoMetadata;
};

export interface Video {
    source: VideoSource;
    uri: string;
}

export enum VideoSource {
    LOCAL_FILE,
    WEB_URL
}

export enum MetadataSource {
    SERVER = 2,
    LOCAL_STORAGE = 1,
    UNTITLED = 0,
}

export const VERSION_DEPRECATED=-1;

export interface VideoMetadata {
    description?: string;
    animator?: string;
    show?: string;
    episode?: string;
    tags: string;
    bookmarks: Bookmark[];//if null, assume to be no bookmarks
    fps: number;//if not present, default to 24 and log an error
    version: number;//[DEPRECATED] incremented by 1 on each update
    dateModified:number;//time this object was saved. stored in milliseconds since 1970
    source: MetadataSource;
}

export const VideoMetadataSearchableKeys: string[] = [
    'description',
    'animator',
    'show',
    'episode',
    'tags',
    ...BookmarkSearchableKeys.map(x=>`bookmarks.${x}`)
];
