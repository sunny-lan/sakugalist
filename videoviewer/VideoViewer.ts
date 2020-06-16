import {Bookmark, MetadataSource, VideoMetadata} from "../interfaces/Video";
import {JQE} from "./util";
import {MetadataEditor, MetadataEditorValues} from "./MetadataEditor";
import {BookmarkEditor, BookmarkUpdate} from "./BookmarkEditor";

interface MetadataSaveHandler {
    (newMeta: VideoMetadata);
}

export class VideoViewer {
    private videoElm: HTMLVideoElement;
    private fwdInd: JQE;
    private timeInd: JQE;
    private bkdInd: JQE;
    private spdInd: JQE;
    private bookmarkList: JQE;

    private meta: VideoMetadata;

    //TODO add types
    private fwdIndTimer;
    private bkIndTimer;

    private disableControls: boolean = false;
    private press2: boolean;
    private press3: boolean;

    private currentBookmark?: Bookmark;
    private saveMetadata: MetadataSaveHandler;
    private metadataEditor: MetadataEditor;
    private bookmarkEditor: BookmarkEditor;

    constructor(videoUrl: string) {
        this.videoElm = $("#video")[0] as HTMLVideoElement;
        this.videoElm.setAttribute('src', videoUrl);

        this.fwdInd = $("#fwd");
        this.timeInd = $("#time");
        this.bkdInd = $("#bkd");
        this.spdInd = $("#spd");
        this.bookmarkList = $("#bookmarks");

        this.bookmarkEditor = new BookmarkEditor(
            x => this.handleBookmarkAdd(x),
            y => this.handleBookmarkRemove(y)
        );
        this.bookmarkEditor.focus(() => {
            this.disableControls = true;
        });
        this.bookmarkEditor.focusout(() => {
            this.disableControls = false;
        });
        $('#bookmark-editor-stub').replaceWith(this.bookmarkEditor.ui);

        this.metadataEditor = new MetadataEditor();
        this.metadataEditor.setSaveHandler(m => {
            this.saveMetadata({
                ...this.meta,
                ...m
            });
        });
        $('#metadata-editor-stub').replaceWith(this.metadataEditor.ui);

        const playbackSlider = $('#playbackRate');
        playbackSlider.change(() => {
            this.setPlaybackSpeed(playbackSlider.val() as number / 100);
        });

        this.setMetadata({
            fps: 24,
            bookmarks: [],
            tags: '',
            version: 1,
            source: MetadataSource.UNTITLED,
        });

        $(window).keydown((e) => this.onKeyDown(e)).keyup((e) => this.onKeyUp(e));
        this.videoElm.ontimeupdate = () => this.onFrameChange();

        $(window).bind('mousewheel DOMMouseScroll', (event: any) => {
            if (this.disableControls) return;
            if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                this.stepForward();
            } else {
                this.stepBackward();
            }
        });

        this.saveMetadata = (m) => this.setMetadata(m); //default handler: do nothing and just update data directly

        this.onFrameChange();
    }

    private handleBookmarkAdd(x: BookmarkUpdate): void {
        this.saveMetadata({
            ...this.meta,
            bookmarks: this.meta.bookmarks.concat({
                ...x,
                time: this.curTime,
            })
        });
    }

    private handleBookmarkRemove(x: Bookmark): void {
        this.saveMetadata({
            ...this.meta,
            bookmarks: this.meta.bookmarks.filter(y => y.time !== x.time)
        });
    }


    public get metadata() {
        return this.meta;
    }

    public setSaveMetaHandler(handler: MetadataSaveHandler) {
        this.saveMetadata = handler;
    }

    public setMetadata(metadata: VideoMetadata): void {

        if (!metadata.fps) {
            console.error('No FPS given for video. Setting to 24 by default');
            metadata.fps = 24;
        }
        this.meta = metadata;

        this.metadataEditor.setMetadata(this.meta as MetadataEditorValues);

        if (metadata.bookmarks)
            this.bookmarkList.empty();
        this.meta.bookmarks = this.meta.bookmarks.sort((a, b) => a.time - b.time);
        for (const bookmark of this.meta.bookmarks) {
            this.bookmarkList.append(this.createBookmarkElm(bookmark));
        }
        this.updateCurrentBookmarkView(true);
    }

    private onKeyDown(evt): void {
        if (evt.which === 50) { // ctrl
            this.press2 = true;
        }
        if (evt.which === 51) { // ctrl
            this.press3 = true;
        }
    }

    private onKeyUp(e): void {
        if (e.which === 50) { // ctrl
            this.press2 = false;
        }
        if (e.which === 51) { // ctrl
            this.press3 = false;
        }

        if (this.disableControls) return;
        if ((e.keyCode || e.which) === 77) {
            this.videoElm.muted = !this.videoElm.muted;
            console.log("re");
        }
        if ((e.keyCode || e.which) === 32) {
            /*
                            if (videoElm.paused) videoElm.play();
                            else videoElm.pause();
                            return false;*/
        }
        if ((e.keyCode || e.which) === 46) {
            this.stepForward();
        }
        if ((e.keyCode || e.which) === 44) {
            this.stepBackward();
        }
    }


    private get curFrame(): number {
        return this.toFrame(this.videoElm.currentTime);
    }

    private set curFrame(frame: number) {
        this.videoElm.currentTime = this.toTime(frame);
    }

    private get curTime(): number {
        return this.videoElm.currentTime;
    }

    public seekTime(time: number): void {
        this.videoElm.currentTime = time;
    }

    private toTime(frame: number): number {
        return frame / this.meta.fps;
    }

    //finds the nearest frame to a time
    private toFrame(t: number): number {
        return Math.round(t * this.meta.fps);
    }

    private createBookmarkElm(bookmark: Bookmark): JQE {
        const link = $('<a class="bookmark-link"></a>')
            .text(this.toFrame(bookmark.time) + '-' + bookmark.comment)
            .click(() => this.seekTime(bookmark.time));
        return $('<li></li>').append(link);
    }

    public setPlaybackSpeed(speed: number) {
        this.videoElm.playbackRate = speed;
    }

    private getFrameSkip(): number {
        let re = 1;
        if (this.press2) re = 2;
        if (this.press3) re = 3;
        return re;
    }

    //step forward
    private stepForward(): void {
        this.fwdInd.css({opacity: 1});
        clearTimeout(this.fwdIndTimer);
        this.fwdIndTimer = setTimeout(() => this.fwdInd.css({opacity: 0}), 200);
        this.videoElm.pause();
        this.curFrame = this.curFrame + this.getFrameSkip();
    }

    private stepBackward(): void {
        this.bkdInd.css({opacity: 1});
        clearTimeout(this.bkIndTimer);
        this.bkIndTimer = setTimeout(() => this.bkdInd.css({opacity: 0}), 200);
        this.videoElm.pause();
        this.curFrame = this.curFrame - this.getFrameSkip();
    }

    private onFrameChange(): void {
        this.timeInd.text(this.curFrame);
        this.updateCurrentBookmarkView(false);
    }

    private findBookmarkFromTime(time: number): Bookmark | undefined {
        let best;
        let bestVal = Number.POSITIVE_INFINITY;
        for (const bk of this.meta.bookmarks) {
            const t2 = Math.min(bk.time, this.videoElm.duration);
            const delta = Math.abs(t2 - time);
            if (delta < bestVal) {
                bestVal = delta;
                best = bk;
            }
        }
        // if bookmark is not within 1 frame, exit
        if (bestVal > 1 / this.metadata.fps) {
            return undefined;
        }
        return best;
    }

    private updateCurrentBookmarkView(keepMissingBookmark: boolean = false): void {
        this.currentBookmark = this.findBookmarkFromTime(this.curTime);
        if (this.currentBookmark) {
            this.bookmarkEditor.select(this.currentBookmark);
        } else {
            this.bookmarkEditor.clear(true);
        }
    }
}
