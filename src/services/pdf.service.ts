import { Injectable } from '@angular/core';
import { UserResult } from '../types';

declare const jspdf: any;

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  generateCertificate(result: UserResult, name: string = 'Candidate') {
    if (typeof jspdf === 'undefined') {
      console.error('jsPDF library not loaded');
      alert('PDF System initializing... please try again in a moment.');
      return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Background
    doc.setFillColor(3, 7, 18); // Dark background
    doc.rect(0, 0, 297, 210, 'F');

    // Border
    doc.setDrawColor(59, 130, 246); // Blue
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 277, 190);

    // Watermark
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(100);
    doc.text("VALIDATED", 148.5, 120, { align: "center", angle: 45 });

    // Header
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("NEUROMETRIC", 20, 30);
    
    doc.setFontSize(10);
    doc.setFont("courier", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("CLINICAL COGNITIVE ASSESSMENT", 20, 36);

    // Right Header ID
    doc.setFontSize(8);
    doc.text(`REF: ${Math.random().toString(36).substring(7).toUpperCase()}`, 270, 30, { align: "right" });
    doc.text(`DATE: ${result.generatedDate}`, 270, 34, { align: "right" });

    // Main Score Circle
    doc.setDrawColor(59, 130, 246);
    doc.circle(148.5, 90, 35);
    
    doc.setFontSize(70);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`${result.estimatedIQ}`, 148.5, 100, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(59, 130, 246);
    doc.text("FULL SCALE IQ", 148.5, 115, { align: "center" });

    // Data Grid
    const startY = 150;
    
    doc.setDrawColor(55, 65, 81);
    doc.line(20, 140, 277, 140);

    // Column 1
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text("RAW ACCURACY", 40, startY);
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`${result.rawScore}/${result.totalQuestions}`, 40, startY + 8);

    // Column 2
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text("PERCENTILE RANK", 110, startY);
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`${result.percentile}th`, 110, startY + 8);

    // Column 3
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text("TEST DURATION", 180, startY);
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`${result.durationSeconds}s`, 180, startY + 8);

    // Column 4
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text("VALIDITY INDEX", 250, startY);
    doc.setFontSize(14);
    doc.setTextColor(result.validity.includes('Low') ? 239 : 34, result.validity.includes('Low') ? 68 : 197, result.validity.includes('Low') ? 68 : 94); // Red or Green
    doc.text(`${result.validity === 'High' ? 'VERIFIED' : 'FLAGGED'}`, 250, startY + 8, { align: "center" });

    // Analysis
    doc.setFontSize(10);
    doc.setTextColor(209, 213, 219);
    doc.setFont("courier", "normal");
    const splitText = doc.splitTextToSize(`CLINICAL NOTE: ${result.summary}`, 180);
    doc.text(splitText, 148.5, 180, { align: "center" });

    doc.save('neurometric-official-report.pdf');
  }
}