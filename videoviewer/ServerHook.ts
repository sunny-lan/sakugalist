import {Video, VideoMetadata} from "../interfaces/Video";
import {VideoViewer} from "./VideoViewer";
import {ajax, AjaxError} from "./util";
import {ServerApi} from "../server/Api";


interface ServerHookInitData {
    videoURL: string;//expected to be unique per video
}

interface MetadataSource {
    getMetadata(videoURL: string): Promise<VideoMetadata | undefined>;

    saveMetadata(videoURL: string, metadata: VideoMetadata): Promise<void>;
}


class ServerMetadataSource implements MetadataSource {
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

    public async getMetadata(videoURL: string): Promise<VideoMetadata> {
        try {
            return await ServerMetadataSource.serverApi_GetMetadata({videoURL});
        } catch (e) {
            const ajaxE = e as AjaxError;
            if (ajaxE.errorThrown === "parsererror") {
                throw e;
            }
            console.error('unable to contact server:', e);
            return null;
        }
    }

    public async saveMetadata(videoURL: string, metadata: VideoMetadata): Promise<void> {
        try {
            await ServerMetadataSource.serverApi_UpdateMetadata({
                metadata,
                videoURL
            });
        } catch (e) {
            //do not show annoying error multiple times
            if (!this.errorShown)
                alert(`error trying to contact server. will store in localstorage.`);

            this.errorShown = true;
            console.error('error trying to to contact server:', e);
            return null;
        }
    }
}

class LocalStorageMetaSource implements MetadataSource {
    public async getMetadata(videoURL: string): Promise<VideoMetadata> {
        const item = localStorage.getItem(videoURL);
        if (!item) return undefined;
        return JSON.parse(item) as VideoMetadata;
    }

    public async saveMetadata(videoURL: string, metadata: VideoMetadata): Promise<void> {
        localStorage.setItem(videoURL, JSON.stringify(metadata));
    }

}

export class ServerHook {
    private metaSources: MetadataSource[];

    private viewer: VideoViewer;
    private videoURL: string;

    public static parseInitDataFromURL(): ServerHookInitData {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            videoURL: urlParams.get("videoURL"),
        };
    }

    constructor(initData?: ServerHookInitData) {
        this.metaSources = [new ServerMetadataSource(), new LocalStorageMetaSource()];
        if (!initData) initData = ServerHook.parseInitDataFromURL();
        if(!initData.videoURL)
            throw new Error('Video url must be provided');
        this.videoURL = initData.videoURL;

        $(() => this.onPageLoad());
    }

    private onPageLoad() {
        this.viewer = new VideoViewer(this.videoURL);
        this.viewer.setSaveMetaHandler(metadata =>
            this.handleMetadataSave(metadata)
                .catch(e => ServerHook.handlePromiseRejection(e))
        );
        this.loadMetadata().catch(e => ServerHook.handlePromiseRejection(e));
    }

    private static handlePromiseRejection(e) {
        alert(`Fatal error (unhandled rejection): ${e.toString()}`);
        console.error('unhandled rejection', e);
    }

    private async loadMetadata() {
        await Promise.all(this.metaSources.map(async (source) => {
            const res = await source.getMetadata(this.videoURL);
            if (res) {
                if (res.version > this.viewer.metadata.version) {
                    this.viewer.setMetadata(res);
                }
            }
        }))
    }


    private async handleMetadataSave(metadata: VideoMetadata): Promise<void> {
        await Promise.all(this.metaSources.map(async (source) => {
            await source.saveMetadata(this.videoURL, metadata);
        }));
        this.viewer.setMetadata(metadata);
    }


}

