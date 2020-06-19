import {VideoList, VideoMetadata} from "../shared/Video";

export interface StorageProvider {
    saveMetadata(videoUrl:string, metadata:VideoMetadata):Promise<void>;
    getAllVideos():Promise<VideoList>;
    getMetadata(videoUrl:string):Promise<VideoMetadata>;
}
