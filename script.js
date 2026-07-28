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

