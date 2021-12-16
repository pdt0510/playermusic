function GetEles(ClassOrId) {
    if (ClassOrId === '.playlist') {
        return $('.playlist');
    }
    if (ClassOrId === '.cd') {
        return $('.cd');
    }
    if (ClassOrId === 'header h2') {
        return $('header h2');
    }
    if (ClassOrId === '.cd-thumb') {
        return $('.cd-thumb');
    }
    if (ClassOrId === '#audio') {
        return $('#audio');
    }
    if (ClassOrId === '.btn-toggle-play') {
        return $('.btn-toggle-play');
    }
    if (ClassOrId === '.player') {
        return $('.player');
    }
    if (ClassOrId === '#progress') {
        return $('#progress');
    }
    if (ClassOrId === '.btn-next') {
        return $('.btn-next');
    }
    if (ClassOrId === '.btn-prev') {
        return $('.btn-prev');
    }
    if (ClassOrId === '.btn-random') {
        return $('.btn-random');
    }
    if (ClassOrId === '.btn-repeat') {
        return $('.btn-repeat');
    }
    if (ClassOrId === '#song-' + `${app.currentIdx}`) {
        return $('#song-' + `${app.currentIdx}`);
    }
}

function htmlArr(songItem, idx) {
    return `
            <div id="song-${idx}" class="song">
                <div class="thumb" style="background-image:
                    url('${songItem.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${songItem.name}</h3>
                    <p class="author">${songItem.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
}

function renderFn(App) {
    const playlist = GetEles('.playlist');
    const AnHtmlArr = App.songs.map((song, idx) => {
        return htmlArr(song, idx);
    });
    const htmlStr = AnHtmlArr.join('');
    playlist.innerHTML = htmlStr;
}

function defineAProperty(App) {
    Object.defineProperty(App, 'currentSong', {
        get: function () {
            return this.songs[this.currentIdx];
        }
    });
}

function pushASongToPlayer(App) {
    const headerH2 = GetEles('header h2');
    const cdThumb = GetEles('.cd-thumb');
    const progressId = GetEles('#progress');
    const audioId = GetEles('#audio');

    headerH2.textContent = App.currentSong.name;
    cdThumb.style.backgroundImage =
        `url(${App.currentSong.image})`;
    progressId.value = 0;
    audioId.src = App.currentSong.path;
}

function FirstlyLoadSong(App) {
    defineAProperty(App);
    pushASongToPlayer(App);
}

function scrollingWidthValue(initialCdWidth) {
    const scrollTop = (window.scrollY ||
        document.documentElement.scrollTop);
    const newCdWidth = initialCdWidth - scrollTop;

    return {
        width: newCdWidth > 0 ? newCdWidth + 'px' : 0,
        opacity: newCdWidth / initialCdWidth,
    }
}

function triggerOnscroll() {
    const cd = GetEles('.cd');
    const initialCdWidth = cd.offsetWidth;
    document.onscroll = function () {
        let newCd = scrollingWidthValue(initialCdWidth);
        cd.style.width = newCd.width;
        cd.style.opacity = newCd.opacity;
    }
}

function toggleElementStateOf(ele) {
    const player = GetEles('.player');
    const randomBtn = GetEles('.btn-random');
    const repeatBtn = GetEles('.btn-repeat');

    if (ele === player) {
        ele.classList.toggle('playing');
        return true;
    }
    if (ele === randomBtn || ele === repeatBtn) {
        ele.classList.toggle('active');
        return true;
    }
    return false;
}

function SwitchingAppIsPlaying(isPlaying) {
    if (isPlaying) {
        return false;
    }
    return true;
}

function SwitchingPlayerState(isPlaying) {
    const player = GetEles('.player');
    const isChecked = toggleElementStateOf(player);
    if (isChecked) {
        return SwitchingAppIsPlaying(isPlaying);
    }
}

function scrollActivetSong(highlighted, idx) {
    if (idx < 3) {
        highlighted.scrollIntoView({
            behavior: "smooth",
            block: "end"
        })
    } else {
        highlighted.scrollIntoView({
            behavior: "smooth",
            block: "center"
        })
    }
}

function getAnIndex(ele, pos) {
    return ele.id.substring(pos);
}

function highlightSong(currentIdx) {
    let highlightedSong = $('#song-' + `${globalIdx}`);
    highlightedSong.classList.remove('active');

    highlightedSong = GetEles('#song-' + `${currentIdx}`);
    highlightedSong.classList.add('active');
    highlightedSong.style.transition = 'all 0.4s';

    let CutIdx = 5;
    let songIdx = getAnIndex(highlightedSong, CutIdx);
    scrollActivetSong(highlightedSong, songIdx);

    globalIdx = currentIdx;
}

function cdRotate() {
    const cdThumb = GetEles('.cd-thumb');
    return cdThumb.animate([
        { transform: 'rotate(360deg)' },
    ], {
        duration: 10000,
        iterations: Infinity,
    });
}

function switchingToPlay(App) {
    globalRotate.play();
    highlightSong(App.currentIdx);
    App.isPlaying = SwitchingPlayerState(App.isPlaying);
}

function switchingToPause(App) {
    globalRotate.pause();
    App.isPlaying = SwitchingPlayerState(App.isPlaying);
}

function PlayerClick(App, audio) {
    if (App.isPlaying) {
        globalPlayingState = false;
        audio.pause();
    }
    else {
        globalPlayingState = true;
        audio.play();
    }
}

function seekingProgValue(progValue, audioDuration) {
    return (progValue * audioDuration) / 100;
}

function stopForSeeking(seeking = true,
    audio, progValue) {
    if (seeking) {
        audio.muted = true;
        audio.currentTime =
            seekingProgValue(progValue, audio.duration);
        if (globalPlayingState) {
            audio.pause();
        }
        return;
    }
    if (globalPlayingState) {
        audio.play();
    }
    audio.muted = false;
}

function progLogic(CurrentTime, Duration) {
    return (CurrentTime / Duration) * 100;
}

function progressValue(progValue, audio) {
    if (audio.duration) {
        progValue.value = progLogic(
            audio.currentTime, audio.duration);
    }
}

function playingStateAtClicking(App) {
    if (globalPlayingState) {
        switchingToPause(App);
    }
    else {
        globalPlayingState = true;
    }
}

function NextASong(App) {
    App.currentIdx++;
    if (App.currentIdx > App.songs.length - 1) {
        App.currentIdx = 0;
    }
    playingStateAtClicking(App);
    pushASongToPlayer(App);
}

function prevASong(App) {
    App.currentIdx--;
    if (App.currentIdx < 0) {
        App.currentIdx = App.songs.length - 1;
    }
    playingStateAtClicking(App)
    pushASongToPlayer(App);
}

function RandomASong(App) {
    let newIdx;
    do {
        newIdx = Math.floor(Math.random() * App.songs.length);
    } while (newIdx === App.currentIdx);
    App.currentIdx = newIdx;
    playingStateAtClicking(App)
    pushASongToPlayer(App);
}

function RepeatOrNextASong(App) {
    if (!App.isRepeated) {
        if (App.isRandom) {
            RandomASong(App)
        }
        else {
            NextASong(App);
        }
        playingStateAtClicking(App);
    }
}

function FindingParentEle(ele) {
    while (true) {
        if (ele.className.includes('option') ||
            ele.className.includes('active')) {
            return null;
        }
        if (ele.id.includes("song-")) {
            return ele;
        }
        ele = ele.parentNode;
    }
    return null;
}

function PlayAChoseSong(App, eTarget) {
    let parentEle = FindingParentEle(eTarget);
    if (parentEle) {
        let cutIdx = 5;
        App.currentIdx = getAnIndex(parentEle, cutIdx);
        playingStateAtClicking(App);
        pushASongToPlayer(App);
        return true;
    }
    return false;
}

function LocalStorageSettings(key, value) {
    const JSONFILE_STORAGE_KEYS = 'F8_PLAYER';

    let JSCRIPT_KEYS = JSON.parse(
        localStorage.getItem(JSONFILE_STORAGE_KEYS)) || {};
    JSCRIPT_KEYS[key] = value;

    let JSON_KEYS = JSON.stringify(JSCRIPT_KEYS);
    localStorage.setItem(JSONFILE_STORAGE_KEYS, JSON_KEYS);

    return JSCRIPT_KEYS;
}

function PushSettingsToApp(App) {
    if (App.isRandom) {
        const randomBtn = GetEles('.btn-random');
        toggleElementStateOf(randomBtn);
    }
    if (App.isRepeated) {
        const repeatBtn = GetEles('.btn-repeat');
        toggleElementStateOf(repeatBtn);
    }
}

function setSettingsToApp(App) {
    App.isRandom = App.setConfigs.isRandom;
    App.isRepeated = App.setConfigs.isRepeated;
    PushSettingsToApp(App);
}

function PlayerControllers(App) {
    //eles list 
    const playlist = GetEles('.playlist');
    const progressId = GetEles('#progress');
    const audioId = GetEles('#audio');
    const playBtn = GetEles('.btn-toggle-play');
    const nextBtn = GetEles('.btn-next');
    const prevBtn = GetEles('.btn-prev');
    const randomBtn = GetEles('.btn-random');
    const repeatBtn = GetEles('.btn-repeat');
    globalRotate.pause();

    playBtn.onclick = function () {
        PlayerClick(App, audioId);
    };

    nextBtn.onclick = function () {
        if (App.isRandom) {
            RandomASong(App)
        }
        else {
            NextASong(App);
        }
        audioId.play();
    };

    prevBtn.onclick = function () {
        prevASong(App);
        audioId.play();
    };

    randomBtn.onclick = function () {
        App.isRandom = !App.isRandom;
        toggleElementStateOf(randomBtn);
        App.setConfigs =
            LocalStorageSettings('isRandom', App.isRandom);
    };

    repeatBtn.onclick = function () {
        App.isRepeated = !App.isRepeated;
        toggleElementStateOf(repeatBtn);
        App.setConfigs =
         LocalStorageSettings('isRepeated', App.isRepeated);
    }

    playlist.onclick = function (e) {
        let isChecked = PlayAChoseSong(App, e.target);
        if (isChecked) {
            audioId.play();
        }
    }

    audioId.onplay = function () {
        switchingToPlay(App);
    };

    audioId.onpause = function () {
        switchingToPause(App);
    };

    audioId.onended = function () {
        RepeatOrNextASong(App);
        audioId.play();
    }

    progressId.oninput = function () {
        stopForSeeking(true, audioId, progressId.value);
    }

    //trigger audio again after seeking
    progressId.onchange = function () {
        stopForSeeking(false, audioId, progressId.value);
    }

    audioId.ontimeupdate = function () {
        progressValue(progressId, audioId);
    }
}

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const globalRotate = cdRotate();
let globalPlayingState = false;
let globalIdx = 0;

const app = {
    setConfigs: null,
    isRepeated: false,
    isRandom: false,
    isPlaying: false,
    currentIdx: 0,
    songs: songs = [
        {
            name: 'mashup 1',
            singer: 'Singer 1',
            path: './assets/music/mashup1.mp3',
            image: './assets/img/pic1.jpg'
        },
        {
            name: 'mashup 2',
            singer: 'Singer 2',
            path: './assets/music/mashup2.mp3',
            image: './assets/img/pic2.jpg'
        },
        {
            name: 'mashup 3',
            singer: 'Singer 3',
            path: './assets/music/mashup3.mp3',
            image: './assets/img/pic3.jpg'
        },
        {
            name: 'mashup 4',
            singer: 'Singer 4',
            path: './assets/music/mashup4.mp3',
            image: './assets/img/pic4.jpg'
        },
        {
            name: 'mashup 5',
            singer: 'Singer 5',
            path: './assets/music/mashup5.mp3',
            image: './assets/img/pic5.jpg'
        },
        {
            name: 'mashup 6',
            singer: 'Singer 6',
            path: './assets/music/mashup6.mp3',
            image: './assets/img/pic6.jpg'
        },
        {
            name: 'mashup 7',
            singer: 'Singer 7',
            path: './assets/music/mashup7.mp3',
            image: './assets/img/pic7.jpg'
        },
        {
            name: 'mashup 8',
            singer: 'Singer 8',
            path: './assets/music/mashup8.mp3',
            image: './assets/img/pic8.jpg'
        },
        {
            name: 'mashup 9 (final 1)',
            singer: 'Singer 9',
            path: './assets/music/mashup9.mp3',
            image: './assets/img/pic9.jpg'
        },
        {
            name: 'mashup 10',
            singer: 'Singer 10',
            path: './assets/music/mashup1.mp3',
            image: './assets/img/pic1.jpg'
        },
        {
            name: 'mashup 11',
            singer: 'Singer 11',
            path: './assets/music/mashup2.mp3',
            image: './assets/img/pic2.jpg'
        },
        {
            name: 'mashup 12',
            singer: 'Singer 12',
            path: './assets/music/mashup3.mp3',
            image: './assets/img/pic3.jpg'
        },
        {
            name: 'mashup 13',
            singer: 'Singer 13',
            path: './assets/music/mashup4.mp3',
            image: './assets/img/pic4.jpg'
        },
        {
            name: 'mashup 14',
            singer: 'Singer 14',
            path: './assets/music/mashup5.mp3',
            image: './assets/img/pic5.jpg'
        },
        {
            name: 'mashup 15',
            singer: 'Singer 15',
            path: './assets/music/mashup6.mp3',
            image: './assets/img/pic6.jpg'
        },
        {
            name: 'mashup 16',
            singer: 'Singer 16',
            path: './assets/music/mashup7.mp3',
            image: './assets/img/pic7.jpg'
        },
        {
            name: 'mashup 17',
            singer: 'Singer 17',
            path: './assets/music/mashup8.mp3',
            image: './assets/img/pic8.jpg'
        },
        {
            name: 'mashup 18 (final 2)',
            singer: 'Singer 18',
            path: './assets/music/mashup9.mp3',
            image: './assets/img/pic9.jpg'
        },
    ],
    loadConfigs: function () {
        this.setConfigs = LocalStorageSettings();
        if (this.setConfigs !== null) {
            setSettingsToApp(this);
        }
    },
    render: function () {
        renderFn(this);
    },
    loadSongs: function () {
        FirstlyLoadSong(this);
    },
    handeEvents: function () {
        triggerOnscroll();
        PlayerControllers(this);
    },
    start: function () {
        this.loadConfigs();
        this.render();
        this.loadSongs();
        this.handeEvents();
    },
}

app.start();
