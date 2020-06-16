export interface AjaxError {
    xhr:JQueryXHR;
    textStatus:string;
    errorThrown:string;
}

export async function ajax(settings:JQueryAjaxSettings) {
    return new Promise((resolve, reject) => {
        $.ajax({
            ...settings,
            error: (xhr, textStatus, errorThrown)=>{
                reject({xhr, textStatus, errorThrown} as AjaxError);
            },
            success: resolve
        });
    });
}
