const productLinks = document.querySelectorAll('.product-list .product');

productLinks.forEach(product => {
    product.addEventListener('click', function (event) {
        event.preventDefault();

        this.classList.add('blur-on-click'); // Add blur class

        const link = this.querySelector('a');
        const href = link ? link.getAttribute('href') : null;

        setTimeout(() => {
            if (href) {
                window.location.href = href;
            } else {
                console.error("No link found in product block");
            }
        }, 500); // Match transition duration
    });
});
