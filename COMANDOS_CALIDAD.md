# Comandos de Calidad de Código

Este documento describe todos los comandos disponibles para ejecutar tests, linting, formateo y análisis de calidad con SonarQube.

## 📋 Tabla de Contenidos

- [Tests](#tests)
- [Linting](#linting)
- [Formateo de Código](#formateo-de-código)
- [SonarQube](#sonarqube)
- [Comandos Combinados](#comandos-combinados)
- [CI/CD](#cicd)

---

## 🧪 Tests

### Ejecutar tests una vez con cobertura
```bash
npm test
```
Este comando ejecuta todos los tests con Karma y genera un reporte de cobertura.

### Ejecutar tests en modo watch
```bash
npm run test:watch
```
Ejecuta los tests y se mantiene observando cambios en los archivos.

### Ejecutar tests con cobertura en modo headless
```bash
npm run test:coverage
```
Ejecuta tests en ChromeHeadless (útil para CI/CD) y genera reporte de cobertura.

### Ubicación de reportes
- **HTML**: `coverage/gestor-financiero/index.html`
- **LCOV** (para SonarQube): `coverage/gestor-financiero/lcov.info`
- **Consola**: Resumen en terminal después de ejecutar

---

## 🔍 Linting

### Ejecutar ESLint
```bash
npm run lint
```
Analiza el código en busca de errores y problemas de estilo.

### Ejecutar ESLint y corregir automáticamente
```bash
npm run lint:fix
```
Analiza el código y corrige automáticamente los problemas que puede resolver.

### Generar reporte JSON para SonarQube
```bash
npm run lint:report
```
Genera un archivo `eslint-report.json` en la raíz del proyecto.

### Reglas configuradas
- Plugin Angular ESLint
- TypeScript ESLint
- Prettier (para formateo)
- Reglas de accesibilidad en templates HTML

---

## 🎨 Formateo de Código

### Formatear código automáticamente
```bash
npm run format
```
Formatea todos los archivos TypeScript, HTML, SCSS y JSON según la configuración de Prettier.

### Verificar formato sin modificar
```bash
npm run format:check
```
Verifica si el código cumple con el formato de Prettier sin hacer cambios.

### Configuración de Prettier
Archivo: `.prettierrc`
```json
{
  "semi": true,
  "trailingComma": "none",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

---

## 📊 SonarQube

### Prerequisitos

#### Opción 1: SonarQube Local
1. Instalar Docker Desktop
2. Ejecutar SonarQube:
```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
```
3. Acceder a http://localhost:9000
4. Login inicial: admin/admin
5. Crear token de autenticación

#### Opción 2: SonarCloud (Recomendado)
1. Ir a https://sonarcloud.io
2. Autenticarse con GitHub/GitLab/Bitbucket
3. Crear organización y proyecto
4. Generar token de autenticación
5. Actualizar `sonar-project.properties`:
```properties
sonar.host.url=https://sonarcloud.io
sonar.organization=tu-organizacion
sonar.token=${SONAR_TOKEN}
```

### Ejecutar análisis de SonarQube
```bash
npm run sonar
```

**Nota**: Asegúrate de tener el token configurado como variable de entorno:
```bash
# Windows (PowerShell)
$env:SONAR_TOKEN="tu-token-aqui"

# Windows (CMD)
set SONAR_TOKEN=tu-token-aqui

# Linux/Mac
export SONAR_TOKEN=tu-token-aqui
```

### Configuración de SonarQube
Archivo: `sonar-project.properties`

```properties
sonar.projectKey=gestor-financiero
sonar.projectName=Gestor Financiero
sonar.projectVersion=1.0.0

sonar.sources=src
sonar.exclusions=**/node_modules/**,**/*.spec.ts,**/test/**,**/dist/**,**/coverage/**

sonar.tests=src
sonar.test.inclusions=**/*.spec.ts

sonar.typescript.lcov.reportPaths=coverage/gestor-financiero/lcov.info
sonar.eslint.reportPaths=eslint-report.json

sonar.sourceEncoding=UTF-8
sonar.host.url=http://localhost:9000
```

---

## 🚀 Comandos Combinados

### Análisis de calidad completo (con SonarQube)
```bash
npm run quality
```
Ejecuta en orden:
1. ESLint (linting)
2. Tests con cobertura
3. Análisis de SonarQube

**Duración estimada**: 2-5 minutos

### Análisis de calidad rápido (sin SonarQube)
```bash
npm run quality:fast
```
Ejecuta en orden:
1. ESLint (linting)
2. Tests con cobertura

**Duración estimada**: 1-3 minutos

**Recomendación**: Usa `quality:fast` durante desarrollo y `quality` antes de hacer commits o en CI/CD.

---

## 🔄 CI/CD

### Pipeline recomendado

#### GitHub Actions
```yaml
name: Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd gestor-financiero
          npm ci

      - name: Run linting
        run: |
          cd gestor-financiero
          npm run lint

      - name: Run tests with coverage
        run: |
          cd gestor-financiero
          npm run test:coverage

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          projectBaseDir: gestor-financiero
```

#### GitLab CI
```yaml
stages:
  - quality

quality:
  stage: quality
  image: node:20
  script:
    - cd gestor-financiero
    - npm ci
    - npm run quality
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: gestor-financiero/coverage/cobertura-coverage.xml
```

---

## 📈 Métricas de Calidad

### Objetivos recomendados

| Métrica | Objetivo Mínimo | Objetivo Ideal |
|---------|----------------|----------------|
| Cobertura de Tests | 70% | 80%+ |
| Errores ESLint | 0 | 0 |
| Warnings ESLint | < 10 | 0 |
| Code Smells (SonarQube) | < 20 | 0 |
| Deuda Técnica (SonarQube) | < 1 día | < 1 hora |
| Duplicación de Código | < 5% | < 3% |
| Vulnerabilidades | 0 | 0 |

---

## 🛠️ Solución de Problemas

### Error: "Cannot find module 'karma'"
```bash
cd gestor-financiero
npm install
```

### Error: "Chrome not found"
Instalar Chrome o usar ChromeHeadless:
```bash
npm run test:coverage
```

### Error: "SONAR_TOKEN not set"
Configurar variable de entorno:
```bash
# Windows PowerShell
$env:SONAR_TOKEN="tu-token"

# Linux/Mac
export SONAR_TOKEN=tu-token
```

### Tests fallan en CI/CD
Asegúrate de usar el script con ChromeHeadless:
```bash
npm run test:coverage
```

### ESLint tarda mucho
Agregar archivos a `.eslintignore`:
```
node_modules
dist
coverage
*.spec.ts
```

---

## 📚 Referencias

- [Angular Testing Guide](https://angular.dev/guide/testing)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [SonarQube Documentation](https://docs.sonarqube.org/latest/)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Karma Configuration](https://karma-runner.github.io/latest/config/configuration-file.html)

---

## 🎯 Flujo de Trabajo Recomendado

### Durante desarrollo
1. Ejecutar tests en watch mode: `npm run test:watch`
2. Formatear código antes de commit: `npm run format`
3. Verificar linting: `npm run lint:fix`

### Antes de hacer commit
```bash
npm run quality:fast
```

### Antes de hacer merge/deploy
```bash
npm run quality
```

### En CI/CD (automático)
```bash
npm run quality
```

---

## ✅ Checklist de Calidad

Antes de hacer commit, asegúrate de:

- [ ] Todos los tests pasan: `npm test`
- [ ] Sin errores de ESLint: `npm run lint`
- [ ] Código formateado: `npm run format`
- [ ] Cobertura mínima 70%: Revisar reporte en `coverage/`
- [ ] Sin vulnerabilidades críticas: `npm audit`
- [ ] Build exitoso: `npm run build`

---

**Última actualización**: 2025-11-01
**Versión**: 1.0.0
