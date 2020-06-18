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
     * @param bookmark
     * @param overrideTime - if this is given, it will replace what is displayed as the time
     */
    constructor(bookmark: Bookmark, overrideTime?: string) {
        const time = overrideTime || formatTime(bookmark.time);
        const link = $(`<a class="bookmark-link" href="#${bookmark.time}"></a>`)
            .text(`${time} - ${bookmark.comment}`);
        this.ui = $('<li></li>').append(link);
    }
}
