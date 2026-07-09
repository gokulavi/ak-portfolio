import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    init3DScene();
    initScrollAnimations();
    initContactForm();
});

function init3DScene() {
    const canvas = document.getElementById('webgl-canvas');
    
    // Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030305, 0.002);

    // Camera Setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Initial camera position
    camera.position.set(0, 5, 20);
    
    // Target objects for camera to look at during scroll
    const cameraTarget = new THREE.Vector3(0, 0, 0);

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Post-Processing (Cinematic Bloom for Crypto Vibe)
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, // strength
        0.4, // radius
        0.85 // threshold
    );
    // Make bloom purplish/pinkish
    bloomPass.tint = new THREE.Color(0x7928ca);
    
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- CREATE SURREAL DIGITAL LANDSCAPE ---
    
    // 1. Terrain Grid (Wireframe)
    const terrainGeometry = new THREE.PlaneGeometry(200, 200, 64, 64);
    
    // Perturb vertices to create mountains
    const posAttribute = terrainGeometry.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
        const x = posAttribute.getX(i);
        const y = posAttribute.getY(i);
        
        // Simple procedural noise using sine waves
        const z = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 5 + 
                  Math.sin(x * 0.05) * 8 + 
                  Math.cos(y * 0.02) * 10;
                  
        posAttribute.setZ(i, z);
    }
    terrainGeometry.computeVertexNormals();

    const terrainMaterial = new THREE.MeshBasicMaterial({
        color: 0x7928ca, // Purple grid
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -10;
    scene.add(terrain);

    // 2. Floating Data Particles (The Ecosystem)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 150; // Spread across wide area
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xff0080, // Neon pink
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleMesh);

    // 3. Central Abstract Object (Crypto Core)
    const coreGeometry = new THREE.IcosahedronGeometry(3, 1);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.set(0, 5, -20);
    scene.add(core);

    // --- SCROLL ANIMATION BINDING ---
    // We update camera position/rotation based on GSAP scroll progress
    
    // Create an object to hold values that GSAP will tween
    const scrollProxy = { progress: 0 };
    
    // Create a master ScrollTrigger that spans the whole body
    gsap.to(scrollProxy, {
        progress: 1,
        scrollTrigger: {
            trigger: "#scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: 1, // Smooth scrubbing
            onUpdate: (self) => {
                const p = self.progress;
                
                // Fly through the landscape
                // Move from z=20 to z=-60
                camera.position.z = 20 - (p * 80);
                
                // Bob up and down
                camera.position.y = 5 + Math.sin(p * Math.PI * 4) * 2;
                
                // Look slightly around
                cameraTarget.x = Math.sin(p * Math.PI * 2) * 5;
                cameraTarget.z = camera.position.z - 20;
                
                // Hide scroll indicator once user starts scrolling
                if (p > 0.01) {
                    document.querySelector('.scroll-indicator').classList.add('hidden');
                } else {
                    document.querySelector('.scroll-indicator').classList.remove('hidden');
                }
            }
        }
    });


    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Animate Terrain gently moving
        terrain.position.z = (elapsedTime * 2) % 20; // Creates endless flying illusion

        // Animate particles
        particleMesh.rotation.y = elapsedTime * 0.02;
        particleMesh.rotation.x = elapsedTime * 0.01;

        // Animate Core
        core.rotation.x += 0.005;
        core.rotation.y += 0.005;

        // Update camera lookAt smoothly
        camera.lookAt(cameraTarget);

        // Render scene with bloom
        composer.render();
    }

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });

    // Remove Loader once everything is ready
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1500); // Fake load time for cinematic effect
}

function initScrollAnimations() {
    // Fade in HTML elements as they enter viewport
    const fadeElements = document.querySelectorAll('.fade-in');
    
    fadeElements.forEach(el => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
        });
    });
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    const msgDiv = document.getElementById('form-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = form.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>TRANSMITTING...</span><div class="btn-glow"></div>';
            
            const formData = new URLSearchParams(new FormData(form)).toString();

            try {
                // Submit to Netlify's built-in form handler
                const response = await fetch('/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData
                });

                if (response.ok) {
                    msgDiv.innerHTML = `<span style="color: #00ffaa;">✓ SECURE TRANSMISSION SUCCESSFUL</span>`;
                    form.reset();
                } else {
                    msgDiv.innerHTML = `<span style="color: #ff0055;">✗ TRANSMISSION FAILED</span>`;
                }
            } catch (err) {
                msgDiv.innerHTML = `<span style="color: #ff0055;">✗ CONNECTION INTERRUPTED</span>`;
            } finally {
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 1000);
            }
        });
    }
}
