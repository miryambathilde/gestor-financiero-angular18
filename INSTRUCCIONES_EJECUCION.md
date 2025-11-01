# 🚀 Instrucciones de Ejecución

## Opción 1: Ejecutar Todo Automáticamente (Recomendado)

Abre una terminal en la carpeta `gestor-financiero` y ejecuta:

```bash
npm run dev
```

Esto iniciará:
- API REST en http://localhost:3000
- Aplicación Angular en http://localhost:4200

## Opción 2: Ejecutar Manualmente (2 Terminales)

### Terminal 1 - API
```bash
cd gestor-financiero
npm run api
```

### Terminal 2 - Aplicación
```bash
cd gestor-financiero
npm start
```

Luego abre tu navegador en: **http://localhost:4200**

---

## 📊 Verificar Gráficas del Dashboard

Si las gráficas no aparecen:

1. Abre las **DevTools del navegador** (F12)
2. Ve a la pestaña **Console**
3. Busca mensajes de log que empiezan con:
   - "No hay resumen disponible"
   - "Referencias a canvas no disponibles"
   - "Creando gráficos con datos:"
   - "Datos para gráfico de distribución:"
   - "Datos para gráfico de balance:"

4. Verifica que la API esté respondiendo:
   - Abre http://localhost:3000/productos en el navegador
   - Deberías ver un JSON con 10 productos

5. Si ves "Referencias a canvas no disponibles":
   - Refresca la página (F5)
   - Los canvas ahora deberían estar disponibles

---

## 🎯 Rutas Disponibles

- **/** → Redirige al Dashboard
- **/dashboard** → Dashboard con gráficos y resumen
- **/productos** → Listado de productos con filtros
- **/productos/:id** → Detalle de un producto específico
- **/contratacion** → Formulario para contratar productos

---

## 🐛 Troubleshooting

### La API no responde
```bash
# Verificar si el puerto 3000 está ocupado
netstat -ano | findstr :3000

# Si está ocupado, matar el proceso o cambiar el puerto en package.json
```

### Problemas de compilación
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Las gráficas no se ven
1. Verifica que Chart.js está instalado:
   ```bash
   npm list chart.js
   ```

2. Verifica en la consola del navegador si hay errores de Chart.js

3. Intenta refrescar la página después de que carguen los datos

---

## ✅ Todo Funcionando

Deberías ver:
- ✅ Navbar con 3 opciones (Dashboard, Productos, Contratar)
- ✅ Dashboard con 3 tarjetas de resumen
- ✅ 2 gráficos (dona y barras)
- ✅ Tabla de últimos movimientos
- ✅ Lista de vencimientos próximos (si hay)

---

**Nota:** Los gráficos se renderizan usando Chart.js y pueden tardar 1-2 segundos en aparecer después de cargar los datos.
