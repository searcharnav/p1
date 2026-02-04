/* script.js
   Interactivity: carousel, keyboard support, typed notes, heart/confetti effects,
   card flip for touch devices, accessible controls.
*/


/* -------------------------
   CONFIGURE / CUSTOMIZE BELOW
   -------------------------
*/
const config = {
  // Change the displayed name (used in typed messages if you want)
  // If you want to change the name visible in the heading, change it in index.html directly.
  name: "Noyonica",


  // Messages shown in the "Love notes" typed panel.
  // Edit text here. Keep them short for nicer typing animation.
  messages: [
    `I love you because you make every day brighter, kinder and more fun. — Love, Abhi`,
    `My favorite memory is our rainy day walk — your laugh that day is still my favorite song.`,
    `I promise to learn with you, laugh with you, and be there—every day.`
  ],


  // Slideshow image filenames (must exist in images/). Add or remove filenames here.
  slides: [
  "photo1.jpg",
  "photo2.jpg",
  "photo3.jpg"
],


  // Carousel autoplay interval (ms)
  slideInterval: 4200
};


/* -------------------------
   CAROUSEL IMPLEMENTATION
   ------------------------- */
const slidesContainer = document.getElementById('slides');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const playPauseBtn = document.getElementById('playPause');


let current = 0;
let playing = true;
let slideTimer = null;


function goToSlide(n){
  const slideCount = slidesContainer.children.length;
  current = (n + slideCount) % slideCount;
  slidesContainer.style.transform = `translateX(${-current * 100}%)`;
  // update accessible label
  slidesContainer.setAttribute('aria-describedby', `Slide ${current + 1} of ${slideCount}`);
}


function nextSlide(){ goToSlide(current + 1); }
function prevSlide(){ goToSlide(current - 1); }


function startAuto(){ if(slideTimer) clearInterval(slideTimer); slideTimer = setInterval(nextSlide, config.slideInterval); playing = true; playPauseBtn.textContent = '⏸'; playPauseBtn.setAttribute('aria-label','Pause slideshow'); }
function stopAuto(){ if(slideTimer) clearInterval(slideTimer); slideTimer = null; playing = false; playPauseBtn.textContent = '▶'; playPauseBtn.setAttribute('aria-label','Play slideshow'); }


playPauseBtn.addEventListener('click', () => { playing ? stopAuto() : startAuto(); });


nextBtn.addEventListener('click', () => { nextSlide(); if(playing) startAuto(); });
prevBtn.addEventListener('click', () => { prevSlide(); if(playing) startAuto(); });


// keyboard left/right support when carousel has focus
slidesContainer.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowLeft') { prevSlide(); if(playing) startAuto(); }
  if(e.key === 'ArrowRight') { nextSlide(); if(playing) startAuto(); }
});


// build slides from config (if you prefer to manage in HTML change here)
(function buildSlides(){
  const existingSlides = slidesContainer.querySelectorAll('.slide');
  if(existingSlides.length === config.slides.length){
    // use existing elements in HTML
    return;
  }
  // else, clear and generate (fallback)
  slidesContainer.innerHTML = '';
  config.slides.forEach(src => {
    const s = document.createElement('div');
    s.className = 'slide';
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Photo slide';
    img.onerror = function(){ this.classList.add('img-missing'); };
    s.appendChild(img);
    slidesContainer.appendChild(s);
  });
})();


/* start carousel */
goToSlide(0);
startAuto();


/* -------------------------
   TYPED MESSAGES (LOVE NOTES)
   ------------------------- */
const typedTextEl = document.getElementById('typedText');
const typeArea = document.getElementById('typeArea');
const noteBtns = document.querySelectorAll('.note-btn');


function typeMessage(text, el, speed = 28){
  el.textContent = '';
  let i = 0;
  return new Promise(resolve => {
    function step(){
      if(i <= text.length){
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else resolve();
    }
    step();
  });
}


// When clicking a note button
noteBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    const idx = parseInt(btn.getAttribute('data-index'), 10) || 0;
    const message = config.messages[idx] || 'Message not set.';
    // accessibility: announce
    typeArea.setAttribute('aria-busy', 'true');
    await typeMessage(message, typedTextEl);
    typeArea.setAttribute('aria-busy', 'false');
    typeArea.focus();
  });
});


/* -------------------------
   HEART CTA: hearts and confetti
   ------------------------- */
const heartCta = document.getElementById('heart-cta');


function createFloatingHeart(x, y){
  const el = document.createElement('div');
  el.className = 'floating-heart';
  el.style.left = `${x - 10}px`;
  el.style.top = `${y - 10}px`;
  el.textContent = ['💖','❤️','💕','💘'][Math.floor(Math.random()*4)];
  document.body.appendChild(el);
  // remove after animation
  setTimeout(()=> el.remove(), 1900);
}


function createConfettiBurst(centerX, centerY, count=24){
  for(let i=0;i<count;i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    // random color variations from palette
    const colors = ['#ff6ea0','#ffb6d5','#ffd6ea','#ff94bf','#ffc4df'];
    c.style.background = colors[Math.floor(Math.random()*colors.length)];
    c.style.left = `${centerX + (Math.random()*160 - 80)}px`;
    c.style.top = `${centerY + (Math.random()*20 - 10)}px`;
    // random delay and animation-duration
    const delay = Math.random() * 0.2;
    const dur = 1.6 + Math.random()*0.8;
    c.style.animationDelay = `${delay}s`;
    c.style.animationDuration = `${dur}s`;
    // random rotation
    c.style.transform = `rotate(${Math.random()*320}deg)`;
    document.body.appendChild(c);
    // cleanup
    setTimeout(()=> c.remove(), (delay + dur + 0.2) * 1000);
  }
}


heartCta.addEventListener('click', (ev) => {
  const rect = heartCta.getBoundingClientRect();
  const centerX = rect.left + rect.width/2;
  const centerY = rect.top + rect.height/2;


  // Toggle aria-pressed
  const pressed = heartCta.getAttribute('aria-pressed') === 'true';
  heartCta.setAttribute('aria-pressed', String(!pressed));


  // small burst of hearts
  for(let i=0;i<8;i++){
    setTimeout(()=> createFloatingHeart(centerX + (Math.random()*80 - 40), centerY + (Math.random()*40 - 20)), i * 80);
  }


  // confetti
  createConfettiBurst(centerX, centerY, 32);
});


/* Accessibility: allow Enter/Space to activate the CTA */
heartCta.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); heartCta.click(); }
});


/* -------------------------
   Card flip for touch devices: click toggles flip class
   ------------------------- */
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
    const inner = card.querySelector('.card-inner');
    if(card.classList.contains('flipped')){
      inner.style.transform = 'rotateY(180deg)';
    } else {
      inner.style.transform = '';
    }
  });


  // keyboard toggle for accessibility
  card.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      card.click();
    }
  });
});


/* -------------------------
   IMAGE FALLBACK: Replace missing images with a CSS-friendly placeholder
   ------------------------- */
// Already handled by onerror -> .img-missing class in HTML/CSS


/* -------------------------
   END of script.js

   ------------------------- */
