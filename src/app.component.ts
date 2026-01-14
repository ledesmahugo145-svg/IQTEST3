import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntroComponent } from './components/intro.component';
import { QuizComponent } from './components/quiz.component';
import { PaywallComponent } from './components/paywall.component';
import { ResultComponent } from './components/result.component';
import { GeminiService } from './services/gemini.service';
import { LanguageService } from './services/language.service';
import { AppState, Question, UserResult } from './types';
import { IconComponent } from './components/ui/icon.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    IntroComponent, 
    QuizComponent, 
    PaywallComponent, 
    ResultComponent,
    IconComponent
  ],
  template: `
    <!-- MAIN CONTAINER: Locked 100vh, hidden overflow -->
    <div class="h-screen w-full flex flex-col relative overflow-hidden bg-[#030712] text-gray-50 selection:bg-blue-500/30">
      
      <!-- Moving Grid Background -->
      <div class="fixed inset-0 z-0 opacity-[0.05] pointer-events-none perspective-grid"></div>

      <!-- Abstract Light Effects -->
      <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div class="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-900/10 rounded-full blur-[120px] animate-blob"></div>
        <div class="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-900/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div class="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-indigo-900/10 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <!-- Main Content Area -->
      <main class="flex-grow flex flex-col relative z-10 w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide">
        
        @switch (state()) {
          @case ('intro') {
            <app-intro (start)="startGeneration()" />
          }
          
          @case ('generating') {
            <div class="flex flex-col items-center justify-center h-full w-full">
              <div class="text-center w-full max-w-lg mx-auto p-4">
                <div class="flex justify-center items-center gap-4 mb-6">
                  <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                  <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                  <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <p class="font-mono text-lg text-gray-200 tracking-wider mb-2">
                  {{ uiConfig().generatingTest }}
                </p>
                <p class="text-xs text-gray-500 font-mono uppercase">Connecting to NeuroMetric AI Core</p>
              </div>
            </div>
          }

          @case ('test') {
            @if (questions().length > 0) {
              <div class="flex flex-grow items-center justify-center p-4">
                <app-quiz 
                  [questions]="questions()" 
                  [uiConfig]="uiConfig()"
                  (complete)="handleQuizComplete($event)" 
                  (exit)="resetApp()"
                />
              </div>
            }
          }

          @case ('calculating') {
             <div class="flex flex-col items-center justify-center h-full w-full">
               <div class="text-center w-full max-w-md mx-auto p-4">
                <div class="flex justify-between text-xs font-mono text-gray-500 mb-2">
                   <span>ENCRYPTING_DATA</span>
                   <span>100%</span>
                </div>
                <div class="h-1 bg-gray-900 w-full overflow-hidden mb-4">
                   <div class="h-full bg-blue-600 animate-[progress_1.5s_ease-in-out]"></div>
                </div>
                <p class="font-mono text-xs text-gray-400 tracking-widest uppercase animate-pulse">
                  {{ uiConfig().calculating }}
                </p>
              </div>
            </div>
          }

          @case ('paywall') {
            <div class="flex flex-col items-center justify-center h-full w-full p-4">
              <app-paywall [uiConfig]="uiConfig()" (paid)="showResult()" />
            </div>
          }

          @case ('result') {
            @if (result()) {
              <div class="flex flex-grow items-center justify-center p-4">
                <app-result [result]="result()!" [uiConfig]="uiConfig()" (restart)="resetApp()" />
              </div>
            }
          }

          @case ('error') {
            <div class="flex flex-col items-center justify-center h-full w-full p-6 text-center">
              <div class="max-w-md p-8 bg-red-900/10 border border-red-500/20 rounded-lg backdrop-blur-sm">
                <app-icon name="shield-alert" class="w-16 h-16 mx-auto text-red-400 mb-6"></app-icon>
                <h2 class="text-2xl font-bold text-white mb-3">{{ uiConfig().errorTitle }}</h2>
                <p class="text-red-200/80 mb-6 text-sm">{{ uiConfig().errorDesc }}</p>
                <a href="https://docs.netlify.com/environment-variables/get-started/" target="_blank" rel="noopener noreferrer" 
                   class="inline-block bg-gray-200 text-black px-6 py-3 font-bold font-mono text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-all">
                  {{ uiConfig().errorAction }}
                </a>
              </div>
            </div>
          }
        }
      </main>

      <!-- Minimal Footer -->
      <footer class="absolute bottom-0 left-0 w-full p-4 text-center z-20 border-t border-gray-900/50 backdrop-blur-sm pointer-events-none">
        <div class="flex flex-col items-center justify-center gap-2">
           <div class="w-1 h-1 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.8)] animate-ping"></div>
           <p class="text-[10px] text-gray-700 font-mono uppercase tracking-widest">
             System Operational // NeuroMetric v3.5
           </p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    /* Hide scrollbar for Chrome, Safari and Opera */
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    /* Hide scrollbar for IE, Edge and Firefox */
    .scrollbar-hide {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }

    @keyframes progress {
      0% { width: 0%; }
      100% { width: 100%; }
    }
    .animate-blob {
      animation: blob 10s infinite;
    }
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    .animation-delay-4000 {
      animation-delay: 4s;
    }
    .perspective-grid {
      background-size: 50px 50px;
      background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      transform: perspective(500px) rotateX(60deg);
      transform-origin: center top;
      height: 200vh;
      animation: grid-move 20s linear infinite;
    }
    @keyframes grid-move {
      0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
      100% { transform: perspective(500px) rotateX(60deg) translateY(-50px); }
    }
  `]
})
export class AppComponent {
  state = signal<AppState>('intro');
  
  geminiService = inject(GeminiService);
  langService = inject(LanguageService);
  
  uiConfig = computed(() => this.langService.config().ui);
  questions = signal<Question[]>([]);
  result = signal<UserResult | null>(null);
  
  private startTime: number = 0;

  constructor() {
    this.langService.initialize();
  }

  async startGeneration() {
    this.state.set('generating');
    try {
      const q = await this.geminiService.generateTest(this.langService.currentLang());
      this.startTime = Date.now();
      this.questions.set(q);
      this.state.set('test');

    } catch (e) {
      console.error('Generation failed', e);
      this.resetApp(); 
    }
  }

  async handleQuizComplete(rawScore: number) {
    const endTime = Date.now();
    const durationMs = endTime - this.startTime;
    const durationSeconds = Math.floor(durationMs / 1000);
    const totalQuestions = this.questions().length;

    this.state.set('calculating');
    
    // Check for speed running (answering impossibly fast)
    const isSpeedRun = durationSeconds < (totalQuestions * 3); 
    
    let estimatedIQ = 0;
    let validity: 'High' | 'Moderate' | 'Low - Rapid Response' = 'High';

    if (isSpeedRun) {
      validity = 'Low - Rapid Response';
      // Low score for speed runners
      estimatedIQ = 65 + Math.floor(Math.random() * 15); 
    } else {
      // Standard IQ Calculation Logic based on score out of 10
      switch (rawScore) {
        case 0: estimatedIQ = 68; break; 
        case 1: estimatedIQ = 74; break; 
        case 2: estimatedIQ = 79; break; 
        case 3: estimatedIQ = 85; break; 
        case 4: estimatedIQ = 92; break; 
        case 5: estimatedIQ = 100; break; 
        case 6: estimatedIQ = 108; break; 
        case 7: estimatedIQ = 115; break; 
        case 8: estimatedIQ = 125; break; 
        case 9: estimatedIQ = 135; break; 
        case 10: estimatedIQ = 145; break; 
        default: estimatedIQ = 100;
      }
      estimatedIQ += Math.floor(Math.random() * 5) - 2;
    }

    estimatedIQ = Math.max(60, Math.min(160, estimatedIQ));
    const percentile = Math.min(99.9, Math.max(0.1, Math.round((estimatedIQ - 100) / 15 * 34 + 50)));

    const summary = await this.geminiService.generateAnalysis(
      estimatedIQ, 
      this.langService.currentLang(),
      validity 
    );

    this.result.set({
      rawScore,
      totalQuestions,
      estimatedIQ,
      percentile,
      summary,
      generatedDate: new Date().toLocaleDateString(),
      durationSeconds,
      validity
    });

    setTimeout(() => {
      this.state.set('paywall');
    }, 2500);
  }

  showResult() {
    this.state.set('result');
  }

  resetApp() {
    if(this.state() === 'error') return;
    this.questions.set([]);
    this.result.set(null);
    this.state.set('intro');
  }
}