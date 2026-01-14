import { Component, inject, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';
import { LanguageCode } from '../types';
import { IconComponent } from './ui/icon.component';

@Component({
  selector: 'app-intro',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <!-- Top Right Language Selector -->
    <div class="absolute top-6 right-6 z-[100]">
      <div class="relative">
        <button 
          (click)="toggleLangMenu()"
          [attr.aria-haspopup]="true"
          [attr.aria-expanded]="isLangMenuOpen()"
          class="flex items-center gap-2 px-4 py-2 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-full text-xs font-mono text-white hover:border-blue-500 transition-all shadow-lg min-w-[120px] justify-center">
          <app-icon name="globe" size="14"></app-icon>
          <span class="uppercase font-bold tracking-wide">
            @if (langService.detectionStatus() === 'detecting') {
              <span class="animate-pulse">DETECTING...</span>
            } @else {
              {{ langService.config().name }}
            }
          </span>
          <app-icon name="chevron-down" size="12" [class.rotate-180]="isLangMenuOpen()" class="transition-transform duration-200"></app-icon>
        </button>
        
        <!-- Dropdown Menu -->
        @if (isLangMenuOpen()) {
          <div class="absolute right-0 top-full mt-2 w-40 max-h-80 overflow-y-auto py-2 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-[101] animate-in fade-in slide-in-from-top-2">
            @for (lang of langService.availableLanguages; track lang.code) {
              <button 
                (click)="selectLang(lang.code)"
                class="w-full text-left px-4 py-3 text-xs font-mono hover:bg-blue-900/30 transition-colors flex items-center justify-between group"
                [class.text-blue-400]="langService.currentLang() === lang.code"
                [class.text-gray-400]="langService.currentLang() !== lang.code">
                <span>{{ lang.name }}</span>
                @if (langService.currentLang() === lang.code) {
                  <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                }
              </button>
            }
          </div>
        }
        
        <!-- Backdrop to close menu -->
        @if (isLangMenuOpen()) {
          <div (click)="isLangMenuOpen.set(false)" class="fixed inset-0 z-40 bg-transparent cursor-default"></div>
        }
      </div>
    </div>

    <!-- Scanner Effect (Absolute relative to host) -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
       <div class="w-full h-[2px] bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-scan"></div>
    </div>

    <!-- Main Content Container -->
    <div class="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 relative z-10 text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-mono tracking-widest uppercase mb-6 animate-fade-in">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        System Online :: 
        @if (langService.detectionStatus() === 'detecting') {
          <span class="animate-pulse">...</span>
        } @else {
          {{ langService.currentLang() }}
        }
      </div>

      <!-- DYNAMIC TITLE HEADER -->
      <h1 class="font-black tracking-tighter text-white leading-none select-none drop-shadow-[0_0_25px_rgba(37,99,235,0.3)] mb-8">
         <div class="flex flex-col md:flex-row items-center justify-center gap-x-2 md:gap-x-4 text-[13vw] md:text-[6rem] lg:text-[7rem]">
           <span>NEURO</span>
           <span class="text-blue-600">METRIC</span>
         </div>
      </h1>
      
      <p class="text-gray-400 font-mono text-xs md:text-sm tracking-[0.3em] uppercase max-w-lg mx-auto leading-relaxed border-l-2 border-blue-600 pl-4 text-left mb-12">
        Advanced Cognitive Heuristics Engine<br/>
        <span class="text-gray-600">Ver 3.5.2 // Global Database Connected</span>
      </p>

      <!-- Start Button Container -->
      <div class="w-full max-w-xs md:max-w-sm relative group z-10">
        <!-- Glow Underlay -->
        <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded opacity-20 group-hover:opacity-100 blur transition duration-500"></div>
        
        <button 
          (click)="start.emit()"
          class="relative w-full bg-black border border-gray-800 font-mono font-bold uppercase py-5 px-6 tracking-wider hover:bg-gray-900 transition-all overflow-hidden shadow-2xl">
          
          <span class="relative z-20 flex items-center justify-center gap-3 text-white text-xs sm:text-sm">
            {{ langService.config().ui.start }}
            <span class="block w-2 h-2 bg-blue-500 animate-pulse"></span>
          </span>
          
          <!-- Hover slide effect -->
          <div class="absolute top-0 left-0 w-full h-full bg-blue-600/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-10"></div>
        </button>
      </div>
      
      <div class="mt-8 text-[10px] text-gray-600 font-mono max-w-sm border-t border-gray-900 pt-4">
        <p>CAUTION: Adaptive AI in use. Assessments are unique to each session.</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100%;
      width: 100%;
      position: relative;
      flex-grow: 1; /* Ensures it fills the parent main container */
    }

    @keyframes scan {
      0% { transform: translateY(-10vh); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateY(110vh); opacity: 0; }
    }
    .animate-scan {
      animation: scan 4s linear infinite;
    }
    .animate-fade-in {
      animation: fadeIn 1s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class IntroComponent {
  langService = inject(LanguageService);
  start = output<void>();
  isLangMenuOpen = signal(false);

  toggleLangMenu() {
    this.isLangMenuOpen.update(v => !v);
  }

  selectLang(code: string) {
    this.langService.setLanguage(code as LanguageCode);
    this.isLangMenuOpen.set(false);
  }
}