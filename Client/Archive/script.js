var ArchiveUUID;

window.onload = GetArchive();
window.onload = GetNotes();
window.onload = UpdateNotes();

window.addEventListener('beforeunload', async function(e){
    await UpdateNotes();
    e.returnValue = '';
});
document.getElementById('new-archive-input').addEventListener('keypress', function(e){
    if(e.keyCode == 13) NewArchive();
});
document.getElementById('new-archive-btn').addEventListener('click', NewArchive);
document.getElementById("new-note-btn").addEventListener('click', NewNote)

async function GetArchive(){
    var response = await fetch('/getArchive', {
        method: "POST",
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({UUID: GetArchiveUUID()})
    });
    if(response.status == 200){
        var responseData = await response.json();
        ArchiveUUID = responseData.UUID;
        document.getElementById("back-btn").addEventListener('click', async function(e){
            e.stopImmediatePropagation();
            if(responseData.ParentArchive){
                await UpdateNotes();
                window.location.href = `/archive/${responseData.ParentArchive}`;
            }else{
                await UpdateNotes();
                window.location.href = '/';
            }
        });
        document.getElementById("delete-archive-btn").addEventListener('click', async function(e){
            e.stopImmediatePropagation();
            var deleteResponse = await fetch('/deleteArchive', {
                method: "DELETE",
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({UUID: GetArchiveUUID()})
            });
            if(deleteResponse.status == 200){
                if(responseData.ParentArchive){
                    window.location.href = `/archive/${responseData.ParentArchive}`;
                }else{
                    window.location.href = '/';
                }    
            }
        });        
        document.getElementById("title").innerHTML += `<u>${responseData.Name}</u>`;
        document.title = 'Archive | ' + responseData.Name;
        for(var i=responseData.ChildArchives.length-1; i>=0; i--){
            document.getElementById("children-archives").innerHTML += `<div class="archive" uuid="${responseData.ChildArchives[i].UUID}">${responseData.ChildArchives[i].Name}</div>`;
        }
        LinkArchives();
    }
}
async function NewArchive(){
    var name = document.getElementById("new-archive-input").value;
    document.getElementById("new-archive-input").value = "";
    if(name != ""){
        var response = await fetch('/newArchive', {
            method: "PUT",
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({Name: name, ParentArchive: ArchiveUUID})
        });
        if(response.status == 200){
            var responseData = await response.json();
            DisplayArchive(name, responseData.UUID);
            LinkArchives();
        }
    }
}
function DisplayArchive(name, uuid){
    document.getElementById("children-archives").innerHTML = `<div class="archive" uuid="${uuid}">${name}</div>` + document.getElementById("children-archives").innerHTML;
}
function GetArchiveUUID(){
    return ((window.location.href).split('/').splice(-1)[0]);
}
function LinkArchives(){
    var archives = document.getElementsByClassName("archive");
    for(var i=0; i<archives.length; i++){
        archives[i].addEventListener('click', async function(e){
            e.stopImmediatePropagation();
            await UpdateNotes();
            window.location.href = `/archive/${this.getAttribute('uuid')}`;
        });
    }
}
async function GetNotes(){
    var response = await fetch('/getNotes', {
        method: "POST",
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({ArchiveUUID: GetArchiveUUID()})
    });
    if(response.status == 200){
        var responseData = await response.json();
        for(var i=0; i<responseData.length; i++){
            DisplayNote(responseData[i].id, responseData[i].DateCreated, responseData[i].Text)
        }
        var deleteNoteBtn = document.getElementsByClassName('delete-note-btn');
        for(var i=0; i<deleteNoteBtn.length; i++){
            deleteNoteBtn[i].addEventListener('click', function(e){
                e.stopImmediatePropagation();
                DeleteNote(this.parentElement.parentElement.getAttribute('note-id'));
            });
        }
    }
}
function DisplayNote(id, date, text){
    var noteDate = new Date(date);
    document.getElementById("notes-container").innerHTML = `<div class="note" note-id="${id}"><div class="note-header"><p class="delete-note-btn">&#10006</p><p class="note-id">${id}</p><p class="note-date">${noteDate.toUTCString()}</p></div><div class="textarea" contenteditable="true">${text}</div></div>` + document.getElementById("notes-container").innerHTML;
}
async function NewNote(){
    var response  = await fetch('/newNote', {
        method: "PUT",
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({ArchiveUUID: GetArchiveUUID()})
    });
    if(response.status == 200){
        var responseData = await response.json();
        DisplayNote(responseData.id, responseData.DateCreated, "");
        var deleteNoteBtn = document.getElementsByClassName('delete-note-btn');
        for(var i=0; i<deleteNoteBtn.length; i++){
            deleteNoteBtn[i].addEventListener('click', function(e){
                e.stopImmediatePropagation();
                DeleteNote(this.parentElement.parentElement.getAttribute('note-id'));
            });
        }
    }
}
async function UpdateNotes(){
    //Get all the data and store it in JSON
    var notes = document.getElementsByClassName("note");
    var notesData = [];
    for(var i=0; i<notes.length; i++){
        notesData.push({id: (notes[i].getAttribute("note-id")), text: notes[i].getElementsByClassName("textarea")[0].innerHTML});
    }
    //Request server
    var response = await fetch('/updateNotes', {
        method: "PUT",
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({data: notesData})
    });
    if(response.status == 200){
        setTimeout(UpdateNotes, 1000);
    }
}
async function DeleteNote(id){
    var response = await fetch('/deleteNote', {
        method: "DELETE",
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({NoteID: id})
    });
    if(response.status == 200){
        document.querySelector(`div[note-id="${id}"]`).remove();
    }
}