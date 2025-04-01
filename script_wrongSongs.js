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

window.onload = function() {
    loadPlaylist();
    videoPlayer.volume = savedVolume;

    if (musicData.length > 0) {
        playMusic(0);
    }
}
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
        `;

        //--Bouton supprimer chaque élément-----------------------------------------------
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-button");
        deleteButton.innerHTML = "❌";
        deleteButton.addEventListener("click", function(event) {
            event.stopPropagation();
            deleteMusic(index);
        });
        musicItem.appendChild(deleteButton);
        //--------------------------------------------------------------------------------

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

    if (isShuffle) {
        this.classList.add("active"); 
    } else {
        this.classList.remove("active");
    }
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
    const isCurrentPlaying = index === currentIndex;

    musicData.splice(index, 1);
    localStorage.setItem("playlist", JSON.stringify(musicData)); // Sauvegarde

    if (musicData.length === 0) {
        currentIndex = 0;
        videoPlayer.pause();
        videoPlayer.src = "";
    } else {
        if (isCurrentPlaying) {
            currentIndex = Math.min(index, musicData.length - 1);
            playMusic(currentIndex);
        } else if (index < currentIndex) {
            currentIndex--;
        }
    }

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

//--Changer thème--------------------------------------------------------------

function toggleTheme() {
    const themeLink = document.getElementById("theme-link");

    if (themeLink.getAttribute("href") === "style.css") {
        themeLink.setAttribute("href", "style_girly.css");
        localStorage.setItem("selectedTheme", "style_girly.css");
    } else {
        themeLink.setAttribute("href", "style.css");
        localStorage.setItem("selectedTheme", "style.css");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const themeLink = document.getElementById("theme-link");
    const savedTheme = localStorage.getItem("selectedTheme");

    if (savedTheme) {
        themeLink.setAttribute("href", savedTheme);
    }
});

//-----------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    let score = 0;
    let gameActive = false;

    // Créer le bouton pour activer/désactiver le jeu
    const toggleButton = document.createElement("button");
    toggleButton.id = "game-toggle-btn";
    toggleButton.textContent = "🎮";
    document.body.appendChild(toggleButton);

    const scoreDisplay = document.createElement("div");
    scoreDisplay.classList.add("score-display");
    scoreDisplay.textContent = "Score: 0";
    document.body.appendChild(scoreDisplay);

    // Masquer le score au début
    scoreDisplay.style.display = "none";

    function createCircle() {
        const circle = document.createElement("div");
        circle.classList.add("circle");

        const size = Math.random() * 40 + 30;
        const x = Math.random() * (window.innerWidth - size);
        const y = Math.random() * (window.innerHeight - size);

        circle.style.width = `${size}px`;
        circle.style.height = `${size}px`;
        circle.style.left = `${x}px`;
        circle.style.top = `${y}px`;

        document.body.appendChild(circle);

        circle.addEventListener("click", () => {
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
            circle.remove();
        });

        setTimeout(() => {
            if (circle.parentNode) {
                circle.remove();
            }
        }, 1000);
    }

    let circleInterval;

    // Fonction pour activer/désactiver le jeu
    function toggleGame() {
        if (gameActive) {
            clearInterval(circleInterval);
            scoreDisplay.style.display = "none";
            toggleButton.textContent = "🎮";
            gameActive = false;
        } else {
            score = 0;
            scoreDisplay.textContent = `Score: ${score}`;
            scoreDisplay.style.display = "block";
            circleInterval = setInterval(createCircle, 800);
            toggleButton.textContent = "Arrêter le jeu";
            gameActive = true;
        }
    }

    toggleButton.addEventListener("click", toggleGame);
});