// Functionality for product links to add a blur effect on click
const productLinks = document.querySelectorAll('.product-list .product');

productLinks.forEach(product => {
    product.addEventListener('click', function (event) {
        // Prevent default link behavior to allow for the blur transition
        event.preventDefault();

        // Add the blur class to the clicked product
        this.classList.add('blur-on-click');

        // Get the actual link (anchor tag) within the product div
        const link = this.querySelector('a');
        const href = link ? link.getAttribute('href') : null;

        // After a short delay (matching the CSS transition duration), navigate to the link
        setTimeout(() => {
            if (href) {
                window.location.href = href;
            } else {
                console.error("No link found in product block");
            }
        }, 500); // This delay should match the transition duration in style.css for .blur-on-click
    });
});

// Get the "Go to top" button
let mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document with a smooth animation
function topFunction() {
  const scrollDuration = 500; // Duration of the scroll animation in milliseconds (0.5 seconds)

  const startLocation = document.documentElement.scrollTop || document.body.scrollTop; // Current scroll position
  const targetPosition = 0; // Target scroll position (top of the page)
  let startTime = null; // To keep track of animation start time

  // Animation function for smooth scrolling
  const animate = (currentTime) => {
    if (startTime === null) startTime = currentTime; // Set start time on first call
    const timeElapsed = currentTime - startTime; // Time elapsed since animation started
    const progress = Math.min(timeElapsed / scrollDuration, 1); // Calculate progress (0 to 1)

    // Easing function (linear in this case, but can be changed for different effects)
    const easedProgress = progress;

    // Calculate the new scroll position
    const scroll = targetPosition + (startLocation - targetPosition) * (1 - easedProgress);

    // Apply the scroll position to both document.documentElement and document.body for cross-browser compatibility
    document.documentElement.scrollTop = scroll;
    document.body.scrollTop = scroll;

    // Continue animation if not yet at the target position
    if (progress < 1) {
      window.requestAnimationFrame(animate);
    }
  };

  // Start the animation
  window.requestAnimationFrame(animate);
}

// PDF button functionality for mobile devices
document.querySelector('.pdf-button').addEventListener('click', function (e) {
    // Check if the user agent indicates a mobile device
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        e.preventDefault(); // Prevent default link behavior
        // Open the PDF in a new tab for mobile devices
        window.open('images/2024-11-19 SAK Confectioners (Pty) Ltd ta Z Snacks Letter of Confirmation-1.pdf', '_blank');
    }
});
