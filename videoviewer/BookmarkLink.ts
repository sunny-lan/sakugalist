import {JQE} from "./util";
import {Bookmark} from "../shared/Video";
import {formatTime} from "../shared/util";

/**
 * Displays single bookmark as a clickable link. Navigates using hash
 */
export class BookmarkLink {
    public readonly ui: JQE;

    /**
     * Will display the time
     * @param videoUrl
     * @param bookmark
     * @param overrideTime - if this is given, it will replace what is displayed as the time
     */
    constructor(videoUrl:string,bookmark: Bookmark, overrideTime?: string) {
        const time = overrideTime || formatTime(bookmark.time);
        //TODO make separate navigation system
        const vidLink=`./videoviewer.html?videoUrl=${videoUrl}#${bookmark.time}`;
        this.ui = $(`<a class="bookmark-link" href="${vidLink}"></a>`)
            .text(`${time} - ${bookmark.comment}`);
    }
}
