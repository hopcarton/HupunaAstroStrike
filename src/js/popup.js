// Hero selection system - Optimized
let selectedHero = null;

// Cache DOM elements
const DOM = {
    startBtn: null,
    backBtn: null,
    homeScreen: null,
    heroScreen: null,
    heroCards: null
};

// Screen navigation - Optimized with cached elements and event delegation
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements once
    DOM.startBtn = document.getElementById('startHeroBtn');
    DOM.backBtn = document.getElementById('backBtn');
    DOM.homeScreen = document.getElementById('homeScreen');
    DOM.heroScreen = document.getElementById('heroScreen');
    DOM.heroCards = document.querySelectorAll('.hero-card');
    
    // Navigation handlers
    DOM.startBtn?.addEventListener('click', () => {
        DOM.homeScreen?.classList.remove('active');
        DOM.heroScreen?.classList.add('active');
    });
    
    DOM.backBtn?.addEventListener('click', () => {
        DOM.heroScreen?.classList.remove('active');
        DOM.homeScreen?.classList.add('active');
        selectedHero = null;
        DOM.heroCards.forEach(card => card.classList.remove('selected'));
    });

    // Event delegation for hero cards (more efficient)
    DOM.heroScreen?.addEventListener('click', (e) => {
        const card = e.target.closest('.hero-card');
        if (!card) return;
        
        DOM.heroCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedHero = card.dataset.hero;
        setTimeout(playGameWithHero, 300);
    });
});

function playGameWithHero() {
    if (!selectedHero) {
        alert('Please select a ship!');
        return;
    }
    // Use chrome.windows.create() instead of chrome.tabs.create() - no permission needed
    chrome.windows.create({
        url: chrome.runtime.getURL(`src/html/game-full.html?hero=${selectedHero}`),
        type: 'popup',
        width: 1200,
        height: 800
    });
    window.close();
}
