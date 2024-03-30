import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


let container, camera, scene, renderer, cube, controls, axesHelper;

init();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x3f7b9d, 3, 12);

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.z = 1
   // directionalLight.target = cube; 
    scene.add(directionalLight);
   // scene.add(directionalLight.target); 
const ambientLight = new THREE.AmbientLight( 0xffffff, 1.0); 
    scene.add(ambientLight);

    const geometry = new THREE.BoxGeometry(1, 2, 3 );
    const material = new THREE.MeshPhongMaterial( { color: 0xdf1ada, emissive:0x07050c, shininess: 100, specular: 0xffffff, reflectivity: 1.0  } );
    material.fog = true; 
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    cube.scale.set(1,1,1)
    cube.rotation.y = Math.PI / 4

    

    camera.lookAt(0,0,0);
    camera.position.z = 5;
    camera.position.set(2,2,5);

    controls = new OrbitControls( camera, renderer.domElement );
    controls.update();
}

window.addEventListener( 'resize', resize, false);


function resize(){
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize( window.innerWidth, window.innerHeight );
}


function animate() {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.008;
    cube.rotation.y += 0.008;

    controls.update();
    renderer.render( scene, camera );

    
}

animate();

