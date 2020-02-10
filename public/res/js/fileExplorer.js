$( document ).ready(init)

let display;
let currentPathDisplay;

function init(){
    display = $("#folderView");
    currentPathDisplay = $("#currentPath")
    currentPathDisplay
}

function loadEntries(path, entries){
    display.empty()
    for (k in entries){
        const entry = entries[k]
        const entryDiv = document.createElement("div")
        entryDiv.className = "entry"
        const preview = document.createElement("div")
        preview.className = "preview "
        preview.className +=  
            entry.type === "file" ? (
                entry.isImage ? 
                    "" :
                    "fa fa-file"
                ) :
                "fa fa-folder"
        if (entry.isImage){
            const img = document.createElement("img")
            img.src = "/"+entry.path
            preview.append(img)
        }
        const name = document.createElement("div")
        entryDiv.append(preview)
        entryDiv.append(name)
        
        name.className = "name"
        name.textContent = entry.name;

        display.append(entryDiv);
    }
}
