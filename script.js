const params = new URLSearchParams(window.location.search);
let guestName = params.get("name");

// když tam nic není
if (!guestName) {
    guestName = "host";
}

emailjs.init("3ZJ8z_cmHx8EN_lPw");

const canvas = document.getElementById("scratch");
const ctx = canvas.getContext("2d");
const instruction = document.getElementById("instruction");
const container = document.querySelector(".heart-wrapper");


// Zabr�n�n� necht�n�mu chov�n� v prohl�e�i
canvas.addEventListener('dragstart', (e) => e.preventDefault());
canvas.addEventListener('selectstart', (e) => e.preventDefault());

let scratching = false;

// 1. Deklarujeme obr�zek jen JEDNOU
const heartImg = new Image();
heartImg.src = "heart.png";

// 2. Po�k�me na na�ten� obr�zku a pak spust�me v�e ostatn�
heartImg.onload = () => {
    initCanvas();
};

// Pokud by se obr�zek nena�etl (chyba v cest�), spust�me to aspo� se zlatou barvou
heartImg.onerror = () => {
    console.error("Obr�zek heart.png nebyl nalezen!");
    initCanvas();
};

function initCanvas() {
    const dpr = window.devicePixelRatio || 2;
    const w = container.offsetWidth || 300;
    const h = container.offsetHeight || 300;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.scale(dpr, dpr);

    // 1. OKAMŽITĚ vyplníme srdce zlatou barvou
    ctx.fillStyle = "#b8860b";
    ctx.fillRect(0, 0, w, h);

    // 2. Vykreslíme obrázek srdce (ten, co se maže)
    if (heartImg.complete && heartImg.naturalWidth !== 0) {
        ctx.drawImage(heartImg, 0, 0, w, h);
    }

    // 3. ZOBRAZÍME PODKLAD (lístky)
    const bg = document.getElementById('heart-background');
    if (bg) {
        bg.style.opacity = "1";
        bg.style.visibility = "visible";
    }

    // 4. ZOBRAZÍME TEXT POZVÁNKY
    const invite = document.querySelector('.invite-container');
    if (invite) {
        invite.classList.remove('hidden-at-start');
        invite.style.display = 'flex';
        invite.style.opacity = '1';
    }

    // 5. ZOBRAZÍME CELÝ OBAL
    container.classList.add('ready');
}

// Ud�losti pro st�r�n�
["mousedown", "touchstart"].forEach(evt =>
    canvas.addEventListener(evt, (e) => {
        scratching = true;
        scratch(e);
    }, { passive: false })
);

["mouseup", "touchend"].forEach(evt =>
    canvas.addEventListener(evt, () => scratching = false)
);

["mousemove", "touchmove"].forEach(evt =>
    canvas.addEventListener(evt, scratch, { passive: false })
);

function scratch(e) {
    if (!scratching) return;

    if (e.cancelable) e.preventDefault();
    e.stopPropagation();

    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();

    checkReveal();
}

function checkReveal() {
    try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let cleared = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 128) cleared++;
        }

        const percentage = (cleared / (pixels.length / 4)) * 100;

        if (percentage > 20) {
            revealEverything();
        }
    } catch (e) {
        if (!window.backupTimer) {
            window.backupTimer = setTimeout(revealEverything, 2500);
        }
    }
}

function revealEverything() {
    // 1. Spustíme konfety
    createConfetti();

    // 2. Skryjeme instrukci "Setři mě"
    const inst = document.getElementById('instruction');
    if (inst) inst.style.opacity = "0";

    // 3. Plynule schováme stírací plochu (canvas)
    canvas.style.transition = "opacity 0.8s ease-in-out";
    canvas.style.opacity = "0";

    // 4. TEXT (v CSS máš .invite-text, tak mu přidáme viditelnost)
    setTimeout(() => {
        const witness = document.querySelector('.invite-text');
        if (witness) {
            witness.style.opacity = "1";
            witness.style.transition = "opacity 1s ease-in-out";
        }
    }, 600);

    // 5. TLAČÍTKA (Tady použijeme tvou CSS třídu .show)
    setTimeout(() => {
        const btnContainer = document.getElementById('button-container');
        if (btnContainer) {
            // Přidáme třídu .show, která v CSS přepne opacity a visibility
            btnContainer.classList.add('show');
        }
    }, 2000);

    // Úplné odstranění canvasu, aby se dalo klikat na tlačítka
    setTimeout(() => {
        canvas.style.display = "none";
    }, 800);
}

function createConfetti() {
    const confContainer = document.getElementById("confetti-container");
    const colors = ["#ffffff", "#7e9f7c", "#b7d4b6", "#ffffff", "#dbf1da"];
    const shapes = ["circle", "square", "diamond"]; // Definujeme tvary

    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti";

        confetti.style.left = "50vw";
        confetti.style.top = "50vh";

        // N�hodn� v�b�r barvy a tvaru
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        confetti.style.backgroundColor = color;

        // Nastaven� rozm�r�
        const size = Math.random() * 8 + 8 + "px";
        confetti.style.width = size;
        confetti.style.height = size;

        // Logika pro tvary
        if (shape === "circle") {
            confetti.style.borderRadius = "60%";
        } else if (shape === "diamond") {
            confetti.style.transform = "rotate(45deg)";
            // Aby se rotace z transformace netloukla s animac�, 
            // nastav�me ji rad�ji p��mo v kl��ov�ch sn�mc�ch n�e
        }
        // Square (�tvere�ek) nepot�ebuje extra styl, je to default

        confContainer.appendChild(confetti);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 600 + 200;
        const destX = Math.cos(angle) * velocity;
        const destY = Math.sin(angle) * velocity;

        // N�hodn� rotace pro efekt "m�h�n�" ve vzduchu
        const randomRotation = Math.random() * 1080 - 540;

        confetti.animate([
            {
                transform: `translate(-50%, -50%) scale(0) rotate(0deg)`,
                opacity: 1
            },
            {
                transform: `translate(calc(-50% + ${destX}px), calc(-50% + ${destY + 250}px)) scale(1) rotate(${randomRotation}deg)`,
                opacity: 0
            }
        ], {
            duration: Math.random() * 3000 + 5000, // Trv�n� 5-8 sekund
            easing: "cubic-bezier(0.1, 0.5, 0.2, 1)",
            fill: "forwards"
        }).onfinish = () => confetti.remove();
    }
}

function addSparklesToText(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    setInterval(() => {
        const sparkle = document.createElement("div");
        sparkle.className = "sparkle";

        // N�hodn� pozice v r�mci textu
        const rect = element.getBoundingClientRect();
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;

        sparkle.style.left = (rect.left + window.scrollX + x) + "px";
        sparkle.style.top = (rect.top + window.scrollY + y) + "px";

        // N�hodn� animace
        sparkle.style.animation = `sparkleAnim ${Math.random() * 0.5 + 0.5}s linear forwards`;

        document.body.appendChild(sparkle);

        // Odstran�n� jiskry po animaci
        setTimeout(() => sparkle.remove(), 1000);
    }, 150); // Jak rychle se jiskry objevuj� (men�� ��slo = v�c jisk�en�)
}

// Spust�me jisk�en� pro nadpis a instrukce
addSparklesToText("main-title");
addSparklesToText("initials");
addSparklesToText("wedding-date");


function startCountdown() {
    const targetDate = new Date(2026, 5, 6, 10, 0, 0).getTime();

    const timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff < 0) {
            clearInterval(timerInterval);
            document.querySelectorAll("#countdown, .countdown-container, .countdown-container_two").forEach(el => {
                el.innerHTML = "<span style='color:#b8860b; font-size:1.2rem;'>Dnes je náš den! 💕</span>";
            });
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        // 1. Aktualizace hlavní stránky (ID jsou unikátní)
        const d1 = document.getElementById("days");
        const h1 = document.getElementById("hours");
        const m1 = document.getElementById("minutes");
        const s1 = document.getElementById("seconds");

        if (d1) d1.innerText = d;
        if (h1) h1.innerText = h.toString().padStart(2, '0');
        if (m1) m1.innerText = m.toString().padStart(2, '0');
        if (s1) s1.innerText = s.toString().padStart(2, '0');

        // 2. Aktualizace VŠECH ostatních stránek (pomocí tříd)
        // querySelectorAll najde všechny výskyty a .forEach je všechny naráz přepíše
        document.querySelectorAll(".days-val").forEach(el => el.innerText = d);
        document.querySelectorAll(".hours-val").forEach(el => el.innerText = h.toString().padStart(2, '0'));
        document.querySelectorAll(".minutes-val").forEach(el => el.innerText = m.toString().padStart(2, '0'));
        document.querySelectorAll(".seconds-val").forEach(el => el.innerText = s.toString().padStart(2, '0'));

    }, 1000);
}

// ... (ponech začátek se stíráním až po funkci revealEverything beze změny) ...


// Spustit odpočet
startCountdown();

// Funkce zavolaná po potvrdícím kliknutí (např. tlačítko ANO)
function handleYesAnswer() {
    const inviteContainer = document.querySelector(".invite-text");

    if (inviteContainer) {
        inviteContainer.innerHTML = `<h2 style='font-family: "Great Vibes", cursive; font-size: 2rem; margin-top: 10px; line-height: 1.1;'>Děkuji ti moc ${guestName} a<br>budu se těšit!💚</h2>`;
        inviteContainer.style.opacity = "1";
    }

    const btnContainer = document.getElementById("button-container");
    if (btnContainer) {
        btnContainer.classList.remove("show");
        btnContainer.style.display = "none";
    }

    const infoBtn = document.getElementById("info-button-container");
    if (infoBtn) {
        infoBtn.style.display = "flex";
        setTimeout(() => {
            infoBtn.style.opacity = "1";
        }, 100);
    }

    // 5. Oslava!
    createConfetti();
}


// Logika pro utíkající NE
const noBtn = document.getElementById("noBtn");

if (noBtn) {
    const moveNoButton = () => {
        // Zvětšil jsem čísla, aby to byl pořádný skok
        const x = Math.random() * 300 - 150;
        const y = Math.random() * 200 - 100;

        // Přidáme i mírnou rotaci, aby to vypadalo, že se odrazilo
        const rot = Math.random() * 20 - 10;

        noBtn.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
    };

    // Utíká před myší
    noBtn.addEventListener("mouseover", moveNoButton);

    // Utíká před prstem na mobilu
    noBtn.addEventListener("touchstart", (e) => {
        e.preventDefault(); // Toto zastaví tu hlášku a kliknutí!
        moveNoButton();
    });
}

// Propojení tlačítka ANO s funkcí handleYesAnswer
const yesBtn = document.getElementById("yesBtn"); // Ujistěte se, že ID odpovídá vaše HTML (např. yesBtn)

if (yesBtn) {
    yesBtn.addEventListener("click", handleYesAnswer);
}

canvas.addEventListener("mousedown", (e) => {
    scratching = true; scratch(e); document.getElementById('instruction').style.opacity = "0";
    scratch(e);
});
canvas.addEventListener("touchstart", (e) => {
    scratching = true; scratch(e); document.getElementById('instruction').style.opacity = "0";
    scratch(e);
});
window.addEventListener("mousemove", scratch);
window.addEventListener("touchmove", scratch, { passive: false });
window.addEventListener("mouseup", () => scratching = false);
window.addEventListener("touchend", () => scratching = false);
window.addEventListener("resize", initCanvas);

// ======================================================
// 🐱 SVATEBNÍ KOČIČKA (Bez blokování srdíčka)
// ======================================================

(() => {
    const pet = document.getElementById("wedding-pet");
    const petImg = document.getElementById("wedding-pet-img");

    if (!pet || !petImg) return;

    const images = {
        idle: "idle.png",
        sit: "sit.png",
        walk: "walk.png"
    };

    const settings = {
       speed: 1.2,
       walkMin: 3000,
       walkMax: 7000,
       sitMin: 800,
       sitMax: 2000
    };

    let x = 20;
    let y = window.innerHeight - 100;

    let targetX = x;
    let targetY = y;

    let direction = 1;
    let walking = false;
    let timer = null;

    let lastFrameTime = 0;
    let currentWalkStep = 0;

    function setPetImage(type) {
        petImg.src = images[type];
    }

    function movePet(timestamp) {
        if (!walking) return;

        // Animace kroku
        if (!lastFrameTime) lastFrameTime = timestamp;
        if (timestamp - lastFrameTime > 200) {
            currentWalkStep = currentWalkStep === 0 ? 1 : 0;
            setPetImage(currentWalkStep === 0 ? "walk" : "idle");
            lastFrameTime = timestamp;
        }

        // Výpočet vzdálenosti k cíli
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Zastavení při dosažení cíle
        if (distance < 5) {
            stopAndSit();
            return;
        }

        // Posun kočky k cíli
        x += (dx / distance) * settings.speed;
        y += (dy / distance) * settings.speed;

        pet.style.left = `${x}px`;
        pet.style.top = `${y}px`;

        // Otočení obrázku podle směru chůze
        if (direction === -1) {
            pet.style.transform = "scaleX(-1)";
        } else {
            pet.style.transform = "scaleX(1)";
        }

        requestAnimationFrame(movePet);
    }

    function startWalking() {
        clearTimeout(timer);

        walking = true;
        lastFrameTime = 0;
        currentWalkStep = 0;

        setPetImage("walk");

        const petWidth = pet.offsetWidth || 60;
        const petHeight = pet.offsetHeight || 60;

        const maxX = window.innerWidth - petWidth - 20;
        const maxY = window.innerHeight - petHeight - 20;

        // Generování libovolného cíle na celé obrazovce
        targetX = Math.floor(Math.random() * (maxX - 20)) + 20;
        targetY = Math.floor(Math.random() * (maxY - 20)) + 20;

        direction = targetX < x ? -1 : 1;

        requestAnimationFrame(movePet);

        const time = Math.random() * (settings.walkMax - settings.walkMin) + settings.walkMin;

        timer = setTimeout(() => {
            stopAndSit();
        }, time);
    }

    function stopAndSit() {
        clearTimeout(timer);
        walking = false;
        setPetImage("sit");

        const time = Math.random() * (settings.sitMax - settings.sitMin) + settings.sitMin;

        timer = setTimeout(() => {
            startWalking();
        }, time);
    }

        // Reakce na kliknutí přímo na kočku
    pet.addEventListener("click", (e) => {
        e.stopPropagation(); // Zamezí šíření kliknutí na okolní prvky

        clearTimeout(timer);
        walking = false;

        setPetImage("idle");

        pet.classList.remove("pet-jump");
        void pet.offsetWidth;
        pet.classList.add("pet-jump");

        setTimeout(() => {
            pet.classList.remove("pet-jump");
            setPetImage("sit");

            timer = setTimeout(() => {
                startWalking();
            }, 600);
        }, 500);
    });


    // Kontrola hranic při změně velikosti okna
    window.addEventListener("resize", () => {
        const maxX = window.innerWidth - (pet.offsetWidth || 60) - 10;
        const maxY = window.innerHeight - (pet.offsetHeight || 60) - 10;

        if (x > maxX) x = maxX;
        if (y > maxY) y = maxY;
    });

    // Inicializace
    pet.style.left = `${x}px`;
    pet.style.top = `${y}px`;
    setPetImage("idle");

    setTimeout(() => {
        startWalking();
    }, 1500);
})();

