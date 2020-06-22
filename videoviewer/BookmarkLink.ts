import {JQE} from "./util";
import {Bookmark} from "../shared/Video";
import {formatTime} from "../shared/util";

/**
 * Displays single bookmark as a clickable link. Navigates using hash
 */
export class BookmarkLink {
    public readonly ui: JQE;
    private readonly url:string;

    /**
     * Will display the time
     * @param videoUrl
     * @param bookmark
     * @param overrideTime - if this is given, it will replace what is displayed as the time
     */
    constructor(videoUrl:string,bookmark: Bookmark, overrideTime?: string) {
        const time = overrideTime || formatTime(bookmark.time);
        //TODO make separate navigation system
        this.url=`./videoviewer.html?videoUrl=${videoUrl}#${bookmark.time}`;
        this.ui = $(`<a class="bookmarkLink" href="${this.url}"></a>`)
            .text(`${time} - ${bookmark.comment}`);
        if(bookmark.tags)
            this.ui.append(`| ${bookmark.tags}`);
    }

    public go(){
        window.location.href=this.url;
    }
}
