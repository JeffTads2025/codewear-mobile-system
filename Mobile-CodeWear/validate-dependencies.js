#!/usr/bin/env node
/**
 * Script de Validação - CodeWear Mobile Dependencies
 * Valida se todas as dependências necessárias foram instaladas corretamente
 */

const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const nodeModulesPath = path.join(projectRoot, 'node_modules');

console.log('\n' + '='.repeat(60));
console.log('  VALIDAÇÃO DE DEPENDÊNCIAS - CodeWear Mobile');
console.log('='.repeat(60) + '\n');

// Dependências esperadas (o que foi adicionado)
const requiredDeps = [
    {
        name: '@react-navigation/material-top-tabs',
        path: path.join(nodeModulesPath, '@react-navigation', 'material-top-tabs'),
        description: 'Navegação com abas Material Design'
    },
    {
        name: 'react-native-tab-view',
        path: path.join(nodeModulesPath, 'react-native-tab-view'),
        description: 'Componente base de abas'
    },
    {
        name: 'react-native-pager-view',
        path: path.join(nodeModulesPath, 'react-native-pager-view'),
        description: 'Suporte a swipe e paginação'
    }
];

// Verificar cada dependência
let allPresent = true;
let results = [];

requiredDeps.forEach(dep => {
    const exists = fs.existsSync(dep.path);
    const status = exists ? '✅ INSTALADO' : '❌ FALTANDO';

    results.push({
        name: dep.name,
        status: exists,
        description: dep.description
    });

    if (!exists) allPresent = false;

    console.log(`${status} ${dep.name}`);
    console.log(`   └─ ${dep.description}\n`);
});

// Verificar package.json
console.log('\n' + '='.repeat(60));
console.log('  VERIFICAÇÃO DO package.json');
console.log('='.repeat(60) + '\n');

try {
    const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
    );

    const depsToCheck = [
        '@react-navigation/material-top-tabs',
        'react-native-tab-view',
        'react-native-pager-view'
    ];

    depsToCheck.forEach(dep => {
        const inDependencies = packageJson.dependencies && packageJson.dependencies[dep];
        const version = inDependencies ? packageJson.dependencies[dep] : 'NÃO ENCONTRADO';
        const status = inDependencies ? '✅' : '❌';

        console.log(`${status} ${dep}`);
        console.log(`   └─ Versão: ${version}\n`);
    });
} catch (error) {
    console.error('❌ Erro ao ler package.json:', error.message);
    process.exit(1);
}

// Verificar importação de AdminTopTabs
console.log('\n' + '='.repeat(60));
console.log('  VERIFICAÇÃO DE IMPORTAÇÃO - AdminTopTabs.tsx');
console.log('='.repeat(60) + '\n');

const adminTopTabsPath = path.join(projectRoot, 'src', 'routes', 'AdminTopTabs.tsx');
if (fs.existsSync(adminTopTabsPath)) {
    console.log('✅ Arquivo AdminTopTabs.tsx encontrado');

    const content = fs.readFileSync(adminTopTabsPath, 'utf-8');

    const requiredImports = [
        "import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'",
        "import { Feather } from '@expo/vector-icons'",
    ];

    requiredImports.forEach(imp => {
        const hasImport = content.includes(imp);
        const status = hasImport ? '✅' : '❌';
        console.log(`${status} ${imp}`);
    });
} else {
    console.log('❌ Arquivo AdminTopTabs.tsx NÃO encontrado');
}

// Resumo Final
console.log('\n' + '='.repeat(60));
console.log('  RESUMO FINAL');
console.log('='.repeat(60) + '\n');

if (allPresent) {
    console.log('✅ SUCESSO! Todas as dependências estão instaladas.\n');
    console.log('Próximos passos:');
    console.log('  1. Execute: npm start (para Expo menu interativo)');
    console.log('  2. Ou: npm run android (para Android)');
    console.log('  3. Ou: npm run ios (para iOS)');
    console.log('  4. Ou: npm run web (para Web)\n');
    console.log('Não deve mais haver erro: UnableToResolveError\n');
    process.exit(0);
} else {
    console.log('❌ FALHA! Algumas dependências estão faltando.\n');
    console.log('Solução:');
    console.log('  1. Verifique o arquivo package.json');
    console.log('  2. Execute: npm install');
    console.log('  3. Se problemas persistirem: rm -rf node_modules && npm install\n');
    process.exit(1);
}
