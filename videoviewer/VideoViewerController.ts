import {VERSION_DEPRECATED, Video, VideoMetadata} from "../shared/Video";
import {VideoViewer} from "./VideoViewer";
import {ajax, AjaxError} from "./util";
import {ServerApi} from "../server/Api";
import {StorageProvider} from "./StorageProvider";
import {LocalStorage} from "./LocalStorage";

interface ServerHookInitData {
    videoUrl: string;//expected to be unique per video
}

export class VideoViewerController {
    private metaSources: StorageProvider[];

    private viewer: VideoViewer;
    private readonly videoURL: string;

    public static parseInitDataFromURL(): ServerHookInitData {
        const urlParams = new URLSearchParams(window.location.search);
        const url=urlParams.get("videoUrl");
        if(!url)
            throw new Error('Video url must be provided');
        return {
            videoUrl: url,
        };
    }

    constructor(initData?: ServerHookInitData) {
        this.metaSources = [new LocalStorage()];
        if (!initData) initData = VideoViewerController.parseInitDataFromURL();
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

