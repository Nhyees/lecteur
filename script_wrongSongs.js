let musicData = [];
let currentIndex = 0;
let savedVolume = 0.3;
let isShuffle = false;

const audioPlayer = document.getElementById("audioPlayer");
const musicList = document.getElementById("musicList");

//--Charger les données----------
function loadPlaylist() {
    const savedPlaylist = localStorage.getItem("playlist");
    if (savedPlaylist) {
        musicData = JSON.parse(savedPlaylist);
    }
    displayMusicList();
}

window.onload = loadPlaylist;
//-------------------------------

audioPlayer.addEventListener("volumechange", function() {
    savedVolume = audioPlayer.volume; 
});

document.getElementById("fileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const newMusicData = JSON.parse(e.target.result);
                musicData = musicData.concat(newMusicData); // Ajoute les nouvelles chansons à la liste existante
                displayMusicList();
            } catch (error) {
                alert("Erreur lors du chargement du fichier JSON");
            }
        };
        reader.readAsText(file);
    }
});

function displayMusicList() {
    musicList.innerHTML = '<input type="file" id="fileInput" accept=".json"><button id="exportButton" class="btn">💾</button><h2>Liste des chansons</h2>';

    document.getElementById("fileInput").addEventListener("change", handleFileUpload);
    document.getElementById("exportButton").addEventListener("click", exportPlaylist);

    musicData.forEach((music, index) => {
        const musicItem = document.createElement("div");
        musicItem.classList.add("music-item");
        musicItem.draggable = true;
        musicItem.dataset.index = index;
        musicItem.innerHTML = `
            <h3>${music.songName} - ${music.artist}</h3>
            <p><strong>Anime:</strong> ${music.animeJPName} | <strong>Type:</strong> ${music.type}</p>
            <button class="delete-button" onclick="deleteMusic(${index})">❌</button>
        `;

        musicItem.addEventListener("dragstart", dragStart);
        musicItem.addEventListener("dragover", dragOver);
        musicItem.addEventListener("drop", drop);

        musicItem.addEventListener("click", function() {
            playMusic(index);
        });

        musicList.appendChild(musicItem);
    });

    document.getElementById("exportButton").addEventListener("click", exportPlaylist);
    highlightCurrentSong();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const newMusicData = JSON.parse(e.target.result);
                musicData = musicData.concat(newMusicData); // Ajoute les nouvelles chansons

                localStorage.setItem("playlist", JSON.stringify(musicData));

                displayMusicList();
            } catch (error) {
                alert("Erreur lors du chargement du fichier JSON");
            }
        };
        reader.readAsText(file);
    }
}


function dragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.dataset.index);
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const fromIndex = event.dataTransfer.getData("text/plain");
    const toIndex = event.target.dataset.index;
    
    if (fromIndex !== undefined && toIndex !== undefined) {
        const movedItem = musicData.splice(fromIndex, 1)[0];
        musicData.splice(toIndex, 0, movedItem);

        localStorage.setItem("playlist", JSON.stringify(musicData)); // Sauvegarde
        displayMusicList();
    }
}

const videoPlayer = document.getElementById("videoPlayer");

function playMusic(index) {
    if (musicData.length === 0) return;
    currentIndex = index;

    videoPlayer.src = musicData[currentIndex].video;
    audioPlayer.volume = savedVolume;
    videoPlayer.play();
    updateSongInfo();
    highlightCurrentSong();

}


function updateSongInfo() {
    const song = musicData[currentIndex];
    document.getElementById("songName").textContent = song.songName;
    document.getElementById("artistName").textContent = song.artist;
    document.getElementById("animeName").textContent = song.animeJPName;
    document.getElementById("typeName").textContent = song.type;
}

function highlightCurrentSong() {
    const items = document.querySelectorAll(".music-item");
    items.forEach((item, index) => {
        item.classList.toggle("active", index == currentIndex);
    });
}

document.getElementById("prevButton").addEventListener("click", playPrevious);
document.getElementById("nextButton").addEventListener("click", playNext);

document.getElementById("randomButton").addEventListener("click", function () {
    isShuffle = !isShuffle;
    this.style.background = isShuffle ? "hsl(300, 50%, 40%)" : "hsl(300, 34%, 33%)";
});

audioPlayer.addEventListener("ended", function () {
    if (isShuffle) {
        playRandomMusic();
    } else {
        playNext();
    }
});

function playRandomMusic() {
    if (musicData.length === 0) return;
    const randomIndex = Math.floor(Math.random() * musicData.length);
    playMusic(randomIndex);
}

function playPrevious() {
    if (musicData.length === 0) return;
    currentIndex = (currentIndex - 1 + musicData.length) % musicData.length;
    playMusic(currentIndex);
}

function playNext() {
    if (musicData.length === 0) return;
    if (isShuffle) {
        playRandomMusic();
    } else {
        currentIndex = (currentIndex + 1) % musicData.length;
        playMusic(currentIndex);
    }
}


function deleteMusic(index) {
    musicData.splice(index, 1);
    
    localStorage.setItem("playlist", JSON.stringify(musicData)); // Sauvegarde
    displayMusicList();
}


function exportPlaylist() {
    const json = JSON.stringify(musicData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "playlist.json";
    link.click();
    URL.revokeObjectURL(url);
}

videoPlayer.addEventListener("ended", function() {
    playNext();
});

document.addEventListener("DOMContentLoaded", function () {
    const savedPlaylist = localStorage.getItem("playlist");
    if (savedPlaylist) {
        musicData = JSON.parse(savedPlaylist);
        displayMusicList();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const clearButton = document.getElementById("clearButton");

    if (clearButton) {
        clearButton.addEventListener("click", function() {
            // Supprimer toutes les musiques de la liste
            musicData = [];
            localStorage.removeItem("playlist");
            clearAllMusic();
            displayMusicList(); // Mettre à jour l'affichage
        });
    }
});

function clearAllMusic() {
    const playlist = document.getElementById("playlist");

    if (playlist) {
        // Vider toutes les musiques dans la playlist
        playlist.innerHTML = "";
        console.log("Toutes les musiques ont été supprimées !");
    } else {
        console.log("Erreur : Conteneur de la playlist introuvable");
    }
}