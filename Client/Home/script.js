window.onload = FetchArchives();

document.getElementById('new-archive-input').addEventListener('keypress', function(e){
    if(e.keyCode == 13) NewArchive();
});
document.getElementById('new-archive-btn').addEventListener('click', NewArchive);

async function FetchArchives(){
    var response = await fetch('/getSuperArchives', {
        method: "POST",
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({})
    });
    if(response.status == 200){
        var responseData = await response.json();
        for(var i=0; i<responseData.length; i++){
            DisplayArchive(responseData[i].Name, responseData[i].UUID);
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
            body: JSON.stringify({Name: name, ParentArchive: null})
        });
        if(response.status == 200){
            var responseData = await response.json();
            DisplayArchive(name, responseData.UUID)
        }
    }
}
function DisplayArchive(name, uuid){
    var archiveElement = document.createElement('div');
    archiveElement.className = "archive";
    archiveElement.setAttribute('uuid', uuid);
    archiveElement.innerHTML = `
    <h3>${name}</h3>
    <p>${uuid}</p>`;
    document.getElementById('archives-container').appendChild(archiveElement);
    archiveElement.addEventListener('click', function(e){
        e.stopImmediatePropagation()
        window.location.href = `/archive/${uuid}`;
    });
}