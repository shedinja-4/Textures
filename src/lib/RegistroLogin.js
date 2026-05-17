import supabase from './supabase.js'

// Registro
export async function signUp(email, password, username) {
  // Crear usuario en auth
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);

  // Guardar username en Profiles
  const { error: profileError } = await supabase
    .from('Profiles')
    .upsert({ user_id: data.user.id, username })

  if (profileError) throw new Error(profileError.message);

  return data;
}

// Login
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

// Logout
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

// Usuario activo
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user; // null si no hay sesión
}

// Redireccion si login no activo
export async function requireAuth(redirectTo = '../Inicio/login.html') {
  const user = await getUser()
  if (!user) window.location.href = redirectTo
  return user
}

// Llama esto en login/registro para redirigir si ya está logueado
export async function requireGuest(redirectTo = './src/Busqueda/Busqueda.html') {
  const user = await getUser()
  if (user) window.location.href = redirectTo
}