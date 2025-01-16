const productLinks = document.querySelectorAll('.product-list a'); 

productLinks.forEach(link => {
  link.addEventListener('click', function(event) {
    event.preventDefault();
    this.querySelector('img').classList.add('fade-out'); 

    setTimeout(function() {
      window.location.href = link.href;
    }, 1000); // 1 second delay (adjust as needed)
  });
});
