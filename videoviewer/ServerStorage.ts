import {ServerApi} from "../server/Api";
import {ajax, AjaxError} from "./util";
import {VideoList, VideoMetadata} from "../shared/Video";
import {StorageProvider} from "./StorageProvider";

export class ServerStorage implements StorageProvider {

    private errorShown = false;

    private static async serverApi_UpdateMetadata(update: ServerApi.UpdateMetadata): Promise<void> {
        await ajax({
            type: "POST",
            url: '/update_metadata',
            data: JSON.stringify(update),
            contentType: 'application/json',
        });
    }

    private static async serverApi_GetMetadata(get: ServerApi.GetMetadata): Promise<VideoMetadata> {
        return await ajax({
            type: "GET",
            url: '/get_metadata',
            data: get,
            contentType: 'application/json',
            dataType: "json",
        }) as VideoMetadata;
    }

    public async getAllVideos(): Promise<VideoList> {
        throw new Error('ServerStorage.getAllVideos() not implemented yet');
    }

    public async getMetadata(videoURL: string): Promise<VideoMetadata|undefined> {
        try {
            return await ServerStorage.serverApi_GetMetadata({videoURL});
        } catch (e) {
            const ajaxE = e as AjaxError;
            if (ajaxE.errorThrown === "parsererror") {
                throw e;
            }
            console.error('unable to contact server:', e);
            return undefined;
        }
    }

    public async saveMetadata(videoURL: string, metadata: VideoMetadata): Promise<void> {
        try {
            await ServerStorage.serverApi_UpdateMetadata({
                metadata,
                videoURL
            });
        } catch (e) {
            //do not show annoying error multiple times
            if (!this.errorShown)
                alert(`error trying to contact server. will store in localstorage.`);

            this.errorShown = true;
            console.error('error trying to to contact server:', e);
            return;
        }
    }
}
