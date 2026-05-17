//Importar librerias
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
const fbxloader = new FBXLoader();
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
const objloader = new OBJLoader();
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const gltfLoader = new GLTFLoader();
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
const hdrLoader = new HDRLoader();
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import Konva from "konva";
import "reinvented-color-wheel/css/reinvented-color-wheel.min.css";
import ReinventedColorWheel from "reinvented-color-wheel";


import supabase from '../lib/supabase.js';
import { uploadTextMod, uploadPreview } from '../lib/upload.js';
import { requireAuth } from '../lib/RegistroLogin.js';
import { getProfile } from '../lib/profiles.js';
import { publishModel, getModelById } from '../lib/modelo.js';

const user = await requireAuth('/Inicio/Login.html');
const profile = await getProfile(user.id);

//Rueda de color para luz
const ColorValue = document.getElementById("ColorValue");
ColorValue.value = "#ffffff";

const ShowColor = document.getElementById("ShowC");
var colorWheel = new ReinventedColorWheel({
  appendTo: document.getElementById("ColorWheel"),
  hex: ColorValue.value,
  wheelDiameter: 170,
  wheelThickness: 15,
  handleDiameter: 16,
  wheelReflectsSaturation: false,
  onChange: function (color) {
    ColorValue.value = color.hex;
    ShowColor.style.backgroundColor = color.hex;
    ColorLightUpdate();
  },
});

//Crear escena, camara y render
var Visual = document.getElementById("Visualizador3D");

const escena = new THREE.Scene();
const camara = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camara.position.set(0,1,10);

const renderer = new THREE.WebGLRenderer({antialias: true, canvas: Visual, alpha: true});
renderer.setSize( window.innerWidth/1.2, window.innerHeight/1.2);

//Activar controles-
const ctrls = new OrbitControls(camara, renderer.domElement);
ctrls.enableDamping = true;
ctrls.update();

//Leer si viene de tarjeta
const params = new URLSearchParams(window.location.search)
const modelId = params.get('id')

const texLoader = new THREE.TextureLoader();
var modeloMain = null;
var material = null;

var map = null;
var metalnessMap = null;
var roughnessMap = null;
var normalMap = null;
var bumpMap = null;

const SrcText = [];

function ActualizarMaterial( Referencia, Direccion ){
  if(Direccion){
    let Img = document.getElementById(Referencia);
    Img.style.backgroundImage = `url(${Direccion})`;
  }
}

if (!modelId){
  //Texturas iniciales
  map = texLoader.load('Texturas/TextMainModel/Color.jpeg');
  metalnessMap = texLoader.load('Texturas/TextMainModel/Metalness.png');
  roughnessMap = texLoader.load('Texturas/TextMainModel/Roughness.jpeg');
  normalMap = texLoader.load('Texturas/TextMainModel/NormalBase.png');

  material = new THREE.MeshStandardMaterial( {
    map,
    metalnessMap,
    roughnessMap,
    normalMap,
    normalScale: new THREE.Vector2(1, 1),
  } );
  material.metalness = 1;
  //----------------------

  //Modelo inicial

  objloader.load( 'Modelos/MainModel/fox3.obj', function ( modelo ) {
    modelo.traverse((child) => {
      if (child.isMesh) {
        child.material = material;
        child.geometry.center();
        modeloMain = child;
      }
    });
    escena.add( modeloMain );
  })
  //----------------------
}
else {
  const modelo = await getModelById(modelId);

  // Se redirecciona el url de file_url para que quede en la carpeta base, donde estan las texturas
  const basePath = modelo.file_url.split('/models/')[1].replace('/model.gltf', '');

  // Listar texturas. Solo obtiene nombres
  const { data: texturas, error } = await supabase.storage
    .from('models')
    .list(`${basePath}/textures`)

  // Obtener URL pública de cada textura
  const textureUrls = texturas.map(t => {
    const { data: { publicUrl } } = supabase.storage
      .from('models')
      .getPublicUrl(`${basePath}/textures/${t.name}`)
    return { name: t.name, url: publicUrl }
  });

  ActualizarMaterial( "ImgC", textureUrls[0].url );
  ActualizarMaterial( "ImgM", textureUrls[1].url );
  ActualizarMaterial( "ImgR", textureUrls[3].url );
  ActualizarMaterial( "ImgN", textureUrls[2].url );

  SrcText[0] = textureUrls[0].url;
  SrcText[1] = textureUrls[1].url;
  SrcText[2] = textureUrls[3].url;
  SrcText[3] = textureUrls[2].url;


  map = texLoader.load(`${textureUrls[0].url}`);
  metalnessMap = texLoader.load(`${textureUrls[1].url}`);
  roughnessMap = texLoader.load(`${textureUrls[3].url}`);
  normalMap = texLoader.load(`${textureUrls[2].url}`);

  material = new THREE.MeshStandardMaterial( {
    map,
    metalnessMap,
    roughnessMap,
    normalMap,
    normalScale: new THREE.Vector2(1, 1),
  } );
  material.metalness = 1;

  gltfLoader.load( modelo.file_url, ( gltf ) => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = material;
        child.geometry.center();
        modeloMain = child;
      }
    });
    escena.add( modeloMain );
  });
}


//Enviroment
const envMap = await hdrLoader.loadAsync( 'Texturas/EnviroMap/FondoMetalness.hdr' );
envMap.mapping = THREE.EquirectangularReflectionMapping;
escena.environment = envMap;

escena.environmentIntensity = 0.3;

const EnviroBut = document.getElementById('EnvToggle');
EnviroBut.checked = true;

EnviroBut.addEventListener('change', (e) =>{
  if(EnviroBut.checked){
    escena.environment = envMap;
  }
  else{
    escena.environment = null;
  }
})
//----------------------

// Figuras en el espacio
function DisplayFig({ figures = 1000 } = {}) {
  const group = new THREE.Group();
  for (let i = 0; i < figures; i++) {
    // Generate random spherical coordinates
    const x = THREE.MathUtils.randFloatSpread(2000);
    const y = THREE.MathUtils.randFloatSpread(2000);
    const z = THREE.MathUtils.randFloatSpread(2000);

    const num = Math.floor(Math.random() * (4 - 1) + 1);
    const map = texLoader.load(`Texturas/Sprite${num}.png`);

    const material = new THREE.SpriteMaterial({ map: map });

    const sprite = new THREE.Sprite( material );
    sprite.position.set(x, y, z);
    sprite.scale.set(10, 10, 1);
    group.add(sprite);
  }
  return group;
}

const EstadoFig = document.getElementById("PartToggle");
EstadoFig.checked = true;
const Particulas = DisplayFig();
escena.add(Particulas);

EstadoFig.addEventListener('change', () =>{
  if(EstadoFig.checked){
    escena.add(Particulas);
  }
  else{
    escena.remove(Particulas);
  }
})
//----------------------

//Luces
const ambientLight = new THREE.AmbientLight( 0xffffff, 2 );
escena.add( ambientLight );

const spotLight = new THREE.SpotLight( 0xffffff , 5000, 0, Math.PI/3, 0.6);
spotLight.position.set( 0, 100, 0 );
escena.add( spotLight );

function ColorLightUpdate(){
  const SplitCode = ColorValue.value.trim().split("");

  if(SplitCode[0] != "#"){
    if(SplitCode.length == 7){
      SplitCode.forEach((i) => {
        SplitCode[i+1] = SplitCode[i];
      });
      SplitCode[SplitCode.length] = "";
      SplitCode[0] = "#"
    }
    else if(SplitCode.length < 7){
      SplitCode[0] = "#"
      while(SplitCode.length < 7){
        SplitCode.push('0');
      }
    }
  }

  ColorValue.value = SplitCode.join("");
  
  SplitCode[0] = "0x";
  spotLight.color.setHex(SplitCode.join(""));
  spotLight.needsUpdate = true;
}
const ColorForm = document.getElementById("CForm");
ColorForm.addEventListener('focusout', ColorLightUpdate(), false);

LightDir.addEventListener('change', (e) => {
  switch (e.target.value) {
    case "up":
      spotLight.position.set( 0, 100, 0 );
      break;
    case "down":
      spotLight.position.set( 0, -100, 0 );
      break;
    case "right":
      spotLight.position.set( 100, 0, 0 );
      break;
    case "left":
      spotLight.position.set( -100, 0, 0 );
      break;
  }
  spotLight.needsUpdate = true;
})

function ChangeText(event, MapType){
  if(event.target){
    let Textura = event.target.files[0];
    let UrlText = URL.createObjectURL(Textura);
    new THREE.TextureLoader().load(UrlText, (texture) => {
      material[MapType] = texture;
    })
    material.needsUpdate = true;
    return UrlText;
  }
}

function ReplaceEditImg(source, name) {
  if(source){
    CanvImg.src = source;
    ResetSliders();
    const TextType = document.getElementById('TextType');
    TextType.textContent = name;
    console.log('cambioTextura ' + name);
  }
}

MapC.addEventListener('change', (event) => {
  SrcText[0] = ChangeText(event, "map");
  ActualizarMaterial( "ImgC", SrcText[0] );
  ReplaceEditImg(SrcText[0], "Color");
});

MapM.addEventListener('change', (event) => {
  SrcText[1] = ChangeText(event, "metalnessMap");
  ActualizarMaterial( "ImgM", SrcText[1] );
  ReplaceEditImg(SrcText[1], "Metalness");
});

MapR.addEventListener('change', (event) => {
  SrcText[2] = ChangeText(event, "roughnessMap");
  ActualizarMaterial( "ImgR", SrcText[2] );
  ReplaceEditImg(SrcText[2], "Roughness");
});

MapN.addEventListener('change', (event) => {
  SrcText[3] = ChangeText(event, "normalMap");
  ActualizarMaterial( "ImgN", SrcText[3] );
  ReplaceEditImg(SrcText[3], "Normal");
});

MetalForce.addEventListener('input', (event) => {
  const FuerzaF = document.getElementById('MetalForce').value;
  material.metalness = FuerzaF;
  material.needsUpdate = true;
});

Force.addEventListener('input', (event) => {
  const Fuerza = document.getElementById('Force').value;
  material.normalScale.set(Fuerza, Fuerza);
  material.normalScale.needsUpdate = true;
});

var Seen = false;
const TamGrl = document.getElementById('TamGrl');
const DivGrl = document.getElementById('DivGrl');

var grilla = new THREE.GridHelper( TamGrl.value, DivGrl.value );
grilla.visible = false;
escena.add(grilla);

function RefreshGrid(){
  escena.remove(grilla);
  grilla.dispose();
  grilla = new THREE.GridHelper( TamGrl.value, DivGrl.value );
  escena.add(grilla);
}

//Cambio de tamaño (input tipo "number")
TamGrl.addEventListener('change', function(){
  if(Seen){
    RefreshGrid()
  }
})

//Cambio de divisiones (input tipo "number")
DivGrl.addEventListener('change', function(){
  if(Seen){
    RefreshGrid()
  }
})

//Cambio de visibilidad
GrlVis.addEventListener('click', function(){
  const GrlVis = document.getElementById('GrlVis');
  if (GrlVis.checked) {
    Seen = true;
    grilla.visible = true;
  }
  else
  {
    Seen = false;
    grilla.visible = false;
  }
  grilla.needsUpdate = true;
})

const delay = ms => new Promise(res => setTimeout(res, ms));

async function RecolocarCamara(){
    modeloMain.geometry.boundingSphere = null;
    modeloMain.geometry.computeBoundingSphere();
    await delay(500);
    const fov = camara.fov;
    const radius = modeloMain.geometry.boundingSphere.radius;
    const cog = modeloMain.localToWorld(
        modeloMain.geometry.boundingSphere.center.clone()
    );
    camara.position.set(cog.x, cog.y, cog.z + 1.5 * radius / Math.tan(fov * Math.PI / 360));
    camara.lookAt(cog);
    camara.updateProjectionMatrix();
    ctrls.update();
}

ArchivoOBJ.addEventListener('change', (event) => {
    let Modobj = event.target.files[0];
    let ModeloOBJ = URL.createObjectURL(Modobj)
    escena.remove(modeloMain);
    objloader.load( ModeloOBJ, function ( obj ) {
      obj.traverse((child) => {
        if (child.isMesh) {
          child.material = material;
          child.geometry.center();
          modeloMain = child;
        }
      });
      escena.add( modeloMain );

    }, undefined, function ( error ) {

      console.error( error );
    
    } );
    RecolocarCamara();
});

ArchivoFBX.addEventListener('change', (event) => {
    let Modfbx = event.target.files[0];
    console.log(Modfbx);
    let ModeloFBX = URL.createObjectURL(Modfbx);
    escena.remove(modeloMain);
    fbxloader.load( ModeloFBX, function ( fbx ) {
      
      fbx.traverse((child) => {
        if (child.isMesh) {
          child.geometry.center();
          modeloMain = new THREE.Mesh( child.geometry, material );
        }
      });
      escena.add( modeloMain );

    }, undefined, function ( error ) {

      console.error( error );
    
    } );
    RecolocarCamara();
});

ArchivoGLTF.addEventListener('change', (event) => {
    let Modgltf = event.target.files[0];
    let ModeloGLTF = URL.createObjectURL(Modgltf)
    escena.remove(modeloMain);
    gltfLoader.load( ModeloGLTF, function ( gltf ) {

      gltf.traverse((child) => {
        if (child.isMesh) {
          child.material = material;
          child.geometry.center();
          modeloMain = child;
        }
      });
      
      escena.add( modeloMain );

    }, undefined, function ( error ) {

      console.error( error );
    
    } );
    RecolocarCamara();
});

// Filtros a texturas
////////////////////////////////////////////////////////////////////////

const canvas = document.getElementById("ImagenID");

const stage = new Konva.Stage({
  container: 'ImagenID',
  width: canvas.clientWidth,
  height: canvas.clientHeight,
});

const layer = new Konva.Layer();
stage.add(layer);

const CanvImg = new Image();
CanvImg.crossOrigin = 'anonymous';
var image; // Imagen para Stage

var filterStates = {
  brightness: false,
  contrast: false,
  hue: false,
  saturation: false,
  threshold: false,
};

var filterValues = {
  brightness: 1,
  contrast: 0,
  hue: 0,
  saturation: 0,
  threshold: 0.5,
};

function updateFilters() {
  if (!image) return;

  const activeFilters = [];

  if (filterStates.brightness) {
    activeFilters.push(Konva.Filters.Brightness);
    image.brightness(filterValues.brightness);
  }

  if (filterStates.contrast) {
    activeFilters.push(Konva.Filters.Contrast);
    image.contrast(filterValues.contrast);
  }

  if (filterStates.hue || filterStates.saturation) {
    activeFilters.push(Konva.Filters.HSL);
    image.hue(filterValues.hue);
    image.saturation(filterValues.saturation);
  }

  if (filterStates.threshold) {
    activeFilters.push(Konva.Filters.Threshold);
    image.threshold(filterValues.threshold);
  }

  image.filters(activeFilters);
  image.cache();
  layer.batchDraw();
}

const createFilterControl = (name, min, max, step, defaultValue) => {
  const div = document.createElement('div');
  div.style.marginBottom = '1vh';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = name;
  checkbox.checked = filterStates[name];
  
  const label = document.createElement('label');
  label.htmlFor = name;
  label.textContent = ` ${name}: `;
  
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.value = defaultValue;
  slider.style.minWidth = '20vw';
  slider.disabled = !filterStates[name];
  
  div.appendChild(checkbox);
  div.appendChild(label);
  div.appendChild(slider);
  
  checkbox.addEventListener('change', (e) => {
    filterStates[name] = e.target.checked;
    slider.disabled = !e.target.checked;
    updateFilters();
  });
  
  slider.addEventListener('input', (e) => {
    filterValues[name] = parseFloat(e.target.value);
    updateFilters();
  });
  
  return div;
};

const FiltCont = document.getElementById("SliderCont");

FiltCont.appendChild(createFilterControl('brightness', 0, 2, 0.05, filterValues.brightness));
FiltCont.appendChild(createFilterControl('contrast', -100, 100, 0.2, filterValues.contrast));
FiltCont.appendChild(createFilterControl('hue', -180, 180, 1, filterValues.hue));
FiltCont.appendChild(createFilterControl('saturation', -2, 8, 0.1, filterValues.saturation));
FiltCont.appendChild(createFilterControl('threshold', 0, 1, 0.05, filterValues.threshold));

CanvImg.onload = function () {
  if (!image) {
    image = new Konva.Image({
      image: CanvImg,
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });

    layer.add(image);
  } else {
    image.image(CanvImg);
  }
  image.crossOrigin = 'Anonymous';
  image.cache();
  updateFilters();
  layer.batchDraw();
};

CanvImg.src = "Texturas/PlaceHolderStage.png"

EditC.addEventListener('click', () => ReplaceEditImg(SrcText[0], "Color"));
EditM.addEventListener('click', () =>  ReplaceEditImg(SrcText[1], "Metalness"));
EditR.addEventListener('click', () => ReplaceEditImg(SrcText[2], "Roughness"));
EditN.addEventListener('click', () => ReplaceEditImg(SrcText[3], "Normal"));

function ResetSliders(){
  filterValues.brightness = 1;
  filterValues.contrast = 0;
  filterValues.hue = 0;
  filterValues.saturation = 0;
  filterValues.threshold = 0.5;

  const sliders = FiltCont.querySelectorAll('input[type="range"]');

  sliders.forEach((i) => {
    i.disabled = true;
  })

  FiltCont.querySelectorAll('input[type="checkbox"]').forEach((i) => {
    i.checked = false;
  })

  filterStates = {
  brightness: false,
  contrast: false,
  hue: false,
  saturation: false,
  threshold: false,
  };

  let i = 0;
  Object.keys(filterValues).forEach(name => {
    sliders[i].value = filterValues[name];
    i++;
  });

  updateFilters();
  layer.batchDraw();
}

const BotonKonv = document.getElementById("BotonKonv");

BotonKonv.addEventListener('click', (e) => {
  if(e.target.id === "KonvReset"){
    ResetSliders();
  }
  else if(e.target.id === "KonvSubir"){
    const dataURL = layer.toDataURL({
      pixelRatio: 2,
      mimeType: 'image/png'
    });
    const Type = document.getElementById('TextType');
    new THREE.TextureLoader().load(dataURL, (texture) => {
      if(Type.textContent == "Color"){
        material.map = texture;
        ActualizarMaterial( "ImgC", dataURL );
      }
      else if(Type.textContent == "Metalness"){
        material.metalnessMap = texture;
        ActualizarMaterial( "ImgM", dataURL );
      }
      else if(Type.textContent == "Roughness"){
        material.roughnessMap = texture;
        ActualizarMaterial( "ImgR", dataURL );
      }
      else if(Type.textContent == "Normal"){
        material.normalMap = texture;
        ActualizarMaterial( "ImgN", dataURL );
      }
    })
  }
})

// Exportar y guardar

function exportToGLTF(model){
  const exportergtlf = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exportergtlf.parse(
      model,
      (gltf) => {
          const json = JSON.stringify(gltf);
          const blob = new Blob([json], { type: 'model/gltf+json' });
          const file = new File([blob], 'model.gltf', { type: 'model/gltf+json' });
          resolve(file)
      },
      (error) => reject(error)
    )
  });
}

document.getElementById('ExportButton').addEventListener('click', async (e) =>{
  const gltfFile = await exportToGLTF(modeloMain);
  const url = URL.createObjectURL(gltfFile);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'model.gltf';
  a.click();
  URL.revokeObjectURL(url);
})

const SendPrev = document.getElementById('PreviewSend');
const SendForm = document.querySelector('.FormularioSave');
var previewFile = null;

SaveButton.addEventListener('click', async () =>{
  // Para asegurarse que esta actualizado el renderer
  await RecolocarCamara();
  renderer.render(escena, camara);

  // Tomar render y hacerlo blob
  renderer.domElement.toBlob((blob) => {
    const blobUrlPrev = URL.createObjectURL(blob);
    SendPrev.src = blobUrlPrev;

    previewFile = new File([blob], 'preview.png', { type: 'image/png' });
  }, 'image/png');

  SendForm.classList.toggle('hidden');
});

saveAs.addEventListener('click', async () =>{
  try {
    const gltfFile = await exportToGLTF(modeloMain);

    const colorBlob = await fetch(material.map.image.src);
    const blobC = await colorBlob.blob();
    const metalBlob = await fetch(material.metalnessMap.image.src);
    const blobM = await metalBlob.blob();
    const roughBlob = await fetch(material.roughnessMap.image.src);
    const blobR = await roughBlob.blob();
    const normalBlob = await fetch(material.normalMap.image.src);
    const blobN = await normalBlob.blob();

    await publishModel(user.id, {
      title: document.querySelector('#title').value,
      description: document.querySelector('#description').value,
      gltfFile,
      previewFile,
      textures: {
        color: new File([blobC], 'color.png', { type: 'image/png' }),
        metalness: new File([blobM], 'metalness.png', { type: 'image/png' }),
        roughness: new File([blobR], 'roguhness.png', { type: 'image/png' }),
        normal: new File([blobN], 'normal.png', { type: 'image/png' }),
      }
    });

    alert('Modelo guardado correctamente');
  } catch (err) {
    console.error(err.message);
  }

  SendForm.classList.toggle('hidden');
});

///////////////////////////////////////////////////////////////////////

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camara.aspect = w / h;
  camara.updateProjectionMatrix();
  console.log(camara.position);
  renderer.setSize(w/1.2, h/1.2);
  renderer.setPixelRatio(window.devicePixelRatio);
});

const EstadoAnim = document.getElementById("AnimToggle");
var AnimTime = 0;

function animate( time ) {
    if(EstadoAnim.checked){
      modeloMain.rotation.y = AnimTime;
      AnimTime = AnimTime + 0.01;
      if(AnimTime >= 360){ AnimTime = 0; }
    }
    else
    {
      document.addEventListener('DOMContentLoaded', () => {
        modeloMain.rotation.set(0,0,0);
      })
    }
  renderer.render( escena, camara );
}
renderer.setAnimationLoop( animate );