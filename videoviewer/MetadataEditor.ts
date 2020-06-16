import {VideoMetadata} from "../interfaces/Video";
import {JQE} from "./util";

interface MetadataEditorUpdate{
    fps:number;
    animator:string;
    tags:string;
    show:string;
    episode:string;
}

interface MetadataSaveHandler {
    (newMeta: MetadataEditorUpdate);
}

const html = `
Animator: <input class="metadata-animator">
Tags: <input class="metadata-tags">
FPS: <input class="metadata-fps">
Show: <input class="metadata-show">
Episode: <input class="metadata-episode">
<button class="metadata-save">save</button>
`;

export class MetadataEditor {
    private handler?: MetadataSaveHandler;
    private ui: JQE;
    private animator: JQE;
    private tags: JQE;
    private fps: JQE;
    private show: JQE;
    private episode: JQE;

    constructor(ui: JQE) {
        this.ui = ui;
        this.ui.html(html);

        const saveBtn: JQE = ui.find('.metadata-save');
        saveBtn.click(() => this.onSaveClicked());

        this.animator = ui.find('.metadata-animator');
        this.tags = ui.find('.metadata-tags');
        this.fps = ui.find('.metadata-fps');
        this.show = ui.find('.metadata-show');
        this.episode = ui.find('.metadata-episode');

        this.disabled(true);
    }

    private onSaveClicked() {
        if(this.handler){
            this.handler({
                animator: this.animator.val() as string,
                tags: this.tags.val() as string,
                fps: Number.parseFloat(this.fps.val() as string),

                show: this.show.val() as string,
                episode: this.episode.val() as string,
            });
        }
    }

    public setMetadata(meta: VideoMetadata) {
        this.animator.val(meta.animator);
        this.tags.val(meta.tags);
        this.fps.val(meta.fps);
        this.show.val(meta.show);
        this.episode.val(meta.episode);
    }

    public setSaveHandler(handler: MetadataSaveHandler) {
        this.handler = handler;
        this.disabled(false );
    }

    public disabled(val:boolean){
        this.animator.prop('disabled', val);
        this.fps.prop('disabled', val);
        this.tags.prop('disabled', val);
    }
}