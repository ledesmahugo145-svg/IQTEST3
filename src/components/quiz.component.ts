import { Component, computed, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question, LanguageConfig } from '../types';
import { IconComponent } from './ui/icon.component';

@Component({
  selector: 'app-quiz',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="w-full max-w-3xl mx-auto px-6 py-8 relative">
      <!-- Decorative Borders -->
      <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500/50 pointer-events-none"></div>
      <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-500/50 pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-500/50 pointer-events-none"></div>
      <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500/50 pointer-events-none"></div>

      <!-- Header with Exit Button -->
      <div class="flex justify-between items-start mb-12 border-b border-gray-800 pb-6">
        
        <!-- EXIT BUTTON -->
        <button 
          (click)="exit.emit()"
          class="group flex items-center gap-2 px-3 py-1.5 bg-red-900/10 border border-red-900/30 rounded text-xs font-mono text-red-400 hover:bg-red-900/30 hover:border-red-500 transition-all">
          <app-icon name="x" size="14"></app-icon>
          <span class="uppercase tracking-wider group-hover:text-red-300">
             {{ uiConfig().exit }}
          </span>
        </button>

        <div class="text-right">
           <span class="text-[10px] uppercase text-gray-500 tracking-widest mb-1 block">Protocol ID</span>
           <div class="font-mono text-xs text-gray-400">
             GEN-{{ currentQuestion().id }}-{{ currentQuestion().category.substring(0,3).toUpperCase() }}
           </div>
           <div class="mt-2 text-[10px] uppercase text-blue-500 tracking-widest">
             0{{ currentIndex() + 1 }} / <span class="text-gray-600">0{{ questions().length }}</span>
           </div>
        </div>
      </div>

      <!-- Question -->
      <div class="mb-16 relative">
        <div class="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-transparent opacity-50"></div>
        <span class="text-xs font-mono text-blue-500 uppercase mb-2 block tracking-widest">
           // {{ currentQuestion().category }} NODE
        </span>
        <h2 class="text-xl md:text-2xl font-light leading-relaxed text-gray-100 mb-2">
          {{ currentQuestion().text }}
        </h2>
      </div>

      <!-- Options -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        @for (opt of currentQuestion().options; track $index) {
          <button 
            (click)="selectOption($index)"
            [class.border-blue-500]="selectedOption() === $index"
            [class.bg-blue-900_20]="selectedOption() === $index"
            [class.text-white]="selectedOption() === $index"
            [class.border-gray-800]="selectedOption() !== $index"
            [class.text-gray-400]="selectedOption() !== $index"
            class="group relative overflow-hidden p-6 text-left border bg-gray-900/30 backdrop-blur-sm transition-all duration-300 hover:border-gray-600 hover:bg-gray-800/50 rounded-sm">
            
            <!-- Selection Indicator -->
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 transition-transform duration-300"
                 [class.-translate-x-full]="selectedOption() !== $index"
                 [class.translate-x-0]="selectedOption() === $index">
            </div>

            <div class="flex items-start gap-4">
               <span class="font-mono text-xs opacity-50 pt-1">[{{ $index + 1 }}]</span>
               <span class="text-base font-medium">{{ opt }}</span>
            </div>
            
            <!-- Corner Accent -->
            <div class="absolute bottom-0 right-0 w-2 h-2 bg-current opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        }
      </div>

      <!-- Controls -->
      <div class="flex justify-end pt-4 border-t border-gray-800/50">
        <button 
          [disabled]="selectedOption() === null"
          (click)="submitAnswer()"
          class="relative overflow-hidden bg-white text-black px-10 py-4 font-bold font-mono text-sm uppercase tracking-wider disabled:opacity-20 disabled:cursor-not-allowed hover:bg-blue-50 transition-all active:scale-95 group rounded-sm flex items-center gap-2">
          <span class="relative z-10">
            @if (isLast()) {
              {{ uiConfig().finish }}
            } @else {
              {{ uiConfig().next }}
            }
          </span>
          <app-icon name="arrow-right" size="16" class="relative z-10"></app-icon>
          <div class="absolute inset-0 bg-blue-400 transform translate-y-full transition-transform group-hover:translate-y-0 opacity-10"></div>
        </button>
      </div>

      <!-- Progress Bar Top -->
      <div class="fixed top-0 left-0 w-full h-1 bg-gray-900 z-50">
        <div class="h-full bg-gradient-to-r from-blue-600 to-purple-500 transition-all duration-500 ease-out box-shadow-glow"
             [style.width.%]="((currentIndex() + 1) / questions().length) * 100">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-blue-900_20 {
      background-color: rgba(30, 58, 138, 0.2);
    }
    .box-shadow-glow {
      box-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
    }
  `]
})
export class QuizComponent {
  questions = input.required<Question[]>();
  uiConfig = input.required<LanguageConfig['ui']>();
  complete = output<number>(); 
  exit = output<void>();

  currentIndex = signal(0);
  selectedOption = signal<number | null>(null);
  score = signal(0);

  currentQuestion = computed(() => {
    const questions = this.questions();
    const index = this.currentIndex();
    if (questions.length > index) {
      return questions[index];
    }
    return { id: 0, text: '...', options: [], correctIndex: 0, category: 'logic' } as Question;
  });

  isLast = computed(() => this.currentIndex() === this.questions().length - 1);

  selectOption(index: number) {
    this.selectedOption.set(index);
  }

  submitAnswer() {
    const selected = this.selectedOption();
    if (selected === null) return;

    if (selected === this.currentQuestion().correctIndex) {
      this.score.update(s => s + 1);
    }

    if (this.isLast()) {
      this.complete.emit(this.score());
    } else {
      this.selectedOption.set(null);
      this.currentIndex.update(i => i + 1);
    }
  }
}