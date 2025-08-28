#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patrones comunes de errores JSX que hemos identificado
const fixes = [
  {
    // </InteractiveSection> incorrecto después de un div
    pattern: /(\s*)<\/InteractiveSection>/g,
    replacement: '$1</div>'
  },
  {
    // Cerrar divs sin cierre que tienen contenido JSX
    pattern: /(<div[^>]*>.*?{[^}]*})\s*<\/InteractiveSection>/gs,
    replacement: '$1</div>'
  }
];

// Encontrar todos los archivos de lecciones
const lessonFiles = glob.sync('src/lessons/Lesson*.tsx');

console.log(`Encontrados ${lessonFiles.length} archivos de lecciones para verificar...`);

let totalFixed = 0;

lessonFiles.forEach(file => {
  console.log(`Procesando ${file}...`);
  
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let fileFixed = 0;

  // Aplicar fixes
  fixes.forEach((fix, index) => {
    const matches = content.match(fix.pattern);
    if (matches) {
      content = content.replace(fix.pattern, fix.replacement);
      fileFixed += matches.length;
      console.log(`  - Aplicado fix ${index + 1}: ${matches.length} reemplazos`);
    }
  });

  // Guardar si se hicieron cambios
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`  ✅ ${file}: ${fileFixed} correcciones aplicadas`);
    totalFixed += fileFixed;
  } else {
    console.log(`  ⚪ ${file}: sin cambios necesarios`);
  }
});

console.log(`\n🎉 Total de correcciones aplicadas: ${totalFixed}`);