Proyecto Final - Taimo
# TAIMO – Gestión de Tareas, Evaluaciones y Tiempo

Proyecto web desarrollado en HTML, CSS y JavaScript con Bootstrap 5, que permite a estudiantes y profesionales organizar tareas, evaluaciones y aplicar la técnica Pomodoro para mejorar su productividad.

---

## 🧱 Tecnologías utilizadas

- **HTML5**  
- **CSS3** + Bootstrap 5  
- **JavaScript**  
- Diseño responsive y modular

---

## 📁 Estructura del proyecto

```plaintext
proyecto_final/
├── index.html                 # Página de bienvenida al sitio
├── html/
│   ├── login.html             # Inicio de sesión
│   ├── regist.html            # Registro de usuario
│   ├── taimo.html             # Página principal luego de iniciar sesión
│   ├── tareas.html            # Gestión de tareas (crear, ordenar, listar)
│   └── eval.html              # Gestión de evaluaciones
├── css/
│   ├── estilo_global.css      # Estilos comunes
│   ├── estilo_index.css       # Estilos específicos del index
│   ├── estilo_login.css       # Estilos para login/registro
│   └── estilo_taimo.css       # Estilos para tareas y evaluaciones
├── js/
│   ├── script.js              # Lógica del Pomodoro
│   ├── script_login.js        # Validación del login
│   ├── script_regist.js       # Validación del registro
│   ├── script_tareas.js       # CRUD de tareas
│   └── script_eval.js         # CRUD de evaluaciones
├── imgs/                      # Íconos, logos y vectores
├── src/
│   ├── server.js              # Conexión a mongoDB Atlas
│   ├── models/
│       └── ModeloUsuario.js   # Modelo de datos para el usuario
└── README.md                  # Este archivo


## Pasos para arrancar desde cero

1. **Clona el repositorio**  
   ```bash
   git clone https://github.com/NaemiMJ/proyecto_final.git
   cd proyecto_final
   ```
2. **Instala las dependencias**  
   > Antes de esto, asegúrate de **no** tener `node_modules` en tu repo (si aparece, elimínalo). Y ademas contar con `Node.js` instalado
   ```bash
   npm install express mongoose 
   ```
3. **Arranca la API**  
   - En modo producción:
     ```bash
     cd src
     node server.js
     ```
4. **Visualizar la conexión a mongo**
   >Considerar instalar en VScode la extensión `MongoDB for VS Code` 
   -Agregar nueva conexión `Advanced Connection Settings`, y reemplazar el URL: 
   ```bash 
   'mongodb+srv://NaJoRB:Hola.1234@cluster0.tycxfqj.mongodb.net/proyecto_final?retryWrites=true&w=majority&appName=Cluster0'
   ```

   Integrantes: Montserrat Jara, Martín Escobar y Johans Rivera.