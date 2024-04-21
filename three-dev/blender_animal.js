import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

let camera, scene, renderer;
let planet_model, pivot;

init();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
    camera.position.set(0, 1, 4);
    scene = new THREE.Scene();

    ///////////////////////BACKGROUND////////////////////////
    new RGBELoader()
        .load('sunset_bckgr.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            scene.environment = texture;
            render();
        // });
        ////////////////////////BARREL///////////////////////////
        const loader = new GLTFLoader();
        loader.load('hYena.gltf', async function (gltf) {
            const hyena = gltf.scene;
            hyena.scale.set(1.5,1.5,1.5);
            hyena.position.set(0, -2, -4);
            await renderer.compileAsync(hyena, camera, scene);
            scene.add(hyena);
            render();
        });

    });
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild( renderer.domElement );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render ); 
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set(0, -2, -4);
    controls.update();

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}


function animate() {
    requestAnimationFrame(animate);
    pivot.rotateY(0.005);
    render();
}

function render() {
    renderer.render(scene, camera);
}


