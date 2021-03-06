import {Video, VideoSource} from "../shared/Video";

function getVideoURL(video:Video):string {
    switch (video.source) {
        case VideoSource.WEB_URL:
            return video.uri;
        case VideoSource.LOCAL_FILE:
            return `/video?file=${encodeURIComponent(video.uri)}`;
        default:
            throw new Error('Unsupported video source type');
    }
}

export class VideoServer{

}
