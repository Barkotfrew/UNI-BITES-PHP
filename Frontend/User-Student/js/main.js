document.querySelectorAll(".hero-image img, .Cafe-card img").forEach(img => {
    img.style.transition = "transform 0.4s ease, box-shadow 0.4s ease";

    img.addEventListener("mouseenter", () => {
        img.style.transform = "scale(1.05)";
        img.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
    });

    img.addEventListener("mouseleave", () => {
        img.style.transform = "scale(1)";
        img.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
    });
});
