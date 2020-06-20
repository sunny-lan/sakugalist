import {Bookmark, MetadataSource, VERSION_DEPRECATED, VideoMetadata} from "../shared/Video";
import {JQE} from "./util";
import {MetadataEditor, MetadataEditorValues} from "./MetadataEditor";
import {BookmarkEditor} from "./BookmarkEditor";
import {BookmarkLink} from "./BookmarkLink";

interface MetadataSaveHandler {
    (newMeta: VideoMetadata);
}

interface BookmarkUpdate {
    tags: string;
    comment: string;
    animator?: string;
}

const html = `
<div class="videoViewer">
    <div class="infoBar">
        <span class="title"></span>
        |
        Play speed: <span class="spd">1</span>
        <input type="range" min="1" max="100" value="100" class="playbackRate">
        |
        Fps:
        <select class="fpsSelect">
            <option value="8">8 (threes)</option>
            <option value="12">12 (twos)</option>
            <option value="24" selected>24 (ones)</option>
            <option value="30">30</option>
        </select>
        |
        Frame:
        <span class="time">xxx</span>
        |
        <span class="fwd">forward</span>
        <span class="bkd">backwards</span>
    </div>
    <div class="vidRow">
        <video controls preload>
            <p>Sorry, your browser does not support the &lt;video&gt; element.</p>
        </video>
        <div class="infoCol">
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

    private currentBookmark?: Bookmark;
    private saveMetadataExternal: MetadataSaveHandler;
    private metadataEditor: MetadataEditor;
    private bookmarkEditor: BookmarkEditor;

    public readonly ui: JQE;

    private videoUrl: string;

    private fpsSelect:JQE;
    private title: JQE;

    constructor(videoUrl: string) {
        this.videoUrl = videoUrl;
        this.ui = $(html);

        this.videoElm = this.ui.find('video')[0] as HTMLVideoElement;
        this.videoElm.setAttribute('src', videoUrl);

        document.title = `Sakugalist - ${videoUrl}`;
        this.title=this.ui.find('.title');
        this.title.text(videoUrl);

        //
        // control/status bar
        //

        const playbackSlider = this.ui.find('.playbackRate');
        playbackSlider.change(() => {
            const spd=playbackSlider.val() as number / 100;
            this.setPlaybackSpeed(spd);
        });

        this.fwdInd = this.ui.find(".fwd");
        this.timeInd = this.ui.find(".time");
        this.bkdInd = this.ui.find(".bkd");
        this.spdInd = this.ui.find(".spd");

        this.fpsSelect=this.ui.find('.fpsSelect');
        this.fpsSelect.on('change', ()=>this.onFpsSelected());

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
        window.onhashchange = () => this.onHashChange();

        //
        //metadata
        //

        this.setMetadataInternal({
            bookmarks: [],
            tags: '',
            version: VERSION_DEPRECATED,
            source: MetadataSource.UNTITLED,
            dateModified: -1,
        });
        this.saveMetadataExternal = (m) => this.setMetadata(m); //default handler: do nothing and just update data directly

        //
        //initialize
        //
        this.onFpsSelected();
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
        if (bestVal > 1 / this.meta.fps) {
            return undefined;
        }
        return best;
    }

    private updateCurrentBookmarkView(keepOldData: boolean): void {
        this.currentBookmark = this.findBookmarkFromTime(this.curTime);
        if (this.currentBookmark) {
            this.bookmarkEditor.select(this.currentBookmark);
        } else {
            this.bookmarkEditor.clear(keepOldData);
        }
    }

    //
    // metadata logic
    //

    private saveMetadata(metadata: VideoMetadata): void {
        this.saveMetadataExternal({
            ...metadata,
            dateModified: new Date().getTime()
        });
    }

    public setSaveMetaHandler(handler: MetadataSaveHandler) {
        this.saveMetadataExternal = handler;
    }

    private setMetadataInternal(metadata: VideoMetadata) {
        this.meta = metadata;

        if(metadata.description){
            this.title.text(metadata.description);
        }

        this.metadataEditor.setMetadata(this.meta as MetadataEditorValues);

        this.updateBookmarkList();
        this.updateCurrentBookmarkView(true);
    }

    private updateBookmarkList(){
        this.bookmarkList.empty();
        for (const bookmark of this.meta.bookmarks.sort((a, b) => a.time - b.time)) {
            const link = new BookmarkLink(this.videoUrl, bookmark, this.toFrame(bookmark.time).toString()).ui;
            const li = $('<li></li>').append(link);
            this.bookmarkList.append(li);
        }
    }

    public setMetadata(metadata: VideoMetadata): void {
        //or 0 is for backwards compatibility
        if ((metadata.dateModified || 0) < this.meta.dateModified) {
            const res = confirm(
                `Trying to load older version of metadata from ${new Date(metadata.dateModified)}\n` +
                `Is this ok?`
            );
            if (!res) return;
        }

        this.setMetadataInternal(metadata);
    }

    //
    // TODO keyboard shortcuts
    //

    private onKeyDown(evt): void {

    }

    private onKeyUp(e): void {

    }


    //
    // timekeeping logic
    //

    private stepForward(): void {
        this.fwdInd.css({opacity: 1});
        clearTimeout(this.fwdIndTimer);
        this.fwdIndTimer = setTimeout(() => this.fwdInd.css({opacity: 0}), 200);
        this.videoElm.pause();
        this.seekFrame(this.curFrame+1);
    }

    private stepBackward(): void {
        this.bkdInd.css({opacity: 1});
        clearTimeout(this.bkIndTimer);
        this.bkIndTimer = setTimeout(() => this.bkdInd.css({opacity: 0}), 200);
        this.videoElm.pause();
        this.seekFrame(this.curFrame-1);
    }

    private toTime(frame: number): number {
        return frame / this.viewingFps;
    }

    //finds the nearest frame to a time
    private toFrame(t: number): number {
        return Math.round(t * this.viewingFps);
    }

    private get curFrame(): number {
        return this.toFrame(this.videoElm.currentTime);
    }

    private get curTime(): number {
        return this.videoElm.currentTime;
    }

    private onFpsSelected() {
        this.viewingFps=Number.parseFloat(this.fpsSelect.val() as string);
    }

    private _viewingFps:number;

    private get viewingFps():number{
        return this._viewingFps;
    }

    private set viewingFps(fps:number){
        this._viewingFps=fps;
        this.updateBookmarkList();
        this.onFrameChange();
    }

    private onHashChange() {
        const res = Number.parseFloat(window.location.hash.slice(1));
        if (Number.isNaN(res)) {
            this.videoElm.currentTime = 0;
        } else {
            this.videoElm.currentTime = res;
        }
    }

    private seekTime(time: number): void {
        window.location.hash = time.toString();
    }

    private seekFrame(frame:number):void{
        this.seekTime(this.toTime(frame));
    }

    private onFrameChange(): void {
        this.timeInd.text(this.curFrame);
        this.updateCurrentBookmarkView(true);
    }

    public setPlaybackSpeed(speed: number) {
        this.videoElm.playbackRate = speed;
        this.spdInd.text(speed);
    }
}
