import { Component, signal, inject, OnInit, viewChild, ElementRef, afterNextRender, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import * as Matter from 'matter-js';
import anime from 'animejs';

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
  
  // Banana-in-a-box helper for signals
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
  private engine?: Matter.Engine;
  private render?: Matter.Render;

  constructor() {
    afterNextRender(() => {
      this.initPhysics();
      this.revealUI();
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
    if (this.render) {
      Matter.Render.stop(this.render);
      if (this.render.canvas.parentNode) {
        this.render.canvas.parentNode.removeChild(this.render.canvas);
      }
    }
    if (this.engine) Matter.Engine.clear(this.engine);
  }

  private revealUI() {
    anime({
      targets: '.glass-card',
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(100),
      easing: 'easeOutExpo'
    });
  }

  private initPhysics() {
    const el = this.container()?.nativeElement;
    if (!el) return;

    this.engine = Matter.Engine.create();
    this.render = Matter.Render.create({
      element: el,
      engine: this.engine,
      options: {
        width: el.clientWidth,
        height: el.clientHeight,
        background: 'transparent',
        wireframes: false
      }
    });

    const ground = Matter.Bodies.rectangle(el.clientWidth / 2, el.clientHeight + 10, el.clientWidth, 20, { isStatic: true });
    const wallLeft = Matter.Bodies.rectangle(-10, el.clientHeight / 2, 20, el.clientHeight, { isStatic: true });
    const wallRight = Matter.Bodies.rectangle(el.clientWidth + 10, el.clientHeight / 2, 20, el.clientHeight, { isStatic: true });

    Matter.World.add(this.engine.world, [ground, wallLeft, wallRight]);

    // Add sprinkles periodically
    const colors = ['#FF4D8D', '#FFB7C5', '#FFD1DC', '#74ebd5', '#ACB6E5'];
    const addSprinkle = () => {
      if (!this.engine) return;
      const x = Math.random() * el.clientWidth;
      const sprinkle = Matter.Bodies.rectangle(x, -10, 10, 4, {
        render: { fillStyle: colors[Math.floor(Math.random() * colors.length)] },
        restitution: 0.5
      });
      Matter.World.add(this.engine.world, sprinkle);
      
      // Cleanup old sprinkles
      if (this.engine.world.bodies.length > 50) {
        Matter.World.remove(this.engine.world, this.engine.world.bodies[4]);
      }
    };

    setInterval(addSprinkle, 1000);
    
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, this.engine);
    Matter.Render.run(this.render);
  }

  private handleResize = () => {
    const el = this.container()?.nativeElement;
    if (el && this.render) {
      this.render.canvas.width = el.clientWidth;
      this.render.canvas.height = el.clientHeight;
      this.render.options.width = el.clientWidth;
      this.render.options.height = el.clientHeight;
    }
  };
}
