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
        .setPath('../')
        .load('sunset_bckgr.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            scene.environment = texture;
            render();
        // });
        ////////////////////////BARREL///////////////////////////
        const loader = new GLTFLoader().setPath('../');
        loader.load('untitledddd.glb', async function (gltf) {
            const barrel_model = gltf.scene;
            barrel_model.scale.set(0.6, 0.6, 0.6);
            barrel_model.position.set(0, -2, -4);
            await renderer.compileAsync(barrel_model, camera, scene);
            scene.add(barrel_model);
            render();
        });

        // loader.load('planet.gltf', async function (gltf) {
        //     pivot = new THREE.Object3D(); 
        //     pivot.position.set(0, -2, -4);
        //     planet_model = gltf.scene;
        //     planet_model.scale.set(0.5, 0.5, 0.5);
        //     pivot.add(planet_model); 
        //     planet_model.position.set(0, 0, 3);
        //     scene.add(pivot); 
        //     await renderer.compileAsync(planet_model, camera, scene);
        //     render();
        // });

        //////////PLANET///////////////////////////
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const textureLoader = new THREE.TextureLoader().setPath('../');
        const aoMap = textureLoader.load('AO.bmp');
        const roughnessMap = textureLoader.load('smoothness.bmp');
        const normalMap = textureLoader.load('normal_new.jpg');
        const diffuseMap = textureLoader.load('diffuse.jpg');

        const material = new THREE.MeshStandardMaterial({
            map: diffuseMap, 
            aoMap: aoMap, 
            normalMap: normalMap, 
           // roughnessMap: roughnessMap,
            roughness: 1 
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        pivot = new THREE.Object3D();
        pivot.position.set(0, -2, -4);
        sphere.position.set(0, 0, 3);
        pivot.add(sphere);
        scene.add(pivot);

        animate();
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


