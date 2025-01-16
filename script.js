const productLinks = document.querySelectorAll('.product-list .product'); // Select product blocks

productLinks.forEach(product => {
  product.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default link behavior
    this.classList.add('fade-out'); // Add fade-out class to the product div

    const link = this.querySelector('a'); // Get the link inside the product
    const href = link ? link.getAttribute('href') : null; // Get the href or null if no link

    setTimeout(() => {
        if (href) {
            window.location.href = href;
        } else {
            console.error("No link found in product block");
        }
    }, 500); // 0.5 second delay (500 milliseconds)
  });
});
