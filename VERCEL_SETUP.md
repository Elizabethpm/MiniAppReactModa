# 🚀 Configuración de Vercel - Frontend

## Información Importante

- **URL del Backend (Railway)**: `https://miniappreactmoda-production.up.railway.app`
- **Repositorio**: `Elizabethpm/miniappreactmoda`
- **Rama**: `master`
- **Carpeta del Frontend**: `client`

---

## 📋 Pasos en Vercel

### **1️⃣ Crear Nuevo Proyecto**

1. Ve a https://vercel.com
2. Haz clic en **"Add New..."** → **"Project"**
3. Selecciona el repositorio: **miniappreactmoda**
4. Haz clic en **"Import"**

### **2️⃣ Configurar Proyecto

En la pantalla de **Project Settings**:

#### **Framework**
- Seleccionar: **Vite**

#### **Root Directory**
- Cambiar a: **`client`**

#### **Build Command**
- Dejar como: `npm run build` (Vercel detecta automáticamente)

#### **Output Directory**
- Dejar como: `dist` (automático para Vite)

### **3️⃣ Variables de Entorno

En **Environment Variables**, agregar:

| Key | Value |
|-----|-------|
| **VITE_API_URL** | `https://miniappreactmoda-production.up.railway.app` |

Luego hacer clic en **"Add"**

### **4️⃣ Deploy

- Haz clic en **"Deploy"**
- Vercel comenzará a construir
- Espera **3-5 minutos** a que termine

---

## ✅ Verificar que Funciona

1. Cuando termine el deploy, verás una URL como:
   ```
   https://miniappreactmoda.vercel.app
   ```

2. Abre esa URL en el navegador

3. Deberías ver la aplicación cargando

4. Intenta hacer login → debería conectar con el backend en Railway ✅

---

## 🔗 URLs Finales

- **Frontend**: `https://miniappreactmoda.vercel.app`
- **Backend API**: `https://miniappreactmoda-production.up.railway.app`

---

## ⚠️ Errores Comunes

### Error: "Cannot reach API"
- Verificar que `VITE_API_URL` esté configurado correctamente
- Verificar que el backend en Railway esté "Online"
- Verificar que CORS esté bien configurado

### Error: "Build failed"
- Verificar que Root Directory sea `client`
- Ejecutar localmente: `cd client && npm run build` para testear

### Página blanca
- Abrir DevTools (F12) → Console
- Ver si hay errores de conexión al API

---

## 🎉 Próximos Pasos

Una vez que Vercel esté desplegado y funcionando:

1. ✅ Backend (Railway) corriendo
2. ✅ Frontend (Vercel) corriendo
3. Crear admin en la DB (opcional)
4. Cargar datos de Elizabeth

Listo para usar en producción. 🚀
