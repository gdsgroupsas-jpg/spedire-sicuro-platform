#!/usr/bin/env node

/**
 * Script per visualizzare il report FSM in modo strutturato
 * Usage: node view-fsm-report.js [sezione]
 * 
 * Esempi:
 *   node view-fsm-report.js                    # Mostra tutte le sezioni
 *   node view-fsm-report.js executive_summary  # Mostra solo executive summary
 *   node view-fsm-report.js architettura_fsm   # Mostra architettura FSM
 */

const fs = require('fs');
const path = require('path');

// Colori ANSI per terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

function printHeader(text) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(80)}`);
  console.log(`${text.toUpperCase()}`);
  console.log(`${'='.repeat(80)}${colors.reset}\n`);
}

function printSection(title, data, indent = 0) {
  const prefix = '  '.repeat(indent);
  
  if (typeof data === 'object' && !Array.isArray(data)) {
    console.log(`${prefix}${colors.bright}${colors.yellow}${title}:${colors.reset}`);
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object') {
        printSection(key, value, indent + 1);
      } else {
        console.log(`${prefix}  ${colors.green}${key}:${colors.reset} ${value}`);
      }
    });
  } else if (Array.isArray(data)) {
    console.log(`${prefix}${colors.bright}${colors.yellow}${title}:${colors.reset}`);
    data.forEach((item, index) => {
      if (typeof item === 'object') {
        console.log(`${prefix}  ${colors.magenta}[${index}]${colors.reset}`);
        printSection('', item, indent + 2);
      } else {
        console.log(`${prefix}  - ${item}`);
      }
    });
  } else {
    console.log(`${prefix}${colors.green}${title}:${colors.reset} ${data}`);
  }
}

function printQuickStats(report) {
  printHeader('📊 Quick Stats');
  
  console.log(`${colors.bright}Data:${colors.reset} ${report.report_metadata.data}`);
  console.log(`${colors.bright}Stato:${colors.reset} ${colors.green}${report.report_metadata.stato}${colors.reset}`);
  console.log(`${colors.bright}Priorità:${colors.reset} ${colors.red}${report.report_metadata.priorita}${colors.reset}`);
  
  console.log(`\n${colors.bright}Risultati:${colors.reset}`);
  console.log(`  ✅ File Creati: ${report.executive_summary.metriche_successo.file_creati}`);
  console.log(`  ✅ Righe Codice: ${report.executive_summary.metriche_successo.righe_codice}`);
  console.log(`  ✅ Errori Linting: ${report.executive_summary.metriche_successo.errori_linting}`);
  console.log(`  ✅ Type Coverage: ${report.executive_summary.metriche_successo.code_coverage}`);
  
  console.log(`\n${colors.bright}FSM:${colors.reset}`);
  console.log(`  📍 Stati Definiti: ${report.architettura_fsm.stati_definiti.totale}`);
  console.log(`  ⚡ Eventi Definiti: ${report.architettura_fsm.eventi_definiti.totale}`);
  console.log(`  ✅ Transizioni Legali: ${report.architettura_fsm.matrice_transizioni.totale_transizioni_legali}`);
  console.log(`  ❌ Transizioni Bloccate: ${report.architettura_fsm.matrice_transizioni.totale_transizioni_bloccate}`);
}

function printFilesSummary(report) {
  printHeader('📁 File Implementati');
  
  report.file_implementati.dettaglio.forEach(file => {
    console.log(`\n${colors.bright}${colors.cyan}${file.path}${colors.reset}`);
    console.log(`  Tipo: ${file.tipo}`);
    console.log(`  Righe: ${file.righe_codice}`);
    console.log(`  Stato: ${colors.green}${file.stato}${colors.reset}`);
    console.log(`  Descrizione: ${file.descrizione}`);
  });
}

function printNextSteps(report) {
  printHeader('🎯 Next Steps');
  
  console.log(`${colors.bright}${colors.red}PRIORITÀ ALTA:${colors.reset}`);
  report.next_steps.priorita_alta.forEach((task, i) => {
    console.log(`\n  ${i + 1}. ${colors.bright}${task.task}${colors.reset}`);
    console.log(`     ${task.dettaglio}`);
    console.log(`     Effort: ${task.stima_effort}`);
  });
  
  console.log(`\n${colors.bright}${colors.yellow}PRIORITÀ MEDIA:${colors.reset}`);
  report.next_steps.priorita_media.forEach((task, i) => {
    console.log(`  ${i + 1}. ${task.task} (${task.stima_effort})`);
  });
}

// Main execution
try {
  const reportPath = path.join(__dirname, 'FSM-IMPLEMENTATION-REPORT-2025-11-24.json');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  const section = process.argv[2];
  
  if (!section) {
    // Mostra quick overview
    printQuickStats(report);
    printFilesSummary(report);
    printNextSteps(report);
    
    console.log(`\n${colors.bright}${colors.cyan}Per vedere una sezione specifica:${colors.reset}`);
    console.log(`  node view-fsm-report.js <sezione>`);
    console.log(`\n${colors.bright}Sezioni disponibili:${colors.reset}`);
    Object.keys(report).forEach(key => {
      console.log(`  - ${key}`);
    });
  } else if (report[section]) {
    printHeader(section);
    printSection(section, report[section]);
  } else {
    console.error(`${colors.red}Sezione "${section}" non trovata!${colors.reset}`);
    console.log(`\nSezioni disponibili:`);
    Object.keys(report).forEach(key => {
      console.log(`  - ${key}`);
    });
    process.exit(1);
  }
  
  console.log('\n');
} catch (error) {
  console.error(`${colors.red}Errore:${colors.reset}`, error.message);
  process.exit(1);
}
