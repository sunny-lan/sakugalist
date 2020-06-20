import {StorageProvider} from "./StorageProvider";
import {VideoList, VideoMetadata} from "../shared/Video";

export class LocalStorage implements StorageProvider{
    public async getAllVideos(): Promise<VideoList>{
        const videoList:VideoList=[];
        for(const [videoUrl, meta] of Object.entries(localStorage)){
            videoList.push({
                videoUrl,
                videoMetadata:JSON.parse(meta)
            });
        }
        return videoList;
    }

    public async getMetadata(videoURL: string): Promise<VideoMetadata> {
        const item = localStorage.getItem(videoURL);
        if (!item) return undefined;
        return JSON.parse(item) as VideoMetadata;
    }

    public async saveMetadata(videoURL: string, metadata: VideoMetadata): Promise<void> {
        localStorage.setItem(videoURL, JSON.stringify(metadata));
    }

}
