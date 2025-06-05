// Jason Yu
// jaleyu@uucsc.edu
// student id: 1874080

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";

const objLoader = new OBJLoader();
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

let startTime = performance.now() / 1000.0;
let seconds = performance.now() / 1000.0 - startTime;

let sphereXYZ = computeSphereXYZ();

function computeSphereXYZ() {
    const x = 10 * Math.sin(seconds / 3) - 8;
    const y = 0.99;
    const z = 15;

    return { x: x, y: y, z: z };
}

function main() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const fov = 45;
    const aspect = 2;
    const near = 0.001;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(15, 12, 15);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xbadbe6, 5, 50);

    {
        const spotlight = new THREE.SpotLight(0xe6fffe, 1000, 50, degToRad(40), 0.3);
        spotlight.position.set(-5, 10, 15);
        spotlight.castShadow = true;
        scene.add(spotlight);
    }

    {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
    }

    {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 15);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
    }

    {
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
        groundGeometry.rotateX(-Math.PI / 2);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            side: THREE.DoubleSide,
        });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.castShadow = false;
        groundMesh.receiveShadow = true;
        scene.add(groundMesh);
    }

    {
        textureLoader.load("./skybox.jpg", (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.SRGBColorSpace;
            scene.background = texture;
        });
    }
    
    // Models used through Poly Pizza
    {
        gltfLoader.load("ship1.glb", (gltf) => { // Mothership
            const mesh = gltf.scene;
            mesh.scale.set(8.5, 8.5, 8.5);
            mesh.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            mesh.position.set(0, 1.5, 0);
            scene.add(mesh);
        });
    }

    let hoverShips = []; // Array to store both ships
    let clock = new THREE.Clock();

    // Fighter 1
    gltfLoader.load("ship2.glb", (gltf) => {
        const mesh = gltf.scene;
        mesh.scale.set(0.08, 0.08, 0.08);
        mesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        mesh.position.set(4, 4, 2);
        mesh.rotation.y = Math.PI;
        scene.add(mesh);

        hoverShips.push({ mesh, baseY: 4, baseX: 4 }); // Save mesh and base positions
    });

    // Fighter 2
    gltfLoader.load("ship2a.glb", (gltf) => {
        const mesh = gltf.scene;
        mesh.scale.set(0.08, 0.08, 0.08);
        mesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        mesh.position.set(-4, 4, -1);
        mesh.rotation.y = Math.PI;
        scene.add(mesh);

        hoverShips.push({ mesh, baseY: 4, baseX: -5 }); // Save mesh and base positions
    });

    // Fighter 3
    gltfLoader.load("ship2b.glb", (gltf) => {
        const mesh = gltf.scene;
        mesh.scale.set(2, 2, 2);
        mesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        mesh.position.set(7, 6, 0);
        mesh.rotation.y = Math.PI/2;
        scene.add(mesh);

        hoverShips.push({ mesh, baseY: 7, baseX: 0 }); // Save mesh and base positions
    });

    // Animation loop
    function animate_ship() {
        requestAnimationFrame(animate_ship);

        const elapsed = clock.getElapsedTime();

        // Animate all hover ships
        hoverShips.forEach(({ mesh, baseY, baseX }, i) => {
            mesh.position.y = baseY + Math.sin(elapsed * 2 + i) * 0.5; // slight offset per ship
            mesh.position.x = baseX - Math.sin(elapsed * 2 + i) * 0.2;
        });

        renderer.render(scene, camera);
    }
    animate_ship();



    // https://www.freepik.com/free-vector/realistic-broken-textured-cardboard_23667843.htm#fromView=keyword&page=1&position=12&uuid=e8b36d20-2507-487f-8728-012cc1e77292&query=Crate+Texture
    {
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const texture = textureLoader.load("box.jpg");
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshStandardMaterial({
            map: texture,
        });
        const instances = [
            { x: 5, y: 0, z: 11, rotation: 0 },
            { x: -5, y: 0, z: 10, rotation: degToRad(15) },
            { x: 5, y: 0, z: -1.5, rotation: degToRad(50) },
            { x: -4, y: 0, z: -7, rotation: degToRad(25) },
            { x: -3.5, y: 0, z: -4, rotation: degToRad(45) },
            { x: -5.5, y: 0, z: -2, rotation: degToRad(35) },
            { x: 5, y: 0, z: -6, rotation: degToRad(35) },
            { x: 6.5, y: 0, z: -7.5, rotation: degToRad(15) },
        ];
        for (let i = 0; i < instances.length; i++) {
            const { x, y, z, rotation } = instances[i];
            const box = new THREE.Mesh(geometry, material);
            box.castShadow = true;
            box.receiveShadow = true;
            box.position.set(x, y + 0.4, z);
            box.rotation.y = rotation;
            scene.add(box);
        }
    }

    {
        const geometry = new THREE.ConeGeometry(0.2, 0.4, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xffa500 });
        const instances = [
            { x: 6, y: 0, z: 11 },
            { x: -6, y: 0, z: 10 },
            { x: 6, y: 0, z: -1.5 },
            { x: -6, y: 0, z: -7 },
            { x: -4.5, y: 0, z: -4 },
            { x: -6.5, y: 0, z: -2 },
            { x: 6, y: 0, z: -6 },
            { x: 7.5, y: 0, z: -7.5 },
        ];
        for (let i = 0; i < instances.length; i++) {
            const { x, y, z, rotation } = instances[i];
            const cone = new THREE.Mesh(geometry, material);
            cone.castShadow = true;
            cone.receiveShadow = true;
            cone.position.set(x, y + 0.2, z);
            scene.add(cone);
        }
    }

    {
        const geometry = new THREE.SphereGeometry(0.2, 32, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const instances = [
            { x: 8, y: 0, z: 11 },
            { x: -8, y: 0, z: 10 },
            { x: 8, y: 0, z: -1.5 },
            { x: -8, y: 0, z: -7 },
            { x: -6.5, y: 0, z: -4 },
            { x: -8.5, y: 0, z: -2 },
            { x: 8, y: 0, z: -6 },
            { x: 9.5, y: 0, z: -7.5 },
        ];
        for (let i = 0; i < instances.length; i++) {
            const { x, y, z, rotation } = instances[i];
            const sphere = new THREE.Mesh(geometry, material);
            sphere.castShadow = true;
            sphere.receiveShadow = true;
            sphere.position.set(x, y + 0.2, z);
            scene.add(sphere);
        }
    }

    const geometry = new THREE.SphereGeometry(1, 32, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const rollingSphere = new THREE.Mesh(geometry, material);
    rollingSphere.position.set(sphereXYZ.x, sphereXYZ.y, sphereXYZ.z);
    scene.add(rollingSphere);

    const rainCount = 10000;
    const rainGeometry = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
        rainPositions[i] = Math.random() * 400 - 200;
        rainPositions[i + 1] = Math.random() * 500;
        rainPositions[i + 2] = Math.random() * 400 - 200;
    }

    rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

    const rainMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.8,
        transparent: true
    });

    const rain = new THREE.Points(rainGeometry, rainMaterial);
    scene.add(rain);

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render() {
        seconds = performance.now() / 1000.0 - startTime;
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        controls.update();
        renderer.render(scene, camera);
        animate();
        requestAnimationFrame(render);
    }

    function degToRad(degrees) {
        return (degrees * Math.PI) / 180;
    }

    function animate() {
        sphereXYZ = computeSphereXYZ();
        rollingSphere.position.set(sphereXYZ.x, sphereXYZ.y, sphereXYZ.z);
        const positions = rain.geometry.attributes.position.array;
        for (let i = 0; i < rainCount * 3; i += 3) {
            positions[i + 1] -= 0.5;
            if (positions[i + 1] < 0) {
                positions[i + 1] = 500;
            }
        }

        rain.geometry.attributes.position.needsUpdate = true;
    }

    animate();

    requestAnimationFrame(render);
}

main();