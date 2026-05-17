import { signOut } from '../lib/RegistroLogin';
import { getModels } from '../lib/modelo.js'
import { getProfile } from '../lib/profiles.js'

document.getElementById('PerOut').addEventListener('click', async () => {
  await signOut();
  window.location.href = '../Inicio/login.html';
})

document.getElementById('PerConf').addEventListener('click', () => {
  window.location.href = '../Profile/profile.html'
})

async function getModelCards() {
  const container = document.getElementById('sliderTrack');
  const models = await getModels();

  for (const model of models) {
    // Obtener perfil del creador
    const profile = await getProfile(model.user_id);

    // Cambiar el formato de la fecha a dias, meses y años
    const date = new Date(model.created_at)
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`

    // Crear tarjeta
    const card = document.createElement('div')
    card.className = 'card'
    card.innerHTML = `
      <div class="card-preview">
        <img src="${model.preview_img}" alt="${model.title}"/>
      </div>
      <div class="card-footer">
        <span class="dot" style="background-image: url('${profile.avatar_url}?t=${Date.now()}')"></span>
        <span class="name">${profile.username || 'Sin nombre'}</span>
        <span class="date">${formattedDate}</span>
      </div>
    `
    // Navegar al modelo al hacer click
    card.addEventListener('click', () => {
      window.location.href = `../Editar/Editar.html?id=${model.id}`
    })
    container.appendChild(card)
  }
}

getModelCards();

/* Carrusel */
const galleryContainer = document.querySelector('.gallery-container');
const galleryControlsContainer = document.querySelector('.gallery-controls');
const galleryControls = ['previous', 'next'];
const galleryItems = document.querySelectorAll('.gallery-item');
const userBut = document.getElementById('userBut');

class Carousel {
  constructor(container, items, controls) {
    this.carouselContainer = container;
    this.carouselControls = controls;
    this.carouselArray = [...items];
  }

  updateGallery() {
    this.carouselArray.forEach(el => {
      el.className = 'gallery-item';
    });

    this.carouselArray.slice(0, 5).forEach((el, i) => {
      el.classList.add(`gallery-item-${i + 1}`);
    });
  }

  setCurrentState(direction) {
    if (direction.className.includes('previous')) {
      this.carouselArray.unshift(this.carouselArray.pop());
    } else {
      this.carouselArray.push(this.carouselArray.shift());
    }
    this.updateGallery();
  }

  setControls() {
    this.carouselControls.forEach(control => {
      const button = document.createElement('button');
      button.className = `gallery-controls-${control}`;
      button.setAttribute('aria-label', control)
      galleryControlsContainer.appendChild(button);
    });
  }

  useControls() {
    const triggers = [...galleryControlsContainer.childNodes];
    triggers.forEach(control => {
      control.addEventListener('click', e => {
        e.preventDefault();
        this.setCurrentState(control);
      });
    });
  }
}

const exampleCarousel = new Carousel(
  galleryContainer,
  galleryItems,
  galleryControls
);

exampleCarousel.setControls();
exampleCarousel.useControls();
exampleCarousel.updateGallery();

/* Slider de archivos */
document.querySelectorAll(".slider").forEach(slider => {
  const track = slider.querySelector(".slider-track");
  const prev = slider.querySelector(".prev");
  const next = slider.querySelector(".next");

  next.addEventListener("click", () => {
    track.scrollLeft += 220;
  });

  prev.addEventListener("click", () => {
    track.scrollLeft -= 220;
  });
});

/* sobre nosotros */
const aboutImages = [
  {
    img: "ImgBusqueda/integrante1.jpg",
    name: "Nombre 1"
  },
  {
    img: "ImgBusqueda/integrante2.jpg",
    name: "Nombre 2"
  },
  {
    img: "ImgBusqueda/integrante3.jpg",
    name: "Nombre 3"
  }
];

let aboutIndex = 0;

const aboutPhoto = document.querySelector(".about-photo img");
const aboutName = document.querySelector(".about-name");
const aboutPrev = document.querySelector(".about-btn.prev");
const aboutNext = document.querySelector(".about-btn.next");

function updateAboutCarousel() {
  aboutPhoto.src = aboutImages[aboutIndex].img;
  aboutName.textContent = aboutImages[aboutIndex].name;
}

aboutNext.addEventListener("click", () => {
  aboutIndex = (aboutIndex + 1) % aboutImages.length;
  updateAboutCarousel();
});

aboutPrev.addEventListener("click", () => {
  aboutIndex =
    (aboutIndex - 1 + aboutImages.length) % aboutImages.length;
  updateAboutCarousel();
});

/* ayuda*/
const helpForm = document.getElementById("helpForm");

helpForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    nombre: document.getElementById("helpName").value.trim(),
    email: document.getElementById("helpEmail").value.trim(),
    asunto: document.getElementById("helpSubject").value,
    mensaje: document.getElementById("helpMessage").value.trim()
  };

  if (!data.nombre || !data.email || !data.asunto || !data.mensaje) {
    alert("Por favor completa todos los campos.");
    return;
  }

  console.log("Solicitud de ayuda enviada:", data);

  alert("Mensaje enviado correctamente ✅");

  helpForm.reset();
});

userBut.addEventListener('click', (e) =>{
  const menu = document.getElementById('desplegable');
  menu.classList.toggle('hidden');
})