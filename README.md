# Desarrollo de prototipo para medición de variables ambientales de sistemas agroindustriales y con visualización en dispositivos remotos
Este proyecto consiste en el desarrollo de un prototipo IoT para la medición de variables ambientales en sistemas agroindustriales, orientado a apoyar prácticas de agricultura de precisión y mejorar la toma de decisiones en entornos rurales con conectividad limitada.
El sistema está diseñado bajo una arquitectura híbrida que permite operar en dos modos:

Modo sin conexión: almacenamiento local de datos en un dispositivo móvil cuando no hay acceso a Internet.

Modo en línea: transmisión y registro de la información en una base de datos en la nube cuando la conectividad está disponible.

Además, el sistema incluye un mecanismo de gestión de memoria que alerta al usuario cuando el almacenamiento local alcanza el 80% de su capacidad, evitando la pérdida de datos críticos.

Objetivos del Proyecto

Diseñar e implementar un prototipo IoT basado en sensores (Raspberry Pi, Wasp Mote u otros) para el monitoreo ambiental.

Desarrollar un sistema de almacenamiento híbrido (local y en la nube).

Crear una interfaz web/móvil que permita la visualización remota de las variables ambientales registradas.

Validar el desempeño del sistema en un entorno agroindustrial real.

Tecnologías Utilizadas

Hardware: Raspberry Pi, sensores ambientales (temperatura, humedad, radiación solar, etc.).

Lenguajes: Python, C/C++ (para firmware).

Base de datos: PostgreSQL o MySQL en la nube.

Comunicación IoT: MQTT/HTTP.

Frontend: Aplicación web/móvil para visualización de datos.
