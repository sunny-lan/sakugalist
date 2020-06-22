import {FocusHandler, JQE} from "./util";

export interface MetadataEditorValues{
    fps:number;
    animator:string;
    tags:string;
    show:string;
    episode:string;
    description:string;
}

interface MetadataSaveHandler {
    (newMeta: MetadataEditorValues);
}

const html = `
<div class="metadataEditor">
    Description: <input class="description">
    Animator: <input class="animator">
    Tags: <input class="tags">
    FPS: <input class="fps">
    Show: <input class="show">
    Episode: <input class="episode">
</div>
`;

export class MetadataEditor {
    private handler?: MetadataSaveHandler;
    public readonly ui: JQE;
    private animator: JQE;
    private tags: JQE;
    private fps: JQE;
    private show: JQE;
    private episode: JQE;
    private description: JQE;

    constructor() {
        const ui=this.ui = $(html);

        this.ui.find('*').change(()=>this.saveData());

        this.animator = ui.find('.animator');
        this.tags = ui.find('.tags');
        this.fps = ui.find('.fps');
        this.show = ui.find('.show');
        this.episode = ui.find('.episode');
        this.description = ui.find('.description');

        this.disabled(true);
    }

    private saveData() {
        if(this.handler){
            this.handler({
                description: this.description.val() as string,
                animator: this.animator.val() as string,
                tags: this.tags.val() as string,
                fps: Number.parseFloat(this.fps.val() as string),

                show: this.show.val() as string,
                episode: this.episode.val() as string,
            });
        }else{
            throw new Error('this should never happen');
        }
    }

    public setMetadata(meta: MetadataEditorValues) {
        this.animator.val(meta.animator);
        this.tags.val(meta.tags);
        this.fps.val(meta.fps);
        this.show.val(meta.show);
        this.episode.val(meta.episode);
        this.description.val(meta.description);
    }

    public setSaveHandler(handler: MetadataSaveHandler) {
        this.handler = handler;
        this.disabled(false );
    }

    public disabled(val:boolean){
        this.ui.find('*').prop('disabled', val);
    }

    public focus(handler:FocusHandler){
        this.ui.find('*').focus(handler);
    }

    public focusout(handler:FocusHandler){
        this.ui.find('*').focusout(handler);
    }
}
