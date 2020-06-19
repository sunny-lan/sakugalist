import {VideoSearch} from "./VideoSearch";
import {VideoList} from "../shared/Video";

export class VideoSearchController {
    constructor(){
        const videoList:VideoList=[];
        for(const [videoUrl, meta] of Object.entries(localStorage)){
            videoList.push({
                videoUrl,
                videoMetadata:JSON.parse(meta)
            });
        }
        const search=new VideoSearch();
        search.setVideoList(videoList);
        $(()=>$('#videoSearch-stub').replaceWith(search.ui));
    }
}
