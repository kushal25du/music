/* =====================================================
   DATA STRUCTURE SECTION
   Circular Doubly Linked List
===================================================== */

/* Node represents each media file */
class Node{
    constructor(name,url){
        this.name=name;
        this.url=url;
        this.next=null;
        this.prev=null;
    }
}

/* Playlist manages linked list operations */
class Playlist{

    constructor(){
        this.head=null;
        this.size=0;
    }

    /* Add new media */
    add(name,url){

        const node=new Node(name,url);

        if(!this.head){
            this.head=node;
            node.next=node;
            node.prev=node;
        }
        else{
            const tail=this.head.prev;

            tail.next=node;
            node.prev=tail;

            node.next=this.head;
            this.head.prev=node;
        }

        this.size++;
    }

    /* Delete node safely */
    delete(node){

        if(this.size===1){
            this.head=null;
        }
        else{
            node.prev.next=node.next;
            node.next.prev=node.prev;

            if(node===this.head)
                this.head=node.next;
        }

        this.size--;
    }

    /* Get node by index */
    get(index){

        let temp=this.head;
        let count=0;

        do{
            if(count===index) return temp;
            temp=temp.next;
            count++;
        }while(temp!==this.head);

        return null;
    }
}

/* =====================================================
   PLAYER LOGIC
===================================================== */

const playlist=new Playlist();
let current=null;

const audio=document.getElementById("audioPlayer");
const video=document.getElementById("videoPlayer");
const queueDiv=document.getElementById("queue");

/* Handle file upload */
document.getElementById("fileInput").addEventListener("change",e=>{

    Array.from(e.target.files).forEach(file=>{
        playlist.add(file.name,URL.createObjectURL(file));
    });

    if(!current)
        current=playlist.head;

    loadMedia(current);
    renderQueue();
    renderLeftQueue();
});

/* Choose audio or video player */
function loadMedia(node){

    if(node.name.toLowerCase().endsWith(".mp4")){
        audio.style.display="none";
        video.style.display="block";
        video.src=node.url;
    }
    else{
        video.style.display="none";
        audio.style.display="block";
        audio.src=node.url;
    }

    renderQueue();
    renderLeftQueue();
}

/* Playback Controls */

function play(){
    if(!current) return;
    current.name.endsWith(".mp4") ? video.play() : audio.play();
}

function pause(){
    audio.pause();
    video.pause();
}

function stop(){
    audio.pause();
    video.pause();
    audio.currentTime=0;
    video.currentTime=0;
}

function next(){
    current=current.next;
    loadMedia(current);
    play();
}

function previous(){
    current=current.prev;
    loadMedia(current);
    play();
}

/* =====================================================
   UI RENDERING
===================================================== */

function renderQueue(){

    queueDiv.innerHTML="";
    if(!playlist.head) return;

    let temp=playlist.head;
    let i=0;

    do{

        const div=document.createElement("div");
        div.className="queue-item";

        if(temp===current)
            div.classList.add("active");

        div.innerHTML=`
        <span>${temp===current ? "▶ " : ""}${i+1}. ${temp.name}</span>

        <div>
            <button onclick="selectSong(${i})">Play</button>
            <button onclick="moveUp(${i})">⬆</button>
            <button onclick="moveDown(${i})">⬇</button>
            <button onclick="deleteSong(${i})">❌</button>
        </div>
        `;

        queueDiv.appendChild(div);

        temp=temp.next;
        i++;

    }while(temp!==playlist.head);
}

/* Rotated left playlist */
function renderLeftQueue(){

    const leftDiv=document.getElementById("leftQueue");
    leftDiv.innerHTML="";

    if(!current) return;

    let temp=current;
    let count=0;

    do{

        const div=document.createElement("div");
        div.className="left-song";

        div.innerHTML = `${temp===current ? "▶ " : ""}${temp.name}`;

        leftDiv.appendChild(div);

        temp=temp.next;
        count++;

    }while(temp!==current && count<playlist.size);
}

/* =====================================================
   QUEUE ACTIONS
===================================================== */

function selectSong(i){
    current=playlist.get(i);
    loadMedia(current);
    play();
}

function deleteSong(i){

    const node=playlist.get(i);

    if(node===current)
        current=node.next!==node ? node.next : null;

    playlist.delete(node);

    if(current)
        loadMedia(current);

    renderQueue();
    renderLeftQueue();
}

function moveUp(i){

    const node=playlist.get(i);
    if(node===playlist.head) return;

    const prev=node.prev;

    [node.name,prev.name]=[prev.name,node.name];
    [node.url,prev.url]=[prev.url,node.url];

    renderQueue();
    renderLeftQueue();
}

function moveDown(i){

    const node=playlist.get(i);
    if(node.next===playlist.head) return;

    const next=node.next;

    [node.name,next.name]=[next.name,node.name];
    [node.url,next.url]=[next.url,node.url];

    renderQueue();
    renderLeftQueue();
}

/* Auto loop */
audio.addEventListener("ended",next);
video.addEventListener("ended",next);

/* Playlist rename */
function updatePlaylistName(){
    document.getElementById("playlistTitle").innerText =
        document.getElementById("playlistInput").value || "My Playlist";
}
