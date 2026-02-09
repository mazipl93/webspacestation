// --- SYSTEM ARCHIWUM WEB SPACE STATION ---

function renderujArchiwum(kategoria = 'wszystkie') {
    const kontener = document.getElementById('glowne-archiwum');
    if (!kontener) return;

    // 1. Czyścimy stare wpisy
    kontener.innerHTML = '';

    // 2. Filtrujemy i SORTUJEMY (zawsze najnowsze ID na górze)
    let dane = [...bazaArtykulow].sort((a, b) => b.id - a.id);
    
    if (kategoria !== 'wszystkie') {
        dane = dane.filter(art => art.kategoria === kategoria);
    }

    // 3. Renderujemy karty
    dane.forEach(art => {
        const karta = `
            <div class="art-card archive-item">
                <div class="art-img" style="background-image: url('${art.img}');"></div>
                <div class="art-content">
                    <span class="art-tag">${art.tag} | ${art.kategoria.toUpperCase()}</span>
                    <h3 class="art-title">${art.tytul}</h3>
                    <p class="art-desc">${art.opis}</p>
                    <a href="artykul.html?id=${art.id}" class="art-link">OTWÓRZ MELDUNEK</a>
                </div>
            </div>
        `;
        kontener.innerHTML += karta;
    });
}

// Funkcja obsługująca przyciski
function filtrujArchiwum(kat) {
    renderujArchiwum(kat);
}

// Inicjalizacja przy starcie strony
document.addEventListener('DOMContentLoaded', () => {
    if (typeof bazaArtykulow !== 'undefined') {
        renderujArchiwum();
    }
});