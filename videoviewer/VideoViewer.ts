import {Bookmark, MetadataSource, VideoMetadata} from "../shared/Video";
import {JQE} from "./util";
import {MetadataEditor, MetadataEditorValues} from "./MetadataEditor";
import {BookmarkEditor} from "./BookmarkEditor";
import {BookmarkLink} from "./BookmarkLink";

interface MetadataSaveHandler {
    (newMeta: VideoMetadata);
}

interface BookmarkUpdate {
    tags:string;
    comment:string;
}

const html = `
<div class="videoViewer">
    <div class="infoBar">
        <span class="title">todo</span>
        <span class="time">xxx</span>
        <span class="fwd">forward</span>
        <span class="bkd">backwards</span>
        <span class="spd">x1</span>
        <input type="range" min="1" max="100" value="100" class="playbackRate">
    </div>
    <div class="vid-row">
        <video controls loop autobuffer preload>
            <p>Sorry, your browser does not support the &lt;video&gt; element.</p>
        </video>
        <div class="info-col">
            <div class="bookmarkEditor-stub"></div>
            <ul class="bookmarkList">
            </ul>
        </div>
    </div>
    <div class="metadataEditor-stub"></div>
</div>
`;

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

    public readonly ui: JQE;

    constructor(videoUrl: string) {
        this.ui = $(html);

        this.videoElm = this.ui.find('video')[0] as HTMLVideoElement;
        this.videoElm.setAttribute('src', videoUrl);


        //
        // control/status bar
        //

        const playbackSlider = this.ui.find('.playbackRate');
        playbackSlider.change(() => {
            this.setPlaybackSpeed(playbackSlider.val() as number / 100);
        });

        this.fwdInd = this.ui.find(".fwd");
        this.timeInd = this.ui.find(".time");
        this.bkdInd = this.ui.find(".bkd");
        this.spdInd = this.ui.find(".spd");

        //
        //bookmark list
        //

        this.bookmarkList = this.ui.find(".bookmarkList");

        //
        //bookmark editor
        //

        this.bookmarkEditor = new BookmarkEditor(
            x => this.addBookmark(x),
            x => this.removeBookmark(x)
        );
        this.bookmarkEditor.focus(() => {
            this.disableControls = true;
        });
        this.bookmarkEditor.focusout(() => {
            this.disableControls = false;
        });
        this.ui.find('.bookmarkEditor-stub').replaceWith(this.bookmarkEditor.ui);

        //
        // metadata editor
        //

        this.metadataEditor = new MetadataEditor();
        this.metadataEditor.setSaveHandler(m => {
            this.saveMetadata({
                ...this.meta,
                ...m
            });
        });
        this.ui.find('.metadataEditor-stub').replaceWith(this.metadataEditor.ui);

        //
        // key and mouse events
        //

        $(window).keydown((e) => this.onKeyDown(e)).keyup((e) => this.onKeyUp(e));
        $(this.videoElm).bind('mousewheel DOMMouseScroll', (event: any) => {
            if (this.disableControls) return;
            if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                this.stepForward();
            } else {
                this.stepBackward();
            }
        });

        //
        // time logic
        //

        this.videoElm.ontimeupdate = () => this.onFrameChange();
        window.onhashchange = ()=>this.onHashChange();

        //
        //metadata
        //

        this.setMetadata({
            fps: 24,
            bookmarks: [],
            tags: '',
            version: 1,
            source: MetadataSource.UNTITLED,
        });
        this.saveMetadata = (m) => this.setMetadata(m); //default handler: do nothing and just update data directly

        //
        //initialize
        //

        this.onHashChange();
        this.onFrameChange();
    }

    //
    // bookmark editor
    //

    private addBookmark(x: BookmarkUpdate): void {
        this.saveMetadata({
            ...this.meta,
            bookmarks: this.meta.bookmarks.concat({
                ...x,
                time: this.curTime,
            })
        });
    }

    private removeBookmark(x: Bookmark): void {
        this.saveMetadata({
            ...this.meta,
            bookmarks: this.meta.bookmarks.filter(y => y.time !== x.time)
        });
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

    //
    // metadata logic
    //

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
            this.bookmarkList.append(new BookmarkLink(bookmark, this.toFrame(bookmark.time).toString()).ui);
        }
        this.updateCurrentBookmarkView(true);
    }

    //
    // event handling
    //

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


    //
    // timekeeping logic
    //

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

    private toTime(frame: number): number {
        return frame / this.meta.fps;
    }

    //finds the nearest frame to a time
    private toFrame(t: number): number {
        return Math.round(t * this.meta.fps);
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


    private onHashChange() {
        const res=Number.parseFloat(window.location.hash.slice(1));
        if(Number.isNaN(res)){
            this.videoElm.currentTime=0;
        }else{
            this.videoElm.currentTime=res;
        }
    }

    private seekTime(time: number): void {
        window.location.hash = time.toString();
    }

    private onFrameChange(): void {
        this.timeInd.text(this.curFrame);
        this.updateCurrentBookmarkView(false);
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
}
