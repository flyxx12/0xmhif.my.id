(function() {
    // Intersection Observer untuk animasi card
    const cards = document.querySelectorAll('.card');
    
    if (cards.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('muncul');
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1, 
            rootMargin: "0px 0px -20px 0px" 
        });
        
        cards.forEach(card => observer.observe(card));
    } else {
        cards.forEach(card => card.classList.add('muncul'));
    }

    // Logo scroll ke atas
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Smooth scroll untuk anchor link
    const navHeight = 80;
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - navHeight;
                
                window.scrollTo({ 
                    top: offsetPosition, 
                    behavior: 'smooth' 
                });
            }
        });
    });
})();

// --- SPOTIFY PREMIUM LOGIC PLAYER ---


// --- SKELETON LOADING LOGIC ---
window.addEventListener('load', function() {
    const skeleton = document.getElementById('skeleton-loader');
    
    // Hilangkan skeleton setelah 1.5 detik (sesuaiin aja)
    setTimeout(() => {
        skeleton.classList.add('fade-out');
    }, 1500);
});

// --- IMPROVED FLOATING NAV LOGIC ---
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll("section");

function updateActiveNav() {
    let current = "";
    
    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        // Deteksi section yang paling banyak makan tempat di tengah layar
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            current = section.getAttribute("id");
        }
    });

    navItems.forEach((item) => {
        item.classList.remove("active");
        const href = item.getAttribute("href").substring(1);
        if (href === current) {
            item.classList.add("active");
        }
    });
}

window.addEventListener('scroll', () => {
    let current = "";
    const sections = document.querySelectorAll('section');
    const navItems = // Tambahin efek feedback dikit pas diklik manual
document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', function() {
        // Hapus active dari yang lain dulu biar cepet
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // Haptic feedback (getar dikit kalo di HP Android, opsional)
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10);
        }
    });
});


    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        // Pastiin pencocokan ID bener
        if (item.getAttribute('href') === `#${current}`) {
            item.classList.add('active');
        }
    });
});


// 1. Scroll Reveal - Munculin elemen pas di-scroll
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = "0";
    section.style.transform = "translateY(20px)";
    section.style.transition = "all 0.6s ease-out";
    observer.observe(section);
});

// --- ACTIVE LINK HIGHLIGHTER FIXED ---
window.addEventListener('scroll', () => {
    let current = "";
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        // Pake endsWith biar lebih akurat nyocokin ID nya
        if (item.getAttribute('href').includes(current) && current !== "") {
            item.classList.add('active');
        }
    });
}, { passive: true }); // Tambahin passive biar scroll tetep enteng


const scrollReveal = () => {
    const reveals = document.querySelectorAll('section, .career-item');
    
    reveals.forEach(el => {
        const windowHeight = window.innerHeight;
        const revealTop = el.getBoundingClientRect().top;

        if (revealTop < windowHeight - 100) {
            el.style.opacity = "1";
            // Pake translate3d biar dapet akselerasi hardware tanpa ngerusak rasio
            el.style.transform = "translate3d(0, 0, 0)"; 
        } else {
            el.style.opacity = "0";
            el.style.transform = "translate3d(0, 30px, 0)";
        }
    });
};


// Set initial style
document.querySelectorAll('section, .career-item').forEach(el => {
    el.style.transition = "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.opacity = "0";
    el.style.transform = "translateY(30px) scale(0.95)";
});

window.addEventListener('scroll', scrollReveal);
window.addEventListener('load', scrollReveal);

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

// Update ukuran layar pas di-rotate atau resize
window.addEventListener('resize', () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
});

document.addEventListener('mousemove', (e) => {
    // Matiin di layar kecil atau HP tegak biar gak berat/gepeng
    if (windowWidth < 768 && windowHeight > windowWidth) return; 

    const cards = document.querySelectorAll('.about-card, .spotify-card');
    
    // Hitung titik tengah yang dinamis
    const x = (windowWidth / 2 - e.pageX) / 60; // Angka pembagi gedein biar gak terlalu miring
    const y = (windowHeight / 2 - e.pageY) / 60;
    
    cards.forEach(card => {
        requestAnimationFrame(() => {
            // Pake 'perspective' biar efek 3D-nya stabil gak gepeng
            card.style.transform = `perspective(1000px) translateY(-5px) rotateY(${x}deg) rotateX(${y}deg)`;
        });
    });
});

window.addEventListener('orientationchange', () => {
    // Paksa browser hitung ulang layout biar gak nyangkut visual gepengnya
    document.body.style.display = 'none';
    document.body.offsetHeight; // trigger reflow
    document.body.style.display = 'block';
});

// ==========================================
// PARALLAX CONTROLLER (OPTIMIZED WITH RAF)
// ==========================================
(function() {
    let latestScrollY = 0;
    let ticking = false;

    // Elemen target parallax
    const bgGrid = document.querySelector('.bg-grid');
    const header = document.querySelector('header');
    const headerTitle = document.querySelector('header h1');
    const headerSubtitle = document.querySelector('header h2');
    const kbContainer = document.querySelector('.kb-container');
    const cards = document.querySelectorAll('.card, .about-card, .contact-card');

    function updateParallax() {
        const scrolled = latestScrollY;

        // 1. Background Grid Parallax (Sangat lambat / terpisah)
        if (bgGrid) {
            bgGrid.style.transform = `translate3d(0, ${scrolled * 0.15}px, 0)`;
        }

        // 2. Header Content Parallax (Efek Meredup & Terpisah saat Scroll)
        if (header) {
            if (scrolled < 800) {
                header.style.transform = `translate3d(0, ${scrolled * 0.35}px, 0)`;
                header.style.opacity = `${1 - scrolled / 600}`;
            }
        }

        if (headerTitle) {
            headerTitle.style.transform = `translate3d(0, ${scrolled * -0.1}px, 0)`;
        }

        if (headerSubtitle) {
            headerSubtitle.style.transform = `translate3d(0, ${scrolled * 0.15}px, 0)`;
        }

        // 3. Keyboard 3D Safe Parallax (Anti-Gepeng / Anti-Garis)
        if (kbContainer) {
            const rect = kbContainer.getBoundingClientRect();
            if (rect.top < winHeight && rect.bottom > 0) {
                // Batasi pergerakan sudut biar gak over-rotate di layar HP
                const progress = (winHeight / 2 - rect.top) / winHeight;
                const safeRotX = Math.min(Math.max(28 + (progress * 8), 15), 35); // Lock antara 15deg - 35deg
                const safeYOffset = progress * 20;

                kbContainer.style.transform = `rotateX(${safeRotX}deg) rotateY(-5deg) rotateZ(1deg) translate3d(0, ${safeYOffset}px, 0)`;
            }
        }


        // 4. Parallax Bertingkat pada Grid Cards
        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                // Memberikan variasi kecepatan antar kartu bertetangga
                const speed = (index % 2 === 0) ? 0.05 : -0.05;
                const yPos = (window.innerHeight / 2 - rect.top) * speed;
                card.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }
        });

        ticking = false;
    }

    function onScroll() {
        latestScrollY = window.scrollY;
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    // Jalankan listener jika bukan di layar mobile kecil/perangkat hemat daya
    if (window.innerWidth > 480) {
        window.addEventListener('scroll', onScroll, { passive: true });
    }
})();

// ==========================================
// EXTREME 3D PARALLAX CONTROLLER (60 FPS)
// ==========================================
(function() {
    let ticking = false;

    const bgGrid = document.querySelector('.bg-grid');
    const header = document.querySelector('header');
    const badge = document.querySelector('header .badge');
    const h1 = document.querySelector('header h1');
    const h2 = document.querySelector('header h2');
    const kbContainer = document.querySelector('.kb-container');
    const cards = document.querySelectorAll('.grid .card');
    const aboutCard = document.querySelector('.about-card');

    function updateParallax() {
        const scrolled = window.scrollY;
        const winHeight = window.innerHeight;

        // 1. Grid Background Parallax Ngebut
        if (bgGrid) {
            bgGrid.style.transform = `translate3d(0, ${scrolled * 0.4}px, 0)`;
        }

        // 2. Header Extreme 3D Zoom & Scale Out
        if (header && scrolled < 900) {
            const progress = scrolled / 700;
            const scale = Math.max(0.75, 1 - progress * 0.3);
            const blur = Math.min(12, progress * 15);
            const opacity = Math.max(0, 1 - progress * 1.2);

            header.style.transform = `translate3d(0, ${scrolled * 0.55}px, 0) scale(${scale})`;
            header.style.filter = `blur(${blur}px)`;
            header.style.opacity = opacity;

            // Parallax terpisah buat teks di dalam header (Depth Effect)
            if (badge) badge.style.transform = `translate3d(0, ${scrolled * -0.2}px, 50px)`;
            if (h1) h1.style.transform = `translate3d(0, ${scrolled * 0.1}px, 30px)`;
            if (h2) h2.style.transform = `translate3d(0, ${scrolled * 0.25}px, 10px)`;
        }

        // 3. Keyboard 3D Interactive Tilt & Rotasi pas Scroll
        if (kbContainer) {
            const rect = kbContainer.getBoundingClientRect();
            if (rect.top < winHeight && rect.bottom > 0) {
                // Rotasi berubah menyesuaikan posisi scroll
                const factor = (winHeight / 2 - rect.top) * 0.04;
                const rotX = 28 + factor;
                const rotY = -10 + (factor * 0.5);
                kbContainer.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(2deg) translate3d(0, ${factor * 1.5}px, 0)`;
            }
        }

        // 4. Staggered 3D Card Depth (Kartu ganjil & genap gerak beda arah)
        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            if (rect.top < winHeight && rect.bottom > 0) {
                const centerDiff = (winHeight / 2) - (rect.top + rect.height / 2);
                // Kartu ganjil maju, kartu genap mundur di Z-axis
                const speed = (index % 2 === 0) ? 0.12 : -0.12;
                const yOffset = centerDiff * speed;
                const zOffset = Math.abs(centerDiff) * -0.08; 

                card.style.transform = `translate3d(0, ${yOffset}px, ${zOffset}px)`;
            }
        });

        // 5. About Card Floating Parallax
        if (aboutCard) {
            const rect = aboutCard.getBoundingClientRect();
            if (rect.top < winHeight && rect.bottom > 0) {
                const yOffset = (winHeight / 2 - rect.top) * 0.08;
                aboutCard.style.transform = `translate3d(0, ${yOffset}px, 20px)`;
            }
        }

        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
})();
