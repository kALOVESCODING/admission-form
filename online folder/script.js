const menuBtn = document.getElementById("menuBtn");
const siteNav = document.getElementById("siteNav");
const themeChips = [...document.querySelectorAll(".theme-chip")];
const themeName = document.getElementById("themeName");
const themeText = document.getElementById("themeText");
const subscribeForm = document.getElementById("subscribeForm");
const emailInput = document.getElementById("emailInput");
const formNote = document.getElementById("formNote");
const revealItems = document.querySelectorAll("[data-reveal]");

const themeContent = {
  pearl: {
    bodyClass: "",
    name: "Pearl Current",
    text: "Bright, airy, and gallery-like with soft metallic contrast for a clean premium first impression."
  },
  sand: {
    bodyClass: "theme-sand",
    name: "Sand Mode",
    text: "Warmer, softer, and more tactile with a sunlit palette that keeps the luxury mood easy and modern."
  },
  night: {
    bodyClass: "theme-night",
    name: "Night Shift",
    text: "Darker and sharper with high-contrast typography for a more cinematic, after-hours fashion energy."
  }
};

if (menuBtn && siteNav) {
  menuBtn.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });
}

themeChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const { theme } = chip.dataset;
    const config = themeContent[theme];

    document.body.classList.remove("theme-sand", "theme-night");
    if (config.bodyClass) {
      document.body.classList.add(config.bodyClass);
    }

    themeChips.forEach((item) => item.classList.remove("is-active"));
    chip.classList.add("is-active");
    themeName.textContent = config.name;
    themeText.textContent = config.text;
  });
});

if (subscribeForm) {
  subscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!valid) {
      formNote.textContent = "Please enter a valid email address to join the members club.";
      formNote.style.color = "#cf4c3c";
      return;
    }

    formNote.textContent = "You are in. First-access updates and trend drops will land in your inbox.";
    formNote.style.color = "inherit";
    subscribeForm.reset();
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.16
});

revealItems.forEach((item) => observer.observe(item));
