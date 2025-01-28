let currentsong = new Audio()
let songs;
let currfolder;
async function getsongs(folder) {
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
  currfolder = folder;
  let response = await a.text();
  // console.log(response);
  let div = document.createElement("div")
  div.innerHTML = response;
  let lis = div.getElementsByTagName("a")
  // console.log(lis);
    songs = [];
  for (let index = 0; index < lis.length; index++) {
    const element = lis[index];
    if(element.href.endsWith(".mp3")){
      songs.push(element.href)
    }
  }
  let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
  songul.innerHTML = ""
  for (const song of songs) {
    songul.innerHTML = songul.innerHTML + `<li>
    <img src="img/music.svg" alt="">
    <div class="info">
    <div>${song.replaceAll("%20"," ").replaceAll(".mp3" , "").split(`/${folder}/`)[1]}</div>
    </div> 
    </li>`
  }                                         

  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", ()=>{
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playmusic(`${e.querySelector(".info").firstElementChild.innerHTML}.mp3`)    
    })
  }) 
  return songs
}

let playmusic=(track)=>{
    currentsong.src = `/${currfolder}/` +  track;
    currentsong.play()
    play.src = "img/pause.svg"
    document.querySelector(".songname").innerHTML= track.replaceAll("mp3", "").replaceAll(".", "").replaceAll("%20", " ")
    document.querySelector(".songtime").innerHTML= currentsong.duration;
    document.querySelector(".playbar").style.display = 'block'; 
  }

async function main(){
 songs =  await getsongs("songs/English_Songs")
  display_albums()
}

document.querySelector("#play").addEventListener("click" ,element=>{
  if(currentsong.paused){
    currentsong.play()
    play.src = "img/pause.svg"
  }
  else{
    currentsong.pause()
    play.src = "img/play2.svg"
  }
})

currentsong.addEventListener("timeupdate", ()=>{
  document.querySelector(".songtime").innerHTML = `${secondstominutes(currentsong.currentTime)} / ${secondstominutes(currentsong.duration)}`
  document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
})

document.querySelector(".seekbar").addEventListener("click", e=>{
  let percent = (e.offsetX / e.target.getBoundingClientRect().width)* 100
  document.querySelector(".circle").style.left = percent + "%";
  currentsong.currentTime = ((currentsong.duration) * percent)/100
})


document.querySelector("#minus").addEventListener("click" , element=>{
  currentsong.currentTime = currentsong.currentTime - 10;
})

document.querySelector("#plus").addEventListener("click" , element=>{
  currentsong.currentTime = currentsong.currentTime + 10;
})

document.querySelector(".hamburger").addEventListener("click" ,element=>{
  document.querySelector(".left").style.left = '0'
})

document.querySelector(".close").addEventListener("click" ,element=>{
  document.querySelector(".left").style.left = '-100%'
})

document.querySelector("#previous").addEventListener("click", element=>{
  console.log("previous was clicked");
  change_song('prev');
})

document.querySelector("#next").addEventListener("click", element=>{
  console.log("Next was clicked");
  change_song('next');
})

let isMute = false
let curr_song_vol = currentsong.volume;
document.querySelector(".volume").querySelector(".vol_img").addEventListener("click",e=>{
  if(!isMute) {
    currentsong.volume = (0)
    document.querySelector(".vol_img").src="img/volume_mute.svg"
    isMute = true;
  } else {
    currentsong.volume = curr_song_vol;
    document.querySelector(".vol_img").src="img/volume.svg"
    isMute = false
  }
})

document.querySelector(".volume").querySelector(".volrange").addEventListener("change",e=>{
  console.log("The Volume is",e.target.value);
  currentsong.volume = parseInt(e.target.value)/100;
  if(currentsong.volume == (0)) {
    document.querySelector(".vol_img").src="img/volume_mute.svg"
  } else if(currentsong.volume > (0) && currentsong.volume <= (0.5)) {
    document.querySelector(".vol_img").src="img/volume50.svg"
  }
  else {
    document.querySelector(".vol_img").src="img/volume.svg"
  }
})

function change_song(type) { 
  // Get current playing song index
  let song_index = songs.indexOf(currentsong.src)
  let i;
  if(type == 'next') { 
    i=1;
    // Edge case while clicking next at end of the songs list
    if(song_index == songs.length - 1){
      song_index = -1;
    }
  } else if(type == 'prev') {
    i=-1;
    // Edge case while clicking prev at the start of the songs list
    if(song_index == 0){
      song_index = 1;
    }
  } else{
    console.error("Type Not Defined");
    return ;
  }

  // Get updated song name 
  let upd_song_name = songs[song_index+i].split('/').slice(-1)[0].replaceAll('%20',' ');
  playmusic(upd_song_name)
}

function secondstominutes(seconds){
  if(isNaN(seconds)|| (seconds) < 0){
    return "00.00";
  }

  let minutes = Math.floor(seconds/60);
  let remainingseconds =  Math.floor(seconds % 60);

  let formattedminutes = String(minutes).padStart(2, '0');
  let formattedseconds = String(remainingseconds).padStart(2, '0');

  return `${formattedminutes}:${formattedseconds}`;
}

async function display_albums(){
  let a = await fetch("http://127.0.0.1:5500/songs/")
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let anchors= div.getElementsByTagName("a")
  let card_container = document.querySelector(".cards")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++){
    const e = array[index];
    if(e.href.includes("/songs/")){
      let folder= e.href.split("/songs/")[1];
      console.log(folder);
      
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
      let response = await a.json();
      card_container.innerHTML = card_container.innerHTML + `<div data-folder="${folder}" class="album">
            <div class="albumimg" style="background-image: url('/songs/${folder}/cover.jpg');">
            <img class="play" src="img/play.svg" width="20px" alt="Playimg">
          </div>
          <h2>${response.title}</h2>
          <p class="albumtext">${response.description}</p>        
        </div>` 
    }
  }
    Array.from(document.getElementsByClassName("album")).forEach(e=>{
      e.addEventListener("click", async e=>{
        console.log(e.currentTarget.dataset.folder);        
        songs =  await getsongs(`songs/${e.currentTarget.dataset.folder}`)
        document.querySelector(".playbar").style.display = 'block'; 
        let song_zero = songs[0].split(currfolder)[1].replaceAll("%20"," ").replace("/","");
        console.log(song_zero);
        playmusic(song_zero)
      })
    })
  }

main();
