const toolbarFile = {
    "name": "file",
    "action": function(editor){

    },
    "title": "Insert file...",
    "className": "fa fa-file"
}

const toolbarSave = {
    "name": "save",
    "action": function(editor){

    },
    "title": "Save",
    "className": "fa fa-save saveButton"
}

const toolbar =  [
    "bold", 
    "italic" ,
    "heading", 
    "|",  ///////////////
    "table", 
    "ordered-list", 
    "unordered-list",
    "|", ///////////////
    "link",
    "image",
    toolbarFile,
    "|", ///////////////
    "preview",
    "side-by-side",
    "fullscreen",
    "|",
    toolbarSave
]

window.addEventListener("DOMContentLoaded", (event) => {

    const textZone = document.getElementById("editor");

    const simplemde = new SimpleMDE(
        { 
            element: textZone,
            promptURLs: true,
            autofocus: true,
            toolbar: toolbar
        }
    );
});
  