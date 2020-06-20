import {VERSION_DEPRECATED, Video, VideoMetadata} from "../shared/Video";
import {VideoViewer} from "./VideoViewer";
import {ajax, AjaxError} from "./util";
import {ServerApi} from "../server/Api";


interface ServerHookInitData {
    videoUrl: string;//expected to be unique per video
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

export class VideoViewerController {
    private metaSources: MetadataSource[];

    private viewer: VideoViewer;
    private readonly videoURL: string;

    public static parseInitDataFromURL(): ServerHookInitData {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            videoUrl: urlParams.get("videoUrl"),
        };
    }

    constructor(initData?: ServerHookInitData) {
        this.metaSources = [new ServerMetadataSource(), new LocalStorageMetaSource()];
        if (!initData) initData = VideoViewerController.parseInitDataFromURL();
        if (!initData.videoUrl)
            throw new Error('Video url must be provided');
        this.videoURL = initData.videoUrl;

        $(() => this.onPageLoad());
    }

    private onPageLoad() {
        this.viewer = new VideoViewer(this.videoURL);
        $('#videoViewer-stub').replaceWith(this.viewer.ui);
        this.viewer.setSaveMetaHandler(metadata =>
            this.handleMetadataSave(metadata)
                .catch(e => VideoViewerController.handlePromiseRejection(e))
        );
        this.loadMetadata().catch(e => VideoViewerController.handlePromiseRejection(e));
    }

    private static handlePromiseRejection(e) {
        alert(`Fatal error (unhandled rejection): ${e.toString()}`);
        console.error('unhandled rejection', e);
    }

    private async loadMetadata() {
        let latestModified=-1;
        await Promise.all(this.metaSources.map(async (source) => {
            const res = await source.getMetadata(this.videoURL);
            if (res) {
                //get latest version
                const dateMod=res.dateModified||0; //for older versions still using version number
                if (
                   dateMod>latestModified
                ) {
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

