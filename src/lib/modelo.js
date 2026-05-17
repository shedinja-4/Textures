import supabase from './supabase.js'
import { uploadTextMod, uploadPreview } from './upload.js'

// Subir modelo completo y guardar en Supa
export async function publishModel(userId, { title, description, gltfFile, textures, previewFile }) {

  const { modelId, modelUrl, textureUrls, basePath } = await uploadTextMod(gltfFile, textures, userId);
  const previewUrl = await uploadPreview(previewFile, userId, modelId);

  // Guardar datos en Model-Inf
  const { data, error } = await supabase
    .from('Model-Inf')
    .insert({
      user_id: userId,
      title,
      description,
      file_url: modelUrl,
      preview_img: previewUrl,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Obtener todos los modelos
export async function getModels() {
  const { data, error } = await supabase
    .from('Model-Inf')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// Obtener modelos de un usuario
export async function getModelsByUser(userId) {
  const { data, error } = await supabase
    .from('Model-Inf')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// Obtener modelo que traigan desde busqueda
export async function getModelById(id) {
  const { data, error } = await supabase
    .from('Model-Inf')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}