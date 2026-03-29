const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt || "";
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("active");
  lightboxImg.src = "";
  lightboxImg.alt = "";
  document.body.style.overflow = "";
}

document.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLImageElement)) {
    return;
  }

  const isLightboxImage = target.closest("#lightbox");

  if (isLightboxImage) {
    closeLightbox();
    return;
  }

  openLightbox(target.src, target.alt);
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
  }
});

document.querySelectorAll(".thumbs img, .gallery-card img").forEach((img) => {
  const probe = new Image();
  probe.src = img.src;

  probe.onload = () => {
    const isPortrait = probe.height > probe.width;

    if (isPortrait) {
      img.style.objectPosition = "top center";
    } else {
      img.style.objectPosition = "center center";
    }
  };
});
