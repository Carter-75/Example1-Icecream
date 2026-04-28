import { Component, signal, inject, OnInit, viewChild, ElementRef, afterNextRender, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  
  protected readonly title = signal('Ice Cream Tracker');
  protected trucks = signal<any[]>([]);
  protected searchTerm = signal('');
  
  get search() { return this.searchTerm(); }
  set search(v: string) { this.searchTerm.set(v); }

  protected filteredTrucks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.trucks().filter(t => 
      t.name.toLowerCase().includes(term) || 
      t.currentLocation.toLowerCase().includes(term) ||
      t.route.some((r: string) => r.toLowerCase().includes(term))
    );
  });

  private container = viewChild<ElementRef<HTMLDivElement>>('scene');
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private sprinkles: THREE.Mesh[] = [];
  private animationFrameId?: number;
  private lenis?: Lenis;

  constructor() {
    afterNextRender(() => {
      this.initLenis();
      this.initThreeJS();
      
      // Allow Angular view to render, then initialize GSAP
      setTimeout(() => {
        this.initGSAP();
      }, 100);

      window.addEventListener('resize', this.handleResize);
    });
  }

  ngOnInit() {
    this.api.getTrucks().subscribe({
      next: (data) => this.trucks.set(data),
      error: (err) => console.error('Failed to load trucks:', err)
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.renderer) this.renderer.dispose();
    if (this.lenis) this.lenis.destroy();
    ScrollTrigger.getAll().forEach(t => t.kill());
  }

  private initLenis() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    const raf = (time: number) => {
      this.lenis?.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
  }

  private initGSAP() {
    gsap.utils.toArray('.gs-reveal').forEach((elem: any) => {
      gsap.fromTo(elem, 
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: elem,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }

  private initThreeJS() {
    const el = this.container()?.nativeElement;
    if (!el) return;

    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 30;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    el.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    this.scene.add(directionalLight);

    // Create Sprinkles
    const geometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
    const colors = [0xFF4D8D, 0xFFB7C5, 0xFFD1DC, 0x74ebd5, 0xACB6E5];

    for (let i = 0; i < 150; i++) {
      const material = new THREE.MeshStandardMaterial({ 
        color: colors[Math.floor(Math.random() * colors.length)],
        roughness: 0.3,
        metalness: 0.1
      });
      const sprinkle = new THREE.Mesh(geometry, material);
      
      sprinkle.position.x = (Math.random() - 0.5) * 60;
      sprinkle.position.y = (Math.random() - 0.5) * 60;
      sprinkle.position.z = (Math.random() - 0.5) * 40;
      
      sprinkle.rotation.x = Math.random() * Math.PI;
      sprinkle.rotation.y = Math.random() * Math.PI;
      
      // Store custom rotation speeds
      (sprinkle as any).userData = {
        rx: (Math.random() - 0.5) * 0.02,
        ry: (Math.random() - 0.5) * 0.02,
        vy: -0.01 - Math.random() * 0.03
      };

      this.scene.add(sprinkle);
      this.sprinkles.push(sprinkle);
    }

    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      
      this.sprinkles.forEach(s => {
        s.rotation.x += s.userData['rx'];
        s.rotation.y += s.userData['ry'];
        s.position.y += s.userData['vy'];
        
        // Wrap around
        if (s.position.y < -30) {
          s.position.y = 30;
          s.position.x = (Math.random() - 0.5) * 60;
        }
      });
      
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    animate();
  }

  private handleResize = () => {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };
}
