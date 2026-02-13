// BGM Audio Player
(function() {
    // Create audio element for BGM (singleton - persists across page navigation)
    const bgmAudio = new Audio('BGM Music.mp3');
    bgmAudio.loop = true;
    
    // Load saved settings
    let isMuted = localStorage.getItem('bgmMuted') === 'true';
    let volume = parseFloat(localStorage.getItem('bgmVolume')) || 0.5;
    bgmAudio.volume = volume;
    
    let bgmStarted = false;
    
    // Speaker icon SVG
    const speakerSVG = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9v6h4l5 5V4L7 9H3z"/>
            <g class="sound-waves">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </g>
            <line class="mute-slash" x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;
    
    // Sync all BGM buttons state
    function syncAllButtons() {
        const buttons = document.querySelectorAll('.bgm-settings-btn, .bgm-mute-btn');
        buttons.forEach(function(btn) {
            if (isMuted) {
                btn.classList.add('muted');
            } else {
                btn.classList.remove('muted');
            }
        });
        
        // Update mute button text
        const muteBtn = document.getElementById('bgm-mute-btn');
        if (muteBtn) {
            const textSpan = muteBtn.querySelector('span');
            if (textSpan) {
                textSpan.textContent = isMuted ? 'Unmute BGM' : 'Mute BGM';
            }
        }
    }
    
    // Update volume slider visual
    function updateVolumeSlider() {
        const slider = document.getElementById('bgm-volume-slider');
        if (slider) {
            slider.value = volume * 100;
            slider.style.setProperty('--volume-percent', (volume * 100) + '%');
        }
    }
    
    // Create BGM settings window
    function createBGMSettingsWindow() {
        const parent = document.createElement('div');
        parent.id = 'bgmSettingsParent';
        parent.innerHTML = `
            <div id="bgmSettingsWindow">
                <button class="bgm-close-btn" id="bgm-close-btn">&times;</button>
                <span class="bgm-window-title">BGM Settings</span>
                
                <div class="bgm-volume-container">
                    <label class="bgm-volume-label">Volume</label>
                    <div class="bgm-slider-wrapper">
                        <input type="range" id="bgm-volume-slider" class="bgm-volume-slider" 
                               min="0" max="100" value="${volume * 100}" 
                               style="--volume-percent: ${volume * 100}%">
                    </div>
                </div>
                
                <button class="bgm-mute-btn${isMuted ? ' muted' : ''}" id="bgm-mute-btn">
                    ${speakerSVG}
                    <span>${isMuted ? 'Unmute BGM' : 'Mute BGM'}</span>
                </button>
            </div>
        `;
        
        document.body.appendChild(parent);
        
        // Close button
        document.getElementById('bgm-close-btn').addEventListener('click', closeBGMSettings);
        
        // Close on background click
        parent.addEventListener('click', function(e) {
            if (e.target === parent) {
                closeBGMSettings();
            }
        });
        
        // Volume slider
        const slider = document.getElementById('bgm-volume-slider');
        slider.addEventListener('input', function() {
            volume = this.value / 100;
            bgmAudio.volume = volume;
            this.style.setProperty('--volume-percent', this.value + '%');
            localStorage.setItem('bgmVolume', volume);
        });
        
        // Mute button
        document.getElementById('bgm-mute-btn').addEventListener('click', toggleBGM);
    }
    
    // Create settings button for game view
    function createBGMButton() {
        const button = document.createElement('button');
        button.className = 'bgm-settings-btn' + (isMuted ? ' muted' : '');
        button.id = 'bgm-toggle';
        button.title = 'BGM Settings';
        button.innerHTML = speakerSVG;
        
        button.addEventListener('click', openBGMSettings);
        document.body.appendChild(button);
    }
    
    // Setup home page button (already exists in HTML)
    function setupHomeButton() {
        const homeButton = document.getElementById('home-bgm-toggle');
        if (homeButton) {
            homeButton.className = 'bgm-settings-btn home-bgm-btn' + (isMuted ? ' muted' : '');
            homeButton.title = 'BGM Settings';
            homeButton.innerHTML = speakerSVG;
            homeButton.addEventListener('click', openBGMSettings);
        }
    }
    
    // Open BGM settings window
    function openBGMSettings() {
        const parent = document.getElementById('bgmSettingsParent');
        if (parent) {
            parent.classList.add('show');
            updateVolumeSlider();
        }
    }
    
    // Close BGM settings window
    function closeBGMSettings() {
        const parent = document.getElementById('bgmSettingsParent');
        if (parent) {
            parent.classList.remove('show');
        }
    }
    
    // Toggle BGM mute/unmute
    function toggleBGM() {
        isMuted = !isMuted;
        
        if (isMuted) {
            bgmAudio.pause();
        } else {
            bgmAudio.play().catch(function(error) {
                console.log('BGM playback failed:', error);
            });
        }
        
        localStorage.setItem('bgmMuted', isMuted);
        syncAllButtons();
    }
    
    // Start BGM when user interacts with the page (required by browsers)
    function initBGM() {
        if (!bgmStarted && !isMuted) {
            bgmAudio.play().catch(function(error) {
                console.log('BGM autoplay blocked, waiting for user interaction');
            });
            bgmStarted = true;
        }
    }
    
    // Expose startBGM globally for startGame() to call
    window.startBGM = function() {
        initBGM();
    };
    
    // Initialize when DOM is ready
    function init() {
        createBGMSettingsWindow();
        createBGMButton();
        setupHomeButton();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
