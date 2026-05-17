import { signIn } from '../lib/RegistroLogin.js';
import { requireGuest } from '../lib/RegistroLogin.js';

const passwordView = document.getElementById("Pswrd");
const form = document.querySelector('#LoginForm');
const error = document.querySelector('#error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  try {
    await signIn(data.get('email'), data.get('password'));
    window.location.href = '../Busqueda/Busqueda.html';
  } catch (err) {
    error.textContent = err.message; // muestra el error al usuario
  }
})

// MOSTRAR / OCULTAR CONTRASEÑA
document.getElementById('Toggle').addEventListener("click", function() {
    if (passwordView.type === "password") {
        passwordView.type = "text";
    } else {
        passwordView.type = "password";
    }
});
