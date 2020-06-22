import {Bookmark} from "../shared/Video";
import {FocusHandler, JQE} from "./util";
import {formatTime} from "../shared/util";

type AddHandler = (bk: BookmarkUpdate) => void;
type RemoveHandler = (bk: Bookmark) => void;

interface BookmarkUpdate {
    tags: string;
    comment: string;
    animator?: string;
    includeInRandomize?:boolean;
}

const html = `
<div class="bookmarkEditor">
    <button class="toggle">loading...</button>
    Comment
    <textarea class="comment textInput inputField"></textarea>
    Tags
    <input class="tags textInput inputField">
    Animator
    <input class="animator textInput inputField">
    <input class="includeInRandomize inputField" type="checkbox" value="Include in randomize">
    
    <button class="clearText textInput inputField">Clear</button>
</div>
`;

export class BookmarkEditor {
    public readonly ui: JQE;
    private tags: JQE;
    private comment: JQE;
    private onAdd: AddHandler;
    private onRemove: RemoveHandler;
    private selected?: Bookmark;
    private toggle: JQE;
    private animator: JQE;
    private includeInRandomize: JQE;

    constructor(onAdd: AddHandler, onRemove: RemoveHandler) {
        this.ui = $(html);
        this.tags = this.ui.find('.tags');
        this.animator = this.ui.find('.animator');
        this.comment = this.ui.find('.comment');
        this.toggle = this.ui.find('.toggle');
        this.includeInRandomize=this.ui.find('.includeInRandomize');
        this.toggle.click(() => this.handleToggle());
        this.ui.find('.clearText').click(() => this.clearText());

        this.onAdd = onAdd;
        this.onRemove = onRemove;
    }

    public focus(handler: FocusHandler) {
        this.ui.find('*').focus(handler);
    }

    public focusout(handler: FocusHandler) {
        this.ui.find('*').focusout(handler);
    }

    private handleToggle() {
        if (this.selected) {
            this.onRemove(this.selected);
        } else {
            this.onAdd({
                tags: this.tags.val() as string,
                comment: this.comment.val() as string,
                animator: this.animator.val() as string,
                includeInRandomize: this.includeInRandomize.prop('checked')
            });
        }
    }

    public select(bk: Bookmark): void {
        this.selected = bk;
        this.tags.val(bk.tags);
        this.comment.val(bk.comment);


        this.ui.find('.inputField').prop('disabled', true);
        this.toggle.text(`unbookmark`);
    }

    public clearText(): void {
        this.ui.find('.textInput').val('');

        this.ui.find('.includeInRandomize').prop('checked', false);
    }

    public clear(keepOldData: boolean): void {
        this.selected = undefined;
        if (!keepOldData) {
            this.clearText();
        }

        this.ui.find('.inputField').prop('disabled', false);
        this.toggle.text('bookmark');
    }


}
