const canvas = document.getElementById("scratch-canvas");
const ctx = canvas.getContext("2d");
const container = document.querySelector(".heart-container");
const instruction = document.getElementById("instruction");
const nextBtn = document.getElementById("next-btn");

// Zabránění nechtěnému označování nebo přetahování plátna
canvas.addEventListener('dragstart', (e) => e.preventDefault());
canvas.addEventListener('selectstart', (e) => e.preventDefault());

let scratching = false;

// 1. Načtení obrázku srdíčka
const heartImg = new Image();
heartImg.src = "heart.png";

// 2. Inicializace až po načtení obrázku
heartImg.onload = () => {
    initCanvas();
};

// Pokud se obrázek nenačte (např. špatný název nebo cesta), použije se zlaté srdce
heartImg.onerror = () => {
    console.error("Obrázek heart.png se nepodařilo načíst! Používám záložní barvu.");
    initCanvas();
};

function initCanvas() {
    // Načte přesné aktuální rozměry kontejneru z obrazovky
    const w = container ? container.offsetWidth : 320;
    const h = container ? container.offsetHeight : 350;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.scale(dpr, dpr);

    if (heartImg.complete && heartImg.naturalWidth !== 0) {
        // 1. Vytvoření zlatého podkladu v paměti
        const goldCanvas = document.createElement("canvas");
        goldCanvas.width = canvas.width;
        goldCanvas.height = canvas.height;
        const gCtx = goldCanvas.getContext("2d");
        gCtx.scale(dpr, dpr);

        gCtx.drawImage(heartImg, 0, 0, w, h);
        gCtx.globalCompositeOperation = "source-in";
        gCtx.fillStyle = "#dce0ff";
        gCtx.fillRect(0, 0, w, h);

        // 2. Nastavení zlatého podkladu pro text
        const revealText = document.querySelector(".reveal-text");
        if (revealText) {
            revealText.style.backgroundImage = `url(${goldCanvas.toDataURL()})`;
            revealText.style.backgroundSize = "contain";
            revealText.style.backgroundRepeat = "no-repeat";
            revealText.style.backgroundPosition = "center";
        }

        // 3. Vykreslení stírací vrstvy (růží)
        ctx.drawImage(heartImg, 0, 0, w, h);
    }
}

// Pojistka: při změně velikosti okna (např. otočení mobilu) se plátno přizpůsobí
window.addEventListener("resize", () => {
    // Překreslit pouze pokud ještě nebylo setřeno
    if (canvas.style.display !== "none") {
        initCanvas();
    }
});

let hasRevealed = false;

canvas.style.cursor = "pointer";

canvas.addEventListener("click", () => {
    if (hasRevealed) return;

    // 1. Spustíme animaci zatřesení
    canvas.classList.add("shake-heart");

    // 2. Po dokončení třesení (800 ms) spustíme konfety a odhalení
    setTimeout(() => {
        canvas.classList.remove("shake-heart");
        revealEverything();
    }, 800);
});

function revealEverything() {
    if (hasRevealed) return;
    hasRevealed = true;

    // const mainTitle = document.getElementById("main-title");
    
   // if (mainTitle) {

   //     mainTitle.style.transition = "opacity 0.6s ease";

   //    mainTitle.style.opacity = "0";
   //  }

    // 2. Spuštění trvajících konfet (např. po dobu 3 sekund)
    if (typeof confetti === "function") {
        const diamond = confetti.shapeFromPath({
            path: 'M 0 -10 L 7 0 L 0 10 L -7 0 Z'
        });

        const duration = 3 * 1000; // Doba trvání v milisekundách (3 sekundy)
        const animationEnd = Date.now() + duration;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval); // Po uplynutí času zastavíme generování
            }

            // Vystřelujeme v průběhu času menší dávky z obou stran
            confetti({
                particleCount: 12,
                spread: 60,
                origin: { x: 0.2, y: 0.6 }, // Výstřel zleva
                colors: ['#636ee6', '#b8d4d7', '#e4def5', '#ffffff'],
                shapes: ['heart', diamond],
                scalar: 1.2
            });

            confetti({
                particleCount: 12,
                spread: 60,
                origin: { x: 0.8, y: 0.6 }, // Výstřel zprava
                colors: ['#636ee6', '#b8d4d7', '#e4def5', '#ffffff'],
                shapes: ['heart', diamond],
                scalar: 1.2
            });
        }, 200); // Každých 200 ms vyletí nová vlna
    }

    // 2. Postupné schování stírací vrstvy a instrukce
    canvas.style.transition = "opacity 0.8s ease";
    canvas.style.opacity = "0";

    if (instruction) {
        instruction.style.transition = "opacity 0.5s ease";
        instruction.style.opacity = "0";
    }

    // 3. Zobrazení tlačítka
    setTimeout(() => {
        canvas.style.display = "none";
        if (nextBtn) {
            nextBtn.classList.add("visible");
        }
    }, 800);
}

// Funkce pro otevření detailů pozvánky po kliknutí na tlačítko
function openDetails() {
    const scratchScreen = document.getElementById("scratch-screen");
    const contentScreen = document.getElementById("content-screen");

    if (scratchScreen) scratchScreen.style.display = "none";
    if (contentScreen) {
        contentScreen.classList.add("active");
    }
}

// ======================================================
// 🐱 SVATEBNÍ KOČIČKY (Dvě nezávislé kočky)
// ======================================================

function createPet(containerId, imgId, startX, startY) {
    const pet = document.getElementById(containerId);
    const petImg = document.getElementById(imgId);

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

    let x = startX;
    let y = startY;

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

        if (!lastFrameTime) lastFrameTime = timestamp;
        if (timestamp - lastFrameTime > 200) {
            currentWalkStep = currentWalkStep === 0 ? 1 : 0;
            setPetImage(currentWalkStep === 0 ? "walk" : "idle");
            lastFrameTime = timestamp;
        }

        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
            stopAndSit();
            return;
        }

        x += (dx / distance) * settings.speed;
        y += (dy / distance) * settings.speed;


        x = nextX;
        y = nextY;

        pet.style.left = `${x}px`;
        pet.style.top = `${y}px`;

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

    // Kliknutí na kočku (vyskočení)
    pet.addEventListener("click", (e) => {
        e.stopPropagation();

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

    // Úprava pozice při změně okna
    window.addEventListener("resize", () => {
        const maxX = window.innerWidth - (pet.offsetWidth || 60) - 10;
        const maxY = window.innerHeight - (pet.offsetHeight || 60) - 10;

        if (x > maxX) x = maxX;
        if (y > maxY) y = maxY;
    });

    // Start
    pet.style.left = `${x}px`;
    pet.style.top = `${y}px`;
    setPetImage("idle");

    setTimeout(() => {
        startWalking();
    }, 1000 + Math.random() * 1000); // Různý start, aby nechodily synchronně
}

// Inicializace 1. a 2. kočky (startují z různých rohů)
createPet("wedding-pet", "wedding-pet-img", 20, window.innerHeight - 100);
createPet("wedding-pet-2", "wedding-pet-img-2", window.innerWidth - 80, window.innerHeight - 100);
