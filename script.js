// Handle scroll reveal animations
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Stop observing once it's visible
        }
    });
};

const revealOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Trigger when 15% of the element is visible
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => revealObserver.observe(el));

// Sticky Navbar Background on Scroll
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.background = 'var(--glass-bg)';
        header.style.boxShadow = 'none';
    }
});

// "Go to top" button functionality
const mybutton = document.getElementById("myBtn");

window.addEventListener('scroll', scrollFunction);

function scrollFunction() {
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    mybutton.classList.add('show');
  } else {
    mybutton.classList.remove('show');
  }
}

function topFunction() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// PDF button functionality for mobile devices
const pdfButton = document.querySelector('.pdf-button');
if (pdfButton) {
    pdfButton.addEventListener('click', function (e) {
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            e.preventDefault();
            window.open(this.href, '_blank');
        }
    });
}
