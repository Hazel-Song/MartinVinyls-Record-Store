document.addEventListener('DOMContentLoaded', () => {
    const trackList = document.querySelector('.track-list');
    const playerOverlay = document.querySelector('.player-overlay');
    const audioPlayer = document.getElementById('audioPlayer');
    let currentTrack = localStorage.getItem('currentTrack') || '00-Background_Music';

    const tracks = [
        {
            id: '00-Background_Music',
            image: 'images/recordplay-00Background.png',
            audio: 'music/recordplay-00background-Echoes of Vinyl.mp3'
        },
        {
            id: '01-Barbershop',
            image: 'images/recordplay-01Barbershop.png',
            audio: 'music/recordplay-01Burning Pages-Barbershop2.mp3'
        },
        {
            id: '02-Baroque',
            image: 'images/recordplay-02Baroque.png',
            audio: 'music/recordplay-02Echoes of Love-Baroque&violin.mp3'
        },
        {
            id: '03-Blues',
            image: 'images/recordplay-03Blues.png',
            audio: 'music/recordplay-03Ghosts of Yesterday-Blues.mp3'
        },
        {
            id: '04-Big_Band_Jazz',
            image: 'images/recordplay-04BigBandJazz.png',
            audio: 'music/recordplay-04Let It Fade-BigBandJazz.mp3'
        },
        {
            id: '05-Funk&RnB',
            image: 'images/recordplay-05FunkRnB.png',
            audio: 'music/recordplay-05Lost Light-Funk+R&B.mp3'
        },
        {
            id: '06-Hardcore_Punk',
            image: 'images/recordplay-06HardcorePunk.png',
            audio: 'music/recordplay-06Shattered Chains-hardcore punk.mp3'
        }
    ];

    function playTrack(trackId) {
        const track = tracks.find(t => t.id === trackId);
        if (!track) return;

        // 移除之前的活动状态
        const previousActive = document.querySelector('.track-item.active');
        if (previousActive) {
            previousActive.classList.remove('active');
        }

        // 设置新的活动状态
        const currentItem = document.querySelector(`[data-track="${trackId}"]`);
        if (currentItem) {
            currentItem.classList.add('active');
        }

        // 更新播放器显示
        playerOverlay.src = track.image;
        playerOverlay.style.display = 'block';

        // 播放音频
        audioPlayer.src = track.audio;
        audioPlayer.play();
        currentTrack = trackId;
        localStorage.setItem('currentTrack', trackId);
    }

    // 为���添加点击事件
    document.querySelectorAll('.track-item').forEach(item => {
        const trackId = item.querySelector('.track-text').textContent.split('-')[0] + 
                       '-' + item.querySelector('.track-text').textContent.split('-')[1];
        item.setAttribute('data-track', trackId);
        
        item.addEventListener('click', () => {
            if (currentTrack !== trackId) {
                playTrack(trackId);
            }
        });
    });

    // 页面加载时播放当前曲目
    playTrack(currentTrack);

    // 添加波浪动效
    const canvas = document.getElementById('waveCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = Math.floor(window.innerWidth * 0.75);
    canvas.height = 600;

    let waves = [];
    const waveCount = 3;
    let animationSpeed = 1;

    // 创建多个波浪
    for(let i = 0; i < waveCount; i++) {
        waves.push({
            frequency: 0.02 + (i * 0.01),
            amplitude: 20 + (i * 10),
            offset: 0,
            speed: 0.05 + (i * 0.02),
            color: `rgba(255, 152, 0, ${0.9 - i * 0.1})`
        });
    }

    let isPlaying = false; // 添加播放状态标记

    function drawWave() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        waves.forEach(wave => {
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);

            if (isPlaying) {
                wave.amplitude += (Math.random() - 0.5) * 4;
                wave.amplitude = Math.max(20, Math.min(wave.amplitude, 60));
            } else {
                wave.amplitude = Math.max(1, Math.min(wave.amplitude, 3));
            }

            for(let x = 0; x < canvas.width; x++) {
                const y = Math.sin(x * wave.frequency + wave.offset) * wave.amplitude;
                ctx.lineTo(x, canvas.height / 2 + y);
            }

            ctx.strokeStyle = wave.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            wave.offset += wave.speed * animationSpeed;
        });

        requestAnimationFrame(drawWave);
    }

    // 开始动画
    drawWave();

    // 将波浪效果与音频播放器连接
    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        animationSpeed = 3;
        waves.forEach(wave => {
            wave.baseAmplitude = wave.amplitude;
        });
        sampleImage.classList.remove('paused');
    });

    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        animationSpeed = 0.1;
        waves.forEach(wave => {
            wave.amplitude = wave.baseAmplitude * 0.02;
        });
        sampleImage.classList.add('paused');
    });

    const sampleImage = document.querySelector('.sample-image');
}); 