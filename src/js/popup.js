// Hero selection system (moved to src)
let selectedHero = null;

// Screen navigation
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startHeroBtn');
    const backBtn = document.getElementById('backBtn');
    if (startBtn) startBtn.addEventListener('click', () => {
        document.getElementById('homeScreen').classList.remove('active');
        document.getElementById('heroScreen').classList.add('active');
    });
    if (backBtn) backBtn.addEventListener('click', () => {
        document.getElementById('heroScreen').classList.remove('active');
        document.getElementById('homeScreen').classList.add('active');
        selectedHero = null;
        document.querySelectorAll('.hero-card').forEach(card => {
            card.classList.remove('selected');
        });
    });

    // Hero card selection
    document.querySelectorAll('.hero-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedHero = card.dataset.hero;
            setTimeout(() => playGameWithHero(), 300);
        });
    });
});

function playGameWithHero() {
    if (!selectedHero) {
        alert('Please select a ship!');
        return;
    }

    chrome.tabs.create({
        url: chrome.runtime.getURL(`src/html/game-full.html?hero=${selectedHero}`)
    });

    window.close();
}
