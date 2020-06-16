import {Bookmark} from "../interfaces/Video";
import {JQE} from "./util";

type AddHandler=(bk:BookmarkUpdate)=>void;
type RemoveHandler=(bk:Bookmark)=>void;
type FocusHandler=()=>void;

export interface BookmarkUpdate {
    tags:string;
    comment:string;
}

const html=`
<div class="bookmark-editor">
    <button class="bookmark-toggle">loading...</button>
    Comment
    <textarea class="bookmark-comment"></textarea>
    Tags
    <input class="bookmark-tags">
</div>
`;

export class BookmarkEditor{
    public readonly ui:JQE;
    private tags: JQE;
    private comment: JQE;
    private onAdd: AddHandler;
    private onRemove: RemoveHandler;
    private selected?:Bookmark;
    private toggle: any;

    constructor(onAdd:AddHandler, onRemove:RemoveHandler){
        this.ui=$(html);
        this.tags=this.ui.find('.bookmark-tags');
        this.comment=this.ui.find('.bookmark-comment');
        this.toggle=this.ui.find('.bookmark-toggle');
        this.toggle.click(()=>this.handleToggle());
        this.onAdd=onAdd;
        this.onRemove=onRemove;
    }

    public focus(handler:FocusHandler){
        this.ui.find('*').focus(handler);
    }

    public focusout(handler:FocusHandler){
        this.ui.find('*').focusout(handler);
    }

    private handleToggle(){
        if(this.selected){
            this.onRemove(this.selected);
        }else{
            this.onAdd({
                tags:this.tags.val() as string,
                comment:this.comment.val() as string,
            });
        }
    }

    public select(bk:Bookmark):void{
        this.selected=bk;
        this.tags.val(bk.tags);
        this.comment.val(bk.comment);


        this.tags.prop('disabled', true);
        this.comment.prop('disabled', true);
        this.toggle.text('unbookmark');
    }

    public clear(keepOldData:boolean):void{
        this.selected=undefined;
        if(!keepOldData){
            this.tags.val('');
            this.comment.val('');
        }
        this.tags.prop('disabled', false);
        this.comment.prop('disabled', false);
        this.toggle.text('bookmark');
    }


}
