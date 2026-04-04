//Importar librerias
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

//Crear escena, camara y render
var Visual = document.getElementById("Visualizador3D");

const escena = new THREE.Scene();
const camara = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camara.position.set(10,0,0);

const renderer = new THREE.WebGLRenderer({antialias: true, canvas: Visual, alpha: true});
renderer.setSize( window.innerWidth/1.2, window.innerHeight/1.2);

//Luces
const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
escena.add( ambientLight );

const keyLight = new THREE.DirectionalLight(0xffffff, 1);
escena.add( keyLight );

//Activar controles
const ctrls = new OrbitControls(camara, renderer.domElement);
ctrls.enableDamping = true;
ctrls.target.set(0,0,0);
ctrls.update();

//Crear cubo
const geometry = new THREE.BoxGeometry( 1, 1, 1 );

//Texturas Iniciales +  loader
const texLoader = new THREE.TextureLoader();

var map = texLoader.load('Texturas/ColorBase.png');
var metalnessMap = texLoader.load('Texturas/AlphaBase.png');
var roughnessMap = texLoader.load('Texturas/AlphaBase.png');
var normalMap = texLoader.load('Texturas/NormalBase.png');
var bumpMap = texLoader.load('Texturas/AlphaBase.png');
var bumpForce = 1;
var normalForce = new THREE.Vector2(1, 1);


var material = new THREE.MeshStandardMaterial( {
  map,
  metalnessMap,
  roughnessMap,
  normalMap,
  bumpMap,
  normalScale: normalForce,
  bumpScale: bumpForce
  } );
//----------------------

function ActualizarMaterial( Referencia, Direccion ){
  const Img = document.getElementById(Referencia);
  Img.style.backgroundImage = `url(${Direccion})`;
  console.log(Referencia, Direccion)
}

var Textura;
var UrlText;

MapC.addEventListener('change', (event) => {
    Textura = event.target.files[0];
    UrlText = URL.createObjectURL(Textura);
    modeloMain.material.map = texLoader.load(UrlText);
    modeloMain.material.map.needsUpdate = true; 
    ActualizarMaterial( "ImgC", UrlText );
});

MapM.addEventListener('change', (event) => {
    Textura = event.target.files[0];
    UrlText = URL.createObjectURL(Textura);
    modeloMain.material.metalnessMap = texLoader.load(UrlText);
    modeloMain.material.metalnessMap.needsUpdate = true; 
    ActualizarMaterial( "ImgM", UrlText );
});

MapR.addEventListener('change', (event) => {
    Textura = event.target.files[0];
    UrlText = URL.createObjectURL(Textura);
    modeloMain.material.roughnessMap = texLoader.load(UrlText);
    modeloMain.material.roughnessMap.needsUpdate = true; 
    ActualizarMaterial( "ImgR", UrlText );
});

MapB.addEventListener('change', (event) => {
    Textura = event.target.files[0];
    UrlText = URL.createObjectURL(Textura);
    modeloMain.material.bumpMap = texLoader.load(UrlText);
    modeloMain.material.bumpMap.needsUpdate = true;
    ActualizarMaterial( "ImgB", UrlText );
});

MapN.addEventListener('change', (event) => {
    Textura = event.target.files[0];
    UrlText = URL.createObjectURL(Textura);
    modeloMain.material.normalMap = texLoader.load(UrlText);
    modeloMain.material.normalMap.needsUpdate = true; 
    ActualizarMaterial( "ImgN", UrlText );
});

BumpForce.addEventListener('input', (event) => {
    const FuerzaB = document.getElementById('BumpForce').value;
    bumpForce = FuerzaB;
    modeloMain.material.bumpScale = bumpForce;
    modeloMain.material.needsUpdate = true;
    console.log(modeloMain.material.bumpScale)
});

NormalForce.addEventListener('input', (event) => {
    const FuerzaN = document.getElementById('NormalForce').value;
    normalForce.x = FuerzaN;
    normalForce.y = FuerzaN;
    modeloMain.material.normalScale = normalForce;
    modeloMain.material.normalScale.needsUpdate = true;
});

var modeloMain = new THREE.Mesh( geometry, material );
escena.add( modeloMain );

var TamGrl = document.getElementById('TamGrl');
var DivGrl = document.getElementById('DivGrl');
var GrlVis = document.getElementById('GrlVis');
var Seen = true;

var grilla = new THREE.GridHelper( TamGrl.value, DivGrl.value );
escena.add( grilla );

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

GrlVis.addEventListener('click', function(){
  GrlVis = document.getElementById('GrlVis')
  if (GrlVis.checked) {
    Seen = false;
    escena.remove(grilla);
    grilla.dispose();
  }
  else
  {
    Seen = true;
    grilla = new THREE.GridHelper( TamGrl.value, DivGrl.value );
    escena.add(grilla);
  }
})

const objloader = new OBJLoader();
ArchivoOBJ.addEventListener('change', (event) => {
    const Modobj = event.target.files[0];
    console.log(Modobj);
    const ModeloOBJ = URL.createObjectURL(Modobj)
    objloader.load( ModeloOBJ, function ( obj ) {

      escena.remove(modeloMain);
      obj.traverse((child) => {
        if (child.isMesh) {
            child.material = material;
        }
      });
      modeloMain = obj;
      escena.add( modeloMain );

    }, undefined, function ( error ) {

      console.error( error );
    
    } );
});

const fbxloader = new FBXLoader();
ArchivoFBX.addEventListener('change', (event) => {
    const Modfbx = event.target.files[0];
    console.log(Modfbx);
    const ModeloFBX = URL.createObjectURL(Modfbx)
    fbxloader.load( ModeloFBX, function ( fbx ) {

      escena.remove(modeloMain);
      fbx.traverse((child) => {
        if (child.isMesh) {
            child.material = material;
        }
      });
      modeloMain = fbx;
      escena.add( modeloMain );

    }, undefined, function ( error ) {

      console.error( error );
    
    } );
});

function animate( time ) {
  modeloMain.rotation.x = time / 2000;
  modeloMain.rotation.y = time / 1000;  
  renderer.render( escena, camara );
}
renderer.setAnimationLoop( animate );