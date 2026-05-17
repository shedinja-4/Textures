import supabase from './supabase.js'

const ALLOWED_MODEL_EXTS = ['.glb', '.gltf']

// Obtener bucket
function getPublicUrl(bucket, path) {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  return publicUrl
}

// Modelos
export async function uploadModel(file, userId) {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_MODEL_EXTS.includes(ext)) {
    throw new Error('Solo se permiten archivos .glb o .gltf')
  }

  const path = `${userId}/${Date.now()}-${file.name}`
  const { error } = await supabase.storage
    .from('models')
    .upload(path, file)

  if (error) throw new Error(error.message)
  return getPublicUrl('models', path)
}

// Previews
export async function uploadPreview(file, userId, modelId = Date.now()) {

  const ext = file.name.slice(file.name.lastIndexOf('.'))
  const path = `${userId}/${modelId}${ext}`

  const { error } = await supabase.storage
    .from('previews')
    .upload(path, file)

  if (error) throw new Error(error.message)
  return getPublicUrl('previews', path)
}

// Avatar de perfil
export async function uploadAvatar(file, userId) {
  const ext = file.name.slice(file.name.lastIndexOf('.'))

  const path = `${userId}/avatar`

  // upsert: true es que sobreescribe el avatar anterior
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw new Error(error.message)
  return getPublicUrl('avatars', path)
}

// Modelo .gltf + texturas
export async function uploadTextMod(gltfFile, textures, userId) {
  const modelId = Date.now().toString()
  const basePath = `${userId}/${modelId}`

  const { error: modelError } = await supabase.storage
    .from('models')
    .upload(`${basePath}/model.gltf`, gltfFile, { contentType: 'model/gltf+json' })

  if (modelError) throw new Error(modelError.message)

  const textureUrls = {}

  for (const [name, file] of Object.entries(textures)) {
    // name: 'color', 'metalness', 'roughness', 'normal'
    const { error } = await supabase.storage
      .from('models')
      .upload(`${basePath}/textures/${name}`, file, { contentType: file.type })

    if (error) throw new Error(error.message)

    textureUrls[name] = getPublicUrl('models', `${basePath}/textures/${name}`)
  }

  const modelUrl = getPublicUrl('models', `${basePath}/model.gltf`)

  return { modelId, modelUrl, textureUrls, basePath }
}

// Eliminar archivo
export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) throw new Error(error.message)
}