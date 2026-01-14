import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageConfig } from '../types';
import { IconComponent } from './ui/icon.component';

@Component({
  selector: 'app-paywall',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="max-w-md mx-auto p-6 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl mt-12 relative z-50">
      <div class="text-center mb-6">
        <div class="mx-auto w-16 h-16 bg-blue-900/20 text-blue-400 rounded-full flex items-center justify-center mb-4">
          <app-icon name="lock" size="32"></app-icon>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">
          {{ uiConfig().paywallTitle }}
        </h2>
        <p class="text-gray-400 text-sm leading-relaxed">
          {{ uiConfig().paywallDesc }}
        </p>
      </div>

      <div class="my-6 text-left text-sm text-gray-300 bg-gray-800/30 p-4 rounded-md border border-gray-700/50">
        <h4 class="font-bold text-white mb-3">{{ uiConfig().paywallFeaturesTitle }}</h4>
        <ul class="space-y-2">
          @for(feature of uiConfig().paywallFeatures; track feature) {
            <li class="flex items-start gap-2">
              <app-icon name="check-circle" size="16" class="text-green-500 mt-0.5 shrink-0"></app-icon>
              <span>{{ feature }}</span>
            </li>
          }
        </ul>
      </div>

      <div class="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <p class="text-center text-gray-400 text-xs mb-6">
          {{ uiConfig().paywallNote }}
        </p>
        
        <button 
          (click)="processPayment()"
          class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20">
          @if (processing()) {
            <span class="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          } @else {
             <span class="text-white">{{ uiConfig().payButton }}</span>
             <span class="opacity-80 font-normal text-blue-100"> - $0.99</span>
          }
        </button>
        <div class="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
          <app-icon name="shield-check" size="12"></app-icon>
          <span>SSL Secured via Payment Partner</span>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class PaywallComponent {
  uiConfig = input.required<LanguageConfig['ui']>();
  paid = output<void>();
  processing = signal(false);

  processPayment() {
    this.processing.set(true);
    setTimeout(() => {
      this.processing.set(false);
      this.paid.emit();
    }, 2000);
  }
}