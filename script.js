/* ======  HELPERS  ====== */
const $ = q => document.querySelector(q);
const toast = (msg, time = 2500) => {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), time);
};

/* ======  CLOCK  ====== */
const updateTime = () => {
  const now = new Date();
  $('#time').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
updateTime();
setInterval(updateTime, 1000);

/* ======  PULL-TO-REFRESH  ====== */
let pullStart = 0;
$('#scroller').addEventListener('touchstart', e => pullStart = e.touches[0].screenY);
$('#scroller').addEventListener('touchmove', e => {
  const y = e.touches[0].screenY;
  if ($('#scroller').scrollTop === 0 && y - pullStart > 80) $('.ptr').classList.add('active');
});
$('#scroller').addEventListener('touchend', () => {
  if ($('.ptr').classList.contains('active')) {
    $('.ptr').classList.remove('active');
    toast('Content refreshed');
  }
});

/* ======  BOTTOM TABS  ====== */
document.querySelectorAll('.tab').forEach(t =>
  t.addEventListener('click', e => {
    // Empêcher le comportement par défaut seulement pour les ancres
    if (t.getAttribute('href').startsWith('#')) {
      e.preventDefault();
    }
    
    document.querySelector('.tab.active').classList.remove('active');
    t.classList.add('active');
    const label = t.querySelector('span').textContent;
    toast(`Switched to ${label}`);
  })
);

/* ======  3-D CARD TILT  ====== */
document.querySelectorAll('.card, .contact-card').forEach(c => {
  c.addEventListener('mousemove', e => {
    const { left, top, width, height } = c.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 10;
    const y = (e.clientY - top - height / 2) / 10;
    c.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) scale(1.02)`;
  });
  c.addEventListener('mouseleave', () => c.style.transform = '');
});

/* ======  SERVICE-WORKER  ====== */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('data:text/javascript,' + encodeURIComponent(`
    self.addEventListener('install', e => e.waitUntil(caches.open('v1').then(c => c.addAll(['/']))));
    self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
  `));
}

/* ======  ANCHOR NAVIGATION  ====== */
function handleAnchorNavigation() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Si c'est une ancre interne
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ 
            behavior: 'smooth' 
          });
          toast(`Navigated to ${href.substring(1)}`);
        }
      }
    });
  });
}

// Initialisation au chargement du document
document.addEventListener('DOMContentLoaded', function() {
  handleAnchorNavigation();
  
  // Gestion spécifique du lien de contact
  const contactTab = document.querySelector('.tab[href="#saved"]');
  if (contactTab) {
    contactTab.addEventListener('click', function(e) {
      e.preventDefault();
      const contactSection = document.querySelector('.contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ 
          behavior: 'smooth' 
        });
        toast('Contact section');
        
        // Mise à jour de l'onglet actif
        document.querySelector('.tab.active').classList.remove('active');
        this.classList.add('active');
      } else {
        toast('Contact section not available');
      }
    });
  }
  
  // Gestion du clic sur le lien Instagram
  const instagramLink = document.querySelector('a[href*="instagram.com"]');
  if (instagramLink) {
    instagramLink.addEventListener('click', function(e) {
      e.preventDefault();
      toast('Opening Instagram');
      setTimeout(() => {
        window.open(this.href, '_blank');
      }, 1000);
    });
  }
});