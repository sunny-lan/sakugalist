/**
 * Formats time in mm:ss:ff (ff=frames, if given. if not shows milliseconds)
 * @param time
 * @param fps
 */
import {VideoMetadata} from "./Video";

export function formatTime(time:number, fps?:number):string {
    let res=`${Math.floor(time/60).toString().padStart(2,'0')}:${Math.floor(time%60).toString().padStart(2,'0')}`;
    if(fps)
    res+=`:${Math.round((time%1)*fps).toString().padStart(2,'0')}f`;
    else
        res+=`:${Math.round((time%1)*1000).toString().padStart(2,'0')}ms`;

    return res;
}

export function videoMetadataToString(videoUrl?:string, videoMetadata?:VideoMetadata) {
    //TODO not implemented
}

/**
 * Returns random integer in range [min, max)
 */
export function randomInt(min:number, max:number) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
