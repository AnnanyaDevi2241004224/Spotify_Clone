console.log('hiiiiiiiiii');
let currentsong = new Audio();
let songs;
let currfolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let n = song.replaceAll("%20", " ");
        songUL.innerHTML = songUL.innerHTML + `
        <li><img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div class="name">
                                    ${n}
                                </div>
                                <div class="artist">
                                    artist
                                </div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play1.svg" alt="" srcset="">
                            </div>
                        </li>`;
    }
    let arr = document.querySelector(".songList").getElementsByTagName("li");
    arr = Array.from(arr);
    for (const e of arr) {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    }

    return songs;
}

const playMusic = (track, pause = false) => {
    currentsong.src = `${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.includes("/songs/")) {

            let folder = element.href.split("/songs/")[1];
            let a = await fetch(`http://192.168.43.70:56254/songs/${folder}/info.json`);
            // 192.168.43.70:56254
            //127.0.0.1:5500
            let response = await a.json();
            let cardcontainer = document.querySelector(".cardContainer");
            cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="img/play.svg" alt="">
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="" width="180" height="300">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`;
        }
    }

    // Resolve the promise after all albums are displayed
    return Promise.resolve();
}

async function main() {
    await displayAlbums();
    songs = await getSongs("songs/MyRecordings");
    playMusic(songs[0], true);

    // Add event listeners to the cards after they are created
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        });
    });

    document.getElementById("play").addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    });

    document.getElementById("prev").addEventListener("click", () => {
        let x = currentsong.src.split("/");
        let t = x[x.length - 1];
        let index = songs.indexOf(t);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        let x = currentsong.src.split("/");
        let t = x[x.length - 1];
        let index = songs.indexOf(t);

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let y = e.offsetX / e.target.getBoundingClientRect().width * 100;
        document.querySelector(".circle").style.left = y + "%";
        currentsong.currentTime = (currentsong.duration * y) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-130%";
    });

    document.querySelector("#vol_range").addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
        if (currentsong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    });

    document.querySelector(".volume> img").addEventListener("click",e=>{
        console.log(e.target);
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
        
    })
}

main();
