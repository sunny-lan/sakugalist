import {Video, VideoMetadata} from "../interfaces/Video";

export namespace ServerApi{
    //path: POST /api/update_metadata
    export interface UpdateMetadata {
        videoURL:string;
        metadata:VideoMetadata;
    }

    //path GET /api/get_metadata
    //return undefined if not available
    export interface GetMetadata {
        videoURL:string;
    }
}
