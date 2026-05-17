import supabase from './supabase.js'
import { uploadAvatar, deleteFile } from './upload.js'

// Obtener perfil
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('Profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Actualizar datos del perfil
export async function updateProfile(userId, fields) {
  // fields puede contener: bio, website, location, username
  const { data, error } = await supabase
    .from('Profiles')
    .update(fields)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return data
}

// Actualizar avatar
export async function updateAvatar(userId, file) {
  // Obtener avatar anterior para eliminarlo si existe
  const profile = await getProfile(userId)

  if (profile.avatar_url) {
    const path = profile.avatar_url.split('/avatars/')[1]
    await deleteFile('avatars', path)
  }

  // Subir nuevo avatar
  const avatarUrl = await uploadAvatar(file, userId)

  // Guardar URL en Profiles
  await updateProfile(userId, { avatar_url: avatarUrl })

  return avatarUrl
}

// Actualizar email
export async function updateEmail(newEmail) {
  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) throw new Error(error.message)
}

// Actualizar contraseña
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}