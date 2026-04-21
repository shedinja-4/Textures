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
import Konva from "konva";
import "reinvented-color-wheel/css/reinvented-color-wheel.min.css";
import ReinventedColorWheel from "reinvented-color-wheel";

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

//Activar controles
const ctrls = new OrbitControls(camara, renderer.domElement);
ctrls.enableDamping = true;
ctrls.update();

//Texturas Iniciales +  loader
const texLoader = new THREE.TextureLoader();

escena.environment = new HDRLoader().load('Texturas/EnviroMap/FondoMetalness.hdr');

var map = texLoader.load('Texturas/TextMainModel/Color.jpeg');
var metalnessMap = texLoader.load('Texturas/TextMainModel/Metalness.png');
var roughnessMap = texLoader.load('Texturas/TextMainModel/Roughness.jpeg');
var normalMap = texLoader.load('Texturas/TextMainModel/NormalBase.png');
var bumpMap = texLoader.load('Texturas/AlphaBase.png');

var material = new THREE.MeshStandardMaterial( {
  map,
  metalnessMap,
  roughnessMap,
  normalMap,
  normalScale: new THREE.Vector2(1, 1),
} );
material.metalness = 1;
//----------------------

//Figuras en el espacio
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
//----------------------

escena.add(DisplayFig());

var modeloMain;

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

//Luces
const ambientLight = new THREE.AmbientLight( 0x404040, 2 );
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



function ActualizarMaterial( Referencia, Direccion ){
  if(Direccion){
    let Img = document.getElementById(Referencia);
    Img.style.backgroundImage = `url(${Direccion})`;
    console.log(Referencia, Direccion);
  }
}

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

const SrcText = [];

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

var TamGrl = document.getElementById('TamGrl');
var DivGrl = document.getElementById('DivGrl');
var GrlVis = document.getElementById('GrlVis');
var Seen = true;

TamGrl.addEventListener('change',function(){
  if(Seen){
    escena.remove(grilla);
    grilla.dispose();
    TamGrl = document.getElementById('TamGrl');
    grilla = new THREE.GridHelper( TamGrl.value, DivGrl.value );
    escena.add(grilla);
  }
})

DivGrl.addEventListener('change',function(){
  if(Seen){
    escena.remove(grilla);
    grilla.dispose();
    DivGrl = document.getElementById('DivGrl');
    grilla = new THREE.GridHelper( TamGrl.value, DivGrl.value );
    escena.add(grilla);
  }
})

var grilla;

GrlVis.addEventListener('click', function(){
  GrlVis = document.getElementById('GrlVis')
  if (GrlVis.checked) {
    Seen = true;
    grilla = new THREE.GridHelper( TamGrl.value, DivGrl.value );
    escena.add(grilla);
  }
  else
  {
    Seen = false;
    escena.remove(grilla);
    grilla.dispose();
  }
})

var radius;
var cog;
const fov = camara.fov;

const delay = ms => new Promise(res => setTimeout(res, ms));

async function RecolocarCamara(){
    modeloMain.geometry.boundingSphere = null;
    modeloMain.geometry.computeBoundingSphere();
    await delay(500);
    console.log("ya")
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
let image; // Imagen para Stage

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

  image.cache();
  updateFilters();
  layer.batchDraw();
};

function ReplaceEditImg(source, name) {
  if(source){
    CanvImg.src = source;
    ResetSliders();
    const TextType = document.getElementById('TextType');
    TextType.textContent = name;
  }
}

CanvImg.src = "Texturas/PlaceHolderStage.png"

EditC.addEventListener('click', (event) => {
  ReplaceEditImg(SrcText[0], "Color");
});

EditM.addEventListener('click', (event) => {
  ReplaceEditImg(SrcText[1], "Metalness");
});

EditR.addEventListener('click', (event) => {
  ReplaceEditImg(SrcText[2], "Roughness");
});

EditN.addEventListener('click', (event) => {
  ReplaceEditImg(SrcText[3], "Normal");
});

const BotonKonv = document.getElementById("BotonKonv");

function ResetSliders(){
  filterValues.brightness = 1;
  filterValues.contrast = 0;
  filterValues.hue = 0;
  filterValues.saturation = 0;
  filterValues.threshold = 0.5;

  const SliderCont = document.getElementById("SliderCont");
  const sliders = SliderCont.querySelectorAll('input[type="range"]');

  let i = 0;
  Object.keys(filterValues).forEach(name => {
    sliders[i].value = filterValues[name];
    i++;
  });

  updateFilters();
  layer.batchDraw();
}

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
///////////////////////////////////////////////////////////////////////

const EstadoAnim = document.getElementById("AnimToggle");
var AnimTime = 0;

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camara.aspect = w / h;
  camara.updateProjectionMatrix();
  console.log(camara.position);
  renderer.setSize(w/1.2, h/1.2);
  renderer.setPixelRatio(window.devicePixelRatio);
});

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