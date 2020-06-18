/**
 * Formats time in mm:ss:ff (ff=frames, if given)
 * @param time
 * @param fps
 */
export function formatTime(time:number, fps?:number):string {
    let res=`${Math.floor(time/60).toString().padStart(2,'0')}:${Math.floor(time%60).toString().padStart(2,'0')}`;
    if(fps)
        res+=`:${Math.round((time%1)*fps).toString().padStart(2,'0')}`;
    return res;
}
