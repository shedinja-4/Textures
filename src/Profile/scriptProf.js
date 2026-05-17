import { requireAuth } from '../lib/RegistroLogin.js';
import { getProfile, updateProfile, updateAvatar } from '../lib/profiles.js';
import { getModelsByUser } from '../lib/modelo.js'

import supabase from '../lib/supabase.js';

const user = await requireAuth('/Inicio/Login.html');

async function getModelCards() {
  const container = document.getElementById('sliderTrack');
  const models = await getModelsByUser(user.id);

  if(models.length == 0){
    const card = document.createElement('div');
    card.className = 'noCards';
    card.textContent = "You still don't have any project";
    container.appendChild(card);
  }
  else{
    for (const model of models) {
        // Obtener perfil del creador
        const profile = await getProfile(model.user_id);

        // Cambiar el formato de la fecha a dias, meses y años
        const date = new Date(model.created_at)
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

        // Crear tarjeta
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `;
        <div class="card-preview">
            <img src="${model.preview_img}" alt="${model.title}"/>
        </div>
        <div class="card-footer">
            <span class="dot" style="background-image: url('${profile.avatar_url}?t=${Date.now()}')"></span>
            <span class="name">${profile.username || 'Sin nombre'}</span>
            <span class="date">${formattedDate}</span>
        </div>
        `;
        // Navegar al modelo al hacer click
        card.addEventListener('click', () => {
        window.location.href = `../Editar/Editar.html?id=${model.id}`;
        })
        container.appendChild(card);
    }
  }
}

getModelCards();

const formElement = document.querySelector('.ProfileForm');
const formEditButtons = formElement.querySelectorAll('input');
const RestoreBut = document.querySelector('#Restore');

const avatarImg = document.querySelector('#avatar-img');
const avatarInput = document.querySelector('#avatar-input');
const usernameInput = document.querySelector('#username');
const bioInput = document.querySelector('#bio');
const locationInput = document.querySelector('#location');
const websiteInput = document.querySelector('#website');
const emailInput = document.querySelector('#email');
const saveBtn = document.querySelector('#save-btn');
const errorMsg = document.querySelector('#error');

async function loadProfile() {
  const profile = await getProfile(user.id)

  usernameInput.value = profile.username || '';
  bioInput.value = profile.bio || '';
  locationInput.value = profile.location || '';
  websiteInput.value = profile.website || '';
  emailInput.value = user.email;

  if (profile.avatar_url) {
    avatarImg.style.backgroundImage = `url('${profile.avatar_url}?t=${Date.now()}')`;
  }
  else{
    avatarImg.style.backgroundImage = "url('./Recursos/ProfileIcon.png')";
  }
}

await loadProfile();

// Cambiar avatar
avatarInput.addEventListener('change', async () => {
  const file = avatarInput.files[0];
  if (!file){
    return;
  }

  try {
    const newUrl = await updateAvatar(user.id, file);
    avatarImg.style.backgroundImage = `url('${newUrl}')`;
  } catch (err) {
    errorMsg.textContent = err.message;
  }
})

// Guardar cambios del perfil
saveBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    errorMsg.textContent   = ''

    try {
        // Actualizar datos
        await updateProfile(user.id, {
            username: usernameInput.value,
            bio: bioInput.value,
            location: locationInput.value,
            website: websiteInput.value,
        })

        // Actualizar email si cambió
        if (emailInput.value !== user.email) {
        const { error } = await supabase.auth.updateUser({ email: emailInput.value })
        if (error) throw new Error(error.message)
        }

        errorMsg.textContent = 'Perfil actualizado correctamente'
    } catch (err) {
        errorMsg.textContent = err.message
    }
})

function ButtonsPostUpdate(){
    let ButtonsForm = document.querySelector('.ButtonsForm');
    ButtonsForm.style.bottom = - (ButtonsForm.offsetHeight - 1) + "px";
}

ButtonsPostUpdate()

formEditButtons.forEach((e) => {

    if(e.type == "file"){
        return;
    }

    const Div = document.createElement('div');

    Div.style.position = "relative";
    Div.style.display = "inline-block";

    e.parentNode.insertBefore(Div, e);

    const EditButn = document.createElement('button');
    EditButn.classList.add('EditFormButton');
    EditButn.classList.add('EditDisable');

    EditButn.addEventListener('click', (ButEvent) => {
        ButEvent.preventDefault();
        e.readOnly = !e.readOnly;
        EditButn.classList.toggle('EditDisable');
        EditButn.classList.toggle('EditEnable');
        if(e.readOnly == false){
            document.querySelector('#Restore').disabled = false;
        }
    })

    Div.appendChild(e);
    Div.appendChild(EditButn);
});

const projectScrollHorz = document.querySelectorAll('.ProjectSlide');

projectScrollHorz.forEach((e) => {
    const TitleCont = document.createElement('div');
    TitleCont.innerHTML = e.innerText;
    e.innerHTML = '';
    TitleCont.classList.add('ProjectSlide_Tlt');

    const GetCont = document.createElement('div');
    GetCont.classList.add('ProjectSlide_Cnt');

    function CreateProj(amount){
        const ProjContainers = [];
        for(let i = 0; i < amount; i++){
            const SubCont = document.createElement('div');
            SubCont.classList.add('ProjectSlide_Cnt_');

            const ImgBack = document.createElement('div');
            ImgBack.classList.add('ProjectSlide_Cnt_ImgCont');

            const ImgMod = document.createElement('div');
            ImgMod.classList.add('ProjectSlide_Cnt_Img');

            ImgBack.appendChild(ImgMod);
            SubCont.appendChild(ImgBack);

            ProjContainers.push(SubCont);
            GetCont.appendChild(ProjContainers[i]);
        }
    }

    CreateProj(5);

    e.appendChild(TitleCont);
    e.appendChild(GetCont);
})

window.addEventListener('resize', () => {
    ButtonsPostUpdate()
});



