import { signIn, signUp, requireGuest } from './src/lib/RegistroLogin'

await requireGuest('./src/Busqueda/Busqueda.html')

const form = document.getElementById("registroForm");
const error = document.getElementById("error");
const toggle = document.getElementById("togglePassword");
const passwordView = document.getElementById("Pswrd");

// VALIDAR CONTRASEÑAS
form.addEventListener("submit", function(e) {
    e.preventDefault();
    Register()
});

async function Register(){

    const data = new FormData(form);
    const name = data.get('User');
    const email = data.get('Email');
    const password = data.get('Password');
    const confirm = data.get('PasswordReq');

    if (password.value !== confirm.value) {
        error.textContent = "Las contraseñas no coinciden";
        return;
    }

    const count = password.length;

    if (count < 6) {
        error.textContent = "La contraseña debe contener al menos 6 digitos";
        return;
    }

    await signUp(email, password, name)
    window.location.href = './src/Inicio/Login.html'
}

// MOSTRAR / OCULTAR CONTRASEÑA
toggle.addEventListener("click", function() {
    if (passwordView.type === "password") {
        passwordView.type = "text";
    } else {
        passwordView.type = "password";
    }
});
