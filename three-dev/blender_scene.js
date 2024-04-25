import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { add } from 'three/examples/jsm/libs/tween.module.js';


let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let raycaster;
const intersected = [];
const tempMatrix = new THREE.Matrix4();
let originalColor = new THREE.Color();

let group = new THREE.Group();
group.name = 'Interaction-Group';

let marker, baseReferenceSpace;
let INTERSECTION;
let teleportgroup = new THREE.Group();
teleportgroup.name = 'Teleport-Group';

let mixer;

init();
//animate();
initVR();

////////////////////////////////////////////////////////////////////////////////////////
function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 10 );
	camera.position.set( 0, 1.6, 2 );
    
    scene = new THREE.Scene();

    ///////////////////////BACKGROUND////////////////////////
    new RGBELoader()
        .load('kloppenheim_05_puresky_4k.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            scene.environment = texture;
            render();
        });

    ////////////////////////scene///////////////////////////
    const loader = new GLTFLoader();
    loader.load('scenee.gltf', async function (gltf) {
        const polyworld = gltf.scene;
        polyworld.scale.set(0.1, 0.1, 0.1);
        polyworld.position.set(-1, 0.5, -4);
        await renderer.compileAsync(polyworld, camera, scene);
        scene.add(polyworld);
        teleportgroup.add(polyworld);
        render();
    });

    loader.load('cute_cat.gltf', async function (gltf) {
        const cat = gltf.scene;
        cat.scale.set(0.2, 0.2, 0.2);
        cat.position.set(-2, 0.7, -3);
        await renderer.compileAsync(cat, camera, scene);
        
        group.add(cat);
        render();
    });
    loader.load('flowers.gltf', async function (gltf) {
        const flower = gltf.scene;
        flower.scale.set(0.01, 0.01, 0.01);
        flower.position.set(-1.3, 0.7, -1.7);
        await renderer.compileAsync(flower, camera, scene);
        
        group.add(flower);
        render();
    });

    loader.load('hienaanim.gltf', async function (gltf) {
        const hyena = gltf.scene;
        hyena.scale.set(0.8,0.8,0.8);
        //hyena.position.set(-1, 0.9, -1.7);
        hyena.position.set(0, -0.1, 0);
        await renderer.compileAsync(hyena, camera, scene);
        
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1); 
        const invisibleMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            opacity: 0,
            transparent: true
        });
        const hitBOx = new THREE.Mesh(boxGeometry, invisibleMaterial); //invisible box so i can pick up the hyena coz its not wokring otherwise
       hitBOx.position.set(-1, 1, -1.7);
       hitBOx.scale.set(0.3, 0.3, 0.3);
        
        hitBOx.add(hyena);
        group.add(hitBOx);

        const animations = gltf.animations;
        const mixer = new THREE.AnimationMixer(hyena);
        
        mixer.clipAction(animations[0]).play();

        const clock = new THREE.Clock();

        renderer.setAnimationLoop(() => {
            const deltaSeconds = clock.getDelta(); 
            update(deltaSeconds);
            moveMarker();
            render();
        });

        function update(deltaSeconds) {   
            mixer.update(deltaSeconds); 
        }

    });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.target.set( 0, 1.6, 0 );
    controls.update();

    window.addEventListener('resize', onWindowResize);

    marker = new THREE.Mesh(
    new THREE.CircleGeometry(0.25, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x808080 })
    );
    
    scene.add(marker);
    scene.add(group);
    scene.add(teleportgroup);

}
////////////////////////////////////////////////////////////////////////////VR///////////////////////////////////////
function initVR() {

    document.body.appendChild(VRButton.createButton(renderer));
    renderer.xr.enabled = true;

    renderer.xr.addEventListener(
        'sessionstart',
        () => (baseReferenceSpace = renderer.xr.getReferenceSpace())
        );

///////////////cintrollers//////////////////////
    controller1 = renderer.xr.getController( 0 );
    controller1.addEventListener( 'selectstart', onSelectStart );
    controller1.addEventListener( 'selectend', onSelectEnd );

    controller1.addEventListener('squeezestart', onSqueezeStart);
    controller1.addEventListener('squeezeend', onSqueezeEnd);
    scene.add( controller1 );

    controller2 = renderer.xr.getController( 1 );
    controller2.addEventListener( 'selectstart', onSelectStart );
    controller2.addEventListener( 'selectend', onSelectEnd );

    controller2.addEventListener('squeezestart', onSqueezeStart);
    controller2.addEventListener('squeezeend', onSqueezeEnd);
    scene.add( controller2 );

    controllerGrip1 = renderer.xr.getControllerGrip( 0 );
    scene.add( controllerGrip1 );

    controllerGrip2 = renderer.xr.getControllerGrip( 1 );
    scene.add( controllerGrip2 );

    //own model 1//
    const loader = new GLTFLoader();
    loader.load('cute_gun.gltf', async function (gltf) {
    gltf.scene.scale.set(0.05, 0.05, 0.05);
    let mymodel = gltf.scene;
    mymodel.rotation.y = THREE.MathUtils.degToRad(270);
    mymodel.rotation.x = THREE.MathUtils.degToRad(-36.5);
    mymodel.position.set(0, -0.1, 0);
    controllerGrip2.add(mymodel);
    });

    //own model 2//
    loader.load('pink_gun.gltf', async function (gltf) {
    gltf.scene.scale.set(0.005, 0.005, 0.005);
    let mymodel2 = gltf.scene;
    mymodel2.rotation.y = THREE.MathUtils.degToRad(90);
    mymodel2.rotation.x = THREE.MathUtils.degToRad(-36.5);
    mymodel2.position.set(0, -0.15, 0);
    controllerGrip1.add(mymodel2);
    });

    const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

    const line = new THREE.Line( geometry );
    line.name = 'line';
    line.scale.z = 5;

    controller1.add( line.clone() );
    controller2.add( line.clone() );

    raycaster = new THREE.Raycaster();

    // renderer.setAnimationLoop( function () {

    //     renderer.render(scene, camera);
    //     moveMarker();
    
    // } );
    
}
function moveMarker() {
    INTERSECTION = undefined;
    if (controller1.userData.isSqueezing === true) {
    tempMatrix.identity().extractRotation(controller1.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller1.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    const intersects = raycaster.intersectObjects(teleportgroup.children, true);
    if (intersects.length > 0) {
    INTERSECTION = intersects[0].point;
    console.log(intersects[0]);
    console.log(INTERSECTION);
    }
    } else if (controller2.userData.isSqueezing === true) {
    tempMatrix.identity().extractRotation(controller2.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller2.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    // const intersects = raycaster.intersectObjects([floor]);
    const intersects = raycaster.intersectObjects(teleportgroup.children, true);
    if (intersects.length > 0) {
        INTERSECTION = intersects[0].point;
}
}
if (INTERSECTION) marker.position.copy(INTERSECTION);
marker.visible = INTERSECTION !== undefined;
}


function onSqueezeStart() {
    this.userData.isSqueezing = true;
    console.log('Controller squeeze started');
    }
function onSqueezeEnd() {
    this.userData.isSqueezing = false;
    console.log('squeezeend');
    if (INTERSECTION) {
    const offsetPosition = {
    x: -INTERSECTION.x,
    y: -INTERSECTION.y,
    z: -INTERSECTION.z,
    w: 1,
    };
    const offsetRotation = new THREE.Quaternion();
    const transform = new XRRigidTransform(offsetPosition, offsetRotation);
    const teleportSpaceOffset =
    baseReferenceSpace.getOffsetReferenceSpace(transform);
    renderer.xr.setReferenceSpace(teleportSpaceOffset);
    }
    }

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}


function onSelectStart( event ) {
    const controller = event.target;

    const intersections = getIntersections( controller );

    if ( intersections.length > 0 ) {

        const intersection = intersections[ 0 ];

        const object = intersection.object;
    
        controller.attach( object );

        controller.userData.selected = object;

    }

    controller.userData.targetRayMode = event.data.targetRayMode;

}

function onSelectEnd( event ) {

    const controller = event.target;

    if ( controller.userData.selected !== undefined ) {

        const object = controller.userData.selected;
        group.attach( object );

        controller.userData.selected = undefined;

    }

}



function getIntersections( controller ) {

    controller.updateMatrixWorld();

    raycaster.setFromXRController( controller );

   return raycaster.intersectObjects(group.children, true);
  

}

function intersectObjects( controller ) {

    // Do not highlight in mobile-ar

    if ( controller.userData.targetRayMode === 'screen' ) return;

    // Do not highlight when already selected

    if ( controller.userData.selected !== undefined ) return;

    const line = controller.getObjectByName( 'line' );
    const intersections = getIntersections( controller );

    if ( intersections.length > 0 ) {

        const intersection = intersections[ 0 ];

        const object = intersection.object;
        originalColor.copy(object.material.color);

        object.material.color.set(0xff69b4);

        intersected.push( object );

        line.scale.z = intersection.distance;

    } else {

        line.scale.z = 5;

    }

}

function cleanIntersected() {

    while ( intersected.length ) {

        const object = intersected.pop();
        object.material.color.copy(originalColor);

    }

}

function render() {
    
    renderer.render(scene, camera);
    cleanIntersected();
   

    if (controller1 && controller2) {
        intersectObjects(controller1);
        intersectObjects(controller2);
    }
}
// function animate() {
//     requestAnimationFrame(animate);
//     if (mixer) {
//         mixer.update(clock.getDelta());
//     }
//     renderer.render(scene, camera);
    
// }


