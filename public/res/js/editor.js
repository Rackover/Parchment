let isSaving = false;
let textZone, simplemde;
const submissionURL = "/submit"

const toolbarFile = {
    "name": "file",
    "action": function(editor){
        // Shows file browser
        show(function(txt){editor.codemirror.replaceSelection(txt)})
    },
    "title": "Insert file...",
    "className": "fa fa-file"
}

const toolbarSave = {
    "name": "save",
    "action": function (editor){
        saveFunction(editor, false)
    },
    "title": "Save",
    "className": "fa fa-save saveButton"
}

const toolbarSubmit = {
    "name": "submit",
    "action": function (editor){
        saveFunction(editor, true)
    },
    "title": "Submit",
    "className": "fa fa-step-forward saveButton submitButton"
}

const toolbarHeading = {
    "name":"heading",
    "action": SimpleMDE.toggleHeadingSmaller,
    "title": "Heading",
    "className": "fa fa-heading"
}

const toolbarImage = {
    "name":"image",
    "action": function (editor){
        var cm = editor.codemirror;
        var stat = SimpleMDE.getState(cm);
        var options = editor.options;
        var url = "http://";
        if(options.promptURLs) {
            url = prompt(options.promptTexts.image);
            if(!url) {
                return false;
            }
        }
        
        editor.replaceSelection(encodeURI(url));
    },
    "title": "Insert Image",
    "className": "fa fa-image"
}

const toolbar =  [
    "bold", 
    "italic" ,
    toolbarHeading, 
    "|",  ///////////////
    "table", 
    "ordered-list", 
    "unordered-list",
    "|", ///////////////
    "link",
    toolbarImage,
    toolbarFile,
    "|", ///////////////
    "preview",
    "side-by-side",
    "fullscreen",
    "|",
    toolbarSave,
    "|",
    toolbarSubmit
]

window.addEventListener("DOMContentLoaded", (event) => {

    textZone = document.getElementById("editor");
    simplemde = new SimpleMDE(
        { 
            element: textZone,
            promptURLs: true,
            autofocus: true,
            toolbar: toolbar,
            autoDownloadFontAwesome: false,
            spellChecker: false
        }
    );

    const codemirror = simplemde.codemirror;
    // get shortcuts list
    const keys = codemirror.getOption("extraKeys");
    keys["Ctrl-S"] = () => { 
        saveFunction(simplemde, false)
    };

    // Autosave
    setTimeout(()=>{saveFunction(simplemde, false);}, 1000 * 60 * 5);

    // update shortcuts list
    codemirror.setOption("extraKeys", keys);

});
  
function saveFunction(editor, submit=false){
    if (isSaving) return;
    
    const element = editor.codemirror.getWrapperElement()

    element.className += " saving";
    editor.codemirror.options.readOnly = "nocursor"
    isSaving = true;
    const buttons = Array.from(document.getElementsByClassName("saveButton"));
    
    buttons.forEach((e) => {
        e.className += " saving";
    })

    $.post(submissionURL, {
        virtualPath: window.location.pathname.replace("/write/", "/"),
        data: editor.value()
    }, function(data, txtStatus){
        if (data.code === 200){
            if (submit){
                $(window).unbind('beforeunload')
                window.location = window.location.pathname.replace("/write/", "/read/")
            }
            else{
                isSaving = false;
                editor.codemirror.options.readOnly = false
                buttons.forEach((e) => {
                    e.className = e.className.replace("saving", "")
                })
                element.className =  element.className.replace("saving", "")
            }
        }
        else{
            isSaving = false;
            editor.codemirror.options.readOnly = false
            buttons.forEach((e) => {
                e.className = e.className.replace("saving", "")
            })
            element.className =  element.className.replace("saving", "")
            alert("There was an error saving the content. Code "+data.code+"\n"+data.content)
        }
    })
}

$(window).bind('beforeunload', function(){
    return 'Are you sure you want to leave?';
});


