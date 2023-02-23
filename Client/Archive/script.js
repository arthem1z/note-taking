var ArchiveUUID;

window.onload = GetArchive();

document.getElementById('new-archive-input').addEventListener('keypress', function(e){
    if(e.keyCode == 13) NewArchive();
});
document.getElementById('new-archive-btn').addEventListener('click', NewArchive);


async function GetArchive(){
    var response = await fetch('/getArchive', {
        method: "POST",
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({UUID: GetArchiveUUID()})
    });
    if(response.status == 200){
        var responseData = await response.json();
        ArchiveUUID = responseData.UUID;
        document.getElementById("back-btn").addEventListener('click', function(e){
            e.stopImmediatePropagation();
            if(responseData.ParentArchive){
                window.location.href = `/archive/${responseData.ParentArchive}`;
            }else{
                window.location.href = '/';
            }
        });
        document.getElementById("title").innerHTML += `<u>${responseData.Name}</u>`;
        document.title = 'Archive |' + responseData.Name;
        for(var i=responseData.ChildArchives.length-1; i>=0; i--){
            document.getElementById("children-archives").innerHTML += `<div class="archive" uuid="${responseData.ChildArchives[i].UUID}">${responseData.ChildArchives[i].Name}</div>`;
            var ChildArchiveUUID = responseData.ChildArchives[i].UUID
            document.getElementById("children-archives").lastElementChild.addEventListener('click', function(e){
                e.stopImmediatePropagation();
                window.location.href = `/archive/${ChildArchiveUUID}`;
            });
        }
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
            DisplayArchive(name, responseData.UUID)
        }
    }
}
function DisplayArchive(name, uuid){
    document.getElementById("children-archives").innerHTML = `<div uuid="${uuid}">${name}</div>` + document.getElementById("children-archives").innerHTML;
    document.getElementById("children-archives").lastElementChild.addEventListener('click', function(e){
        e.stopImmediatePropagation();
        window.location.href = `/archives/${uuid}`;
    })
}
function GetArchiveUUID(){
    return ((window.location.href).split('/').splice(-1)[0]);
}