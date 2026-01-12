
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './src/app.component';
import { provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { 
  LucideAngularModule,
  Globe, 
  ChevronDown,
  X,
  ArrowRight,
  CreditCard,
  Bitcoin,
  ShieldCheck,
  Lock,
  Download,
  Share2,
  BrainCircuit,
  RotateCcw,
  Clock,
  ShieldAlert,
  CheckCircle
} from 'lucide-angular';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    importProvidersFrom(LucideAngularModule.pick({
      Globe, 
      ChevronDown,
      X,
      ArrowRight,
      CreditCard,
      Bitcoin,
      ShieldCheck,
      Lock,
      Download,
      Share2,
      BrainCircuit,
      RotateCcw,
      Clock,
      ShieldAlert,
      CheckCircle
    }))
  ]
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.