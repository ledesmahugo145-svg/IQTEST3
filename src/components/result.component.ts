import { Component, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserResult, LanguageConfig } from '../types';
import { PdfService } from '../services/pdf.service';
import { IconComponent } from './ui/icon.component';

@Component({
  selector: 'app-result',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-12 text-center relative">
      <!-- Background Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/10 blur-[80px] rounded-full pointer-events-none"></div>

      <div class="relative z-10">
        <!-- Header -->
        <div class="mb-12">
          <h2 class="text-xs font-mono text-blue-400 mb-4 uppercase tracking-[0.2em] border border-blue-900/30 inline-block px-4 py-1 rounded-full">
            {{ uiConfig().resultTitle }}
          </h2>
          
          <div class="relative inline-block my-8 group cursor-default">
             <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
             <h1 class="relative text-[8rem] md:text-[10rem] font-black text-white leading-none tracking-tighter">
               {{ result().estimatedIQ }}
             </h1>
             <div class="absolute top-0 -right-12 rotate-12 bg-gray-900 border border-gray-700 text-gray-300 text-xs font-mono px-3 py-1 rounded shadow-xl">
               {{ result().percentile > 99 ? 'RARE' : 'Top ' + (100 - result().percentile) + '%' }}
             </div>
          </div>
          
          <p class="text-gray-500 font-mono text-sm uppercase tracking-widest">
            {{ uiConfig().iqLabel }}
          </p>
        </div>

        <!-- Rigor Metrics -->
        <div class="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-10">
           <div class="bg-gray-900/40 border border-gray-800 p-3 rounded flex items-center justify-center gap-3">
              <app-icon name="clock" size="16" class="text-blue-400"></app-icon>
              <div class="text-left">
                <div class="text-[10px] text-gray-500 uppercase tracking-wider">Duration</div>
                <div class="text-sm font-mono text-white">{{ formatTime(result().durationSeconds) }}</div>
              </div>
           </div>
           <div class="bg-gray-900/40 border border-gray-800 p-3 rounded flex items-center justify-center gap-3">
              @if (result().validity.includes('Low')) {
                 <app-icon name="shield-alert" size="16" class="text-red-400"></app-icon>
              } @else {
                 <app-icon name="check-circle" size="16" class="text-green-400"></app-icon>
              }
              <div class="text-left">
                <div class="text-[10px] text-gray-500 uppercase tracking-wider">Validity</div>
                <div class="text-sm font-mono" [class.text-red-400]="result().validity.includes('Low')" [class.text-green-400]="!result().validity.includes('Low')">
                   {{ result().validity }}
                </div>
              </div>
           </div>
        </div>

        <!-- Analysis Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
          
          <!-- Text Analysis -->
          <div class="p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-sm relative overflow-hidden group">
             <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-50"></div>
             <div class="flex items-center gap-3 mb-6 text-blue-400">
               <app-icon name="brain-circuit" size="20"></app-icon>
               <h3 class="font-bold font-mono text-sm uppercase tracking-wider">Clinical Assessment</h3>
             </div>
             <p class="text-gray-300 text-sm leading-7 font-light">
               {{ result().summary }}
             </p>
          </div>
          
          <!-- Stat Bars -->
          <div class="p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-sm flex flex-col justify-center gap-6">
             <!-- Logic -->
             <div>
               <div class="flex justify-between text-[10px] font-mono text-gray-400 mb-2 uppercase tracking-wider">
                 <span>Accuracy Rate</span>
                 <span class="text-white">{{ (result().rawScore / result().totalQuestions) * 100 | number:'1.0-0' }}%</span>
               </div>
               <div class="h-1 bg-gray-800 w-full overflow-hidden">
                 <div class="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      [style.width.%]="(result().rawScore / result().totalQuestions) * 100"></div>
               </div>
             </div>
             
             <!-- Pattern -->
             <div>
               <div class="flex justify-between text-[10px] font-mono text-gray-400 mb-2 uppercase tracking-wider">
                 <span>Processing Efficiency</span>
                 <span class="text-white">{{ calculateEfficiency() }}%</span>
               </div>
               <div class="h-1 bg-gray-800 w-full overflow-hidden">
                 <div class="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                      [style.width.%]="calculateEfficiency()"></div>
               </div>
             </div>

             <!-- Spatial -->
              <div>
               <div class="flex justify-between text-[10px] font-mono text-gray-400 mb-2 uppercase tracking-wider">
                 <span>Standard Deviation</span>
                 <span class="text-white">σ {{ ((result().estimatedIQ - 100) / 15) | number:'1.1-1' }}</span>
               </div>
               <div class="h-1 bg-gray-800 w-full overflow-hidden relative">
                 <div class="absolute left-1/2 h-full w-0.5 bg-gray-600"></div>
                 <div class="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      [style.width.%]="50 + ((result().estimatedIQ - 100) / 15 * 16)"></div>
               </div>
             </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button 
            (click)="download()"
            class="w-full md:w-auto bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-sm font-bold font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all min-w-[200px] shadow-lg shadow-white/10">
            <app-icon name="download" size="18"></app-icon>
            <span class="text-black font-bold">{{ uiConfig().downloadPdf }}</span>
          </button>
          
          <button 
            (click)="restart.emit()"
            class="w-full md:w-auto bg-gray-900 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-sm font-bold font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all min-w-[200px]">
            <app-icon name="rotate-ccw" size="18"></app-icon>
            <span class="text-gray-300 group-hover:text-white">{{ uiConfig().restart }}</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ResultComponent {
  pdfService = inject(PdfService);
  result = input.required<UserResult>();
  uiConfig = input.required<LanguageConfig['ui']>();
  restart = output<void>();

  download() {
    this.pdfService.generateCertificate(this.result());
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  calculateEfficiency(): number {
    const accuracy = (this.result().rawScore / this.result().totalQuestions) * 100;
    const speedFactor = Math.min(100, (300 / Math.max(this.result().durationSeconds, 60)) * 50);
    return Math.min(100, (accuracy * 0.7) + (speedFactor * 0.3));
  }
}