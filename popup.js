// Hero selection system
let selectedHero = null;

// Screen navigation
document.getElementById('startHeroBtn').addEventListener('click', () => {
    document.getElementById('homeScreen').classList.remove('active');
    document.getElementById('heroScreen').classList.add('active');
});

document.getElementById('backBtn').addEventListener('click', () => {
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
        // Remove previous selection
        document.querySelectorAll('.hero-card').forEach(c => {
            c.classList.remove('selected');
        });

        // Add selection to clicked card
        card.classList.add('selected');
        selectedHero = card.dataset.hero;

        // Auto play after selection
        setTimeout(() => {
            playGameWithHero();
        }, 300);
    });
});

function playGameWithHero() {
    if (!selectedHero) {
        alert('Vui lòng chọn một hero!');
        return;
    }

    // Pass hero selection to game via URL parameter
    chrome.tabs.create({
        url: chrome.runtime.getURL(`game-full.html?hero=${selectedHero}`)
    });

    // Close popup
    window.close();
}

