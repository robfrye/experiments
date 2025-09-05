// Open Game link in new tab
const gameBtn = document.querySelector('.menu-btn');
gameBtn.addEventListener('click', () => {
    window.open('/experiments/HCHKN/', '_blank');
});

// Open GPT link in new tab
const gptBtn = document.getElementById('gpt-btn');
gptBtn.addEventListener('click', () => {
    window.open('https://chatgpt.com/g/g-689ccf867c3c8191aec60a162ba51fdd-hedge-cop', '_blank');
});

// Image spin animation
const img = document.getElementById('spin-image');
img.addEventListener('click', () => {
    img.classList.remove('spin-3d');
    // Force reflow to restart animation
    void img.offsetWidth;
    img.classList.add('spin-3d');
});

// Lightbox logic for Movie Trailer
const trailerBtn = document.getElementById('trailer-btn');
const lightbox = document.getElementById('lightbox-overlay');
const closeBtn = document.getElementById('close-lightbox');
const trailerVideo = document.getElementById('trailer-video');

trailerBtn.addEventListener('click', () => {
    lightbox.style.display = 'flex';
    trailerVideo.currentTime = 0;
    trailerVideo.play();
});

closeBtn.addEventListener('click', () => {
    lightbox.style.display = 'none';
    trailerVideo.pause();
});

// Optional: close lightbox on overlay click (not on video)
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.style.display = 'none';
        trailerVideo.pause();
    }
});

// Music Player Functionality - Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    const backgroundMusic = document.getElementById('background-music');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = playPauseBtn.querySelector('.play-icon');

    if (!backgroundMusic || !playPauseBtn || !playIcon) {
        console.error('Music elements not found!');
        return;
    }

    // Set initial volume
    backgroundMusic.volume = 0.5;

    // Simple Play/Pause functionality
    playPauseBtn.addEventListener('click', function() {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    });

    // Update button icon when music state changes
    backgroundMusic.addEventListener('play', () => {
        playIcon.textContent = '⏸️';
    });

    backgroundMusic.addEventListener('pause', () => {
        playIcon.textContent = '▶️';
    });
});

// Handle tab visibility change to pause/resume music
let wasPausedBeforeHidden = false;

document.addEventListener('visibilitychange', function() {
    const backgroundMusic = document.getElementById('background-music');
    
    if (document.hidden) {
        // Tab is no longer visible
        if (!backgroundMusic.paused) {
            wasPausedBeforeHidden = false;
            backgroundMusic.pause();
        } else {
            wasPausedBeforeHidden = true;
        }
    } else {
        // Tab is visible again
        if (!wasPausedBeforeHidden) {
            backgroundMusic.play();
        }
    }
});
