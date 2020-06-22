import {VideoList, VideoMetadata} from "../shared/Video";

export interface StorageProvider {
    saveMetadata(videoUrl:string, metadata:VideoMetadata):Promise<void>;
    getAllVideos():Promise<VideoList>;

    /**
     * Gets metadata for video
     * @param videoUrl
     * @returns undefined if metadata not available
     */
    getMetadata(videoUrl:string):Promise<VideoMetadata|undefined>;
}
