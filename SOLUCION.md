# Solución — Mini Inbox

## Contexto: el repositorio no llegó

El enunciado pide clonar el repositorio de Mini Inbox, pero el enlace no venía ni en el PDF
ni en el correo. Lo pedí por correo y, como la respuesta no llegó antes de la entrega, tomé
una decisión: **reconstruir el punto de partida a partir del enunciado** y resolver la prueba
sobre esa reconstrucción.

- `main` (primer commit) es el punto de partida reconstruido: el stack, la estructura de
  carpetas y los endpoints que describe el enunciado, más los tres errores reportados,
  incluido un test que falla.
- `solucion` tiene un commit por error y dos para la funcionalidad.

Como el punto de partida lo escribí yo, los errores están **modelados a partir de los
síntomas** del enunciado. No puedo afirmar que la causa raíz en el repositorio original sea
exactamente la misma. Lo que sí se puede llevar tal cual es el método: reproducir, formular
una hipótesis, comprobarla y corregir donde nace el problema. En la sección
[Cómo buscaría la causa raíz en el repositorio original](#cómo-buscaría-la-causa-raíz-en-el-repositorio-original)
detallo qué hipótesis revisaría y cómo las distinguiría. Si me comparten el repositorio,
aplico la solución allí.

## Errores

### Error 1 — "La bandeja está desordenada"

- **Síntoma:** arriba aparecían conversaciones de hace semanas y una del año pasado, por
  encima de las de hoy.
- **Cómo lo encontré:**
  - `bun run test` mostró el test de `sort.ts` fallando con `c5` (30/10/2026) y `c2`
    (28/12/2025) de primeros.
  - En `sort.ts` el orden usaba `localeCompare` sobre fechas `"dd/mm/yyyy HH:mm"`, es decir,
    las comparaba como texto. Así gana el día del mes: `"30/10/2026" > "28/12/2025" > "24/11/2026"`.
  - Antes de corregir probé en Bun qué hace `new Date()` con ese formato:
    - `"05/11/2026 18:30"` lo lee como **11 de mayo** (mes primero).
    - `"24/11/2026 10:00"` da `Invalid Date`.
    - El resultado cambia según la zona horaria de la máquina: 5 horas de diferencia entre
      `America/Bogota` y `UTC`.
    - `new Date("2026-02-31T10:00:00-05:00")` no falla: devuelve el 3 de marzo, tanto en
      Node como en Bun.
- **Causa raíz:** el formato del proveedor de WhatsApp circulaba por todo el sistema (se
  guardaba, se ordenaba y se mostraba así). Ordenar era solo el primer lugar donde se notaba.
- **Cómo lo corregí y por qué así:**
  - **Conversión en la frontera:** `parseProviderDate` convierte el formato del proveedor
    una sola vez, donde los datos entran a la API, y a partir de ahí todo usa ISO 8601 en UTC.
  - **Contrato:** el esquema compartido usa `z.iso.datetime()`, así que la web y la API
    validan lo mismo.
  - **Orden:** compara instantes (`Date.parse(b) - Date.parse(a)`).
  - **Visualización:** la web formatea las fechas en `America/Bogota`.
  - **Por qué el parseo es manual:** por lo que mostré arriba, `new Date()` no es confiable
    para este formato. El parser usa la hora de Colombia (UTC−5, sin horario de verano) y
    rechaza fechas que no existen en vez de correrlas.
  - **Alternativa descartada:** parsear dentro del comparador de `sort.ts`. Arregla el
    síntoma, pero deja el formato ambiguo vivo para el próximo que use la fecha.
  - **Tests:** casos de día primero, zona horaria, cambio de año y fechas imposibles.

### Error 2 — "Respondo y la bandeja no se actualiza"

- **Síntoma:** al responder, el mensaje aparecía en el chat, pero la lista seguía mostrando
  el mensaje anterior hasta recargar.
- **Cómo lo encontré:**
  - La pista clave es "se arregla al recargar": si recargar lo arregla, el servidor tiene el
    dato correcto y el problema está en la copia en caché del navegador.
  - Lo confirmé con un test de la API: después de `POST /messages`, `GET /api/conversations`
    ya trae el último mensaje y la conversación de primera.
  - En `useSendMessage`, el `onSuccess` solo invalidaba la `queryKey` de los mensajes de esa
    conversación.
- **Causa raíz:** el envío invalidaba la caché equivocada. Enviar un mensaje cambia también
  el último mensaje, la fecha y la posición de la conversación en la bandeja, pero la lista
  nunca se marcaba como desactualizada.
- **Cómo lo corregí y por qué así:**
  - Se invalida el prefijo `["conversations"]`, que cubre la lista (con cualquier filtro), el
    detalle y los mensajes. Las claves ya estaban organizadas en jerarquía, así que basta una
    línea.
  - **Alternativas descartadas:**
    - `setQueryData`, editando la caché a mano: obliga a duplicar en el cliente lógica del
      servidor (orden, último mensaje) y se puede desincronizar.
    - Actualización optimista: mejor experiencia, pero más compleja (requiere manejar el
      caso en que falle). El costo de invalidar es una petición GET extra, que aquí es
      despreciable.
  - **Test:** extraje la lógica a `invalidateAfterSendMessage` para probarla con un
    `QueryClient` real, sin renderizar componentes. Comprobé que el test **falla** con la
    invalidación anterior y pasa con la nueva.

### Error 3 — "No me deja crear conversaciones"

- **Síntoma:** `+57 300 123 4567` se rechazaba como número inválido.
- **Cómo lo encontré:** `POST /api/conversations` con ese número devolvía 400. El esquema
  exigía `/^\+\d{10,15}$/` sobre lo que escribe el agente, y esa regex no admite espacios.
- **Causa raíz:** un solo esquema mezclaba _cómo escribe el número una persona_ con _cómo se
  guarda_.
- **Cómo lo corregí y por qué así:**
  - Ahora hay dos esquemas:
    - `PhoneInputSchema` quita espacios, guiones, puntos y paréntesis y luego exige E.164 con
      `z.e164()`, que es el formato que usa WhatsApp.
    - `PhoneSchema` describe el número ya guardado.
  - **Por qué normalizar y no solo aflojar la regex:** así el mismo número no queda guardado
    en formatos distintos (duplicados, búsquedas que fallan).
  - **Tipos:** como el esquema transforma, el tipo de entrada y el de salida difieren.
    Exporté `CreateConversationInput` (lo que manda la web) y `CreateConversationBody` (lo
    que recibe la API ya validado).
  - **Decisión:** un número sin indicativo (`300 123 4567`) se sigue rechazando, porque no
    se puede saber de qué país es. El mensaje de error dice cómo escribirlo.

## Cómo buscaría la causa raíz en el repositorio original

En la reconstrucción yo elegí la causa de cada error, así que ahí el diagnóstico es en parte
circular. En el repositorio real seguiría estos pasos:

1. **Reproducir el síntoma** con un test o una petición antes de tocar código.
2. **Recorrer el dato hacia atrás** desde donde se ve mal: componente → hook → `client.ts` →
   ruta → store → seed o webhook. Me detengo en el primer punto donde el dato ya llega dañado.
3. **Distinguir entre hipótesis con evidencia**, no por intuición (tablas de abajo).
4. **Preguntar "¿por qué?" hasta llegar a donde nace el problema** y corregir ahí, no donde se
   nota.
5. **Comprobar que el test falla** con el código original y pasa con la corrección.

### Error 1 — bandeja desordenada

| Hipótesis                                | Qué la delata                                                                                                                | Cómo la compruebo                                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Fechas comparadas como texto             | El orden lo decide el día del mes ("30/10" y "28/12/2025" quedan encima de "24/11")                                          | Leer el comparador de `sort.ts` y el tipo de `lastMessageAt` en `packages/types`                        |
| `new Date()` interpreta mal `dd/mm/yyyy` | Con día ≤ 12 se invierten mes y día; con día > 12 sale `Invalid Date` y el orden se vuelve errático (`NaN` en el comparador) | Probar fechas del seed con `bun -e "new Date('24/11/2026 10:00')"` y buscar `new Date(` y `Date.parse(` |
| Zona horaria                             | Conversaciones del mismo día cruzadas por unas 5 horas, y el resultado cambia según la máquina                               | Correr el test con `TZ=UTC` y con `TZ=America/Bogota`                                                   |
| El comparador devuelve un booleano       | El orden es inconsistente aunque las fechas estén bien                                                                       | Revisar que la función de `sort` devuelva un número                                                     |

### Error 2 — la bandeja no se actualiza al responder

Que recargar lo arregle descarta al backend: el servidor ya tiene el dato correcto. Lo confirmo
mirando la respuesta de `GET /api/conversations` justo después de enviar (pestaña Network).

| Hipótesis                                                                                                         | Cómo la compruebo                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| El `onSuccess` del envío invalida solo los mensajes                                                               | Leer el `useMutation` de envío en `hooks/`                                                                                           |
| Las claves no comparten prefijo (`["conversations"]` y `["messages", id]`), así que invalidar una no toca la otra | Listar las `queryKey` de `hooks/` y ver cuáles quedan desactualizadas al enviar (React Query Devtools o `queryClient.getQueryState`) |
| `staleTime: Infinity` u otra opción que impide volver a pedir los datos                                           | Revisar la configuración del `QueryClient` en `main.tsx`                                                                             |
| Se edita la caché a mano (`setQueryData`) solo para los mensajes                                                  | Buscar `setQueryData`                                                                                                                |

### Error 3 — no acepta "+57 300 123 4567"

| Hipótesis                                   | Cómo la compruebo                                                                            |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Regex sin espacios en el esquema compartido | Enviar el número directo a la API con `curl`: si responde 400, el rechazo está en el esquema |
| Validación solo en el formulario de la web  | Si la API lo acepta por `curl` y la web no, el problema está en el componente                |
| No se normaliza antes de validar            | Leer el esquema y ver si hay un `transform` o un `preprocess` antes de la regex              |

## Nueva funcionalidad

- **Qué hice:**
  - **Contrato:** `status: "open" | "resolved"` en la conversación. Las conversaciones
    nuevas empiezan abiertas.
  - **API:** `PATCH /api/conversations/:id` con `{ status }`, validado con un objeto
    estricto de Zod. Responde 400 si el estado no existe o sobra un campo, y 404 si la
    conversación no existe.
  - **Filtro:** `GET /api/conversations?status=open|resolved|all`, validado con Zod.
  - **Web:** pestañas Abiertas / Resueltas / Todas, y en el detalle el estado y un botón
    "Marcar como resuelta" / "Reabrir".
  - **Persistencia del filtro:** vive en la URL (`?status=`), así que sobrevive a la recarga.
  - **Tests:** de la API (estado inicial, resolver/reabrir, validaciones, 404, filtro y
    orden) y de la lectura del filtro desde la URL.

- **Decisiones que tomé y alternativas que descarté (y por qué):**
  - **`status` como enum y no `resolved: boolean`:** el estado se puede ampliar (por ejemplo
    "pendiente") sin cambiar el tipo del campo, y en el código se lee mejor.
  - **`PATCH` y no `POST /:id/resolve` + `POST /:id/reopen`:** es una actualización parcial
    de un recurso, con un solo endpoint. Los endpoints de acción tendrían sentido si
    resolver disparara efectos (por ejemplo, avisarle al estudiante).
  - **Cuerpo estricto:** con `z.strictObject`, un campo de más es un error y no se ignora en
    silencio. Así nadie cree que puede editar otros campos por esta vía.
  - **Filtrar en el servidor y no en el cliente:** una bandeja real tiene miles de
    conversaciones y necesitará paginación. El filtro va en la `queryKey`, así que cada
    pestaña tiene su caché, y la invalidación por prefijo del error 2 las cubre todas.
  - **Sin `?status` la API devuelve todas:** así no rompe a quien ya consume el endpoint.
    La **web** arranca en "Abiertas" porque la historia de usuario es "enfocarme en lo que
    falta por atender".
  - **Filtro en la URL y no en `localStorage`:**
    - Sobrevive a la recarga y se puede compartir.
    - `localStorage` lo arrastraría entre pestañas y sesiones sin que se vea.
    - Uso `replaceState`, no `pushState`: cambiar de filtro no debería llenar el historial
      de "atrás".
    - No agregué una librería de rutas para un solo parámetro.
  - **Filtro inválido en la URL (`?status=foo`):** se valida con el mismo esquema de Zod que
    usa la API y se cae a "Abiertas" en vez de romper la página.
  - **Ambigüedades del enunciado y cómo las resolví:**
    - **Responder una conversación resuelta no la reabre.** En un sistema real, lo que
      debería reabrirla es un mensaje _entrante_ del estudiante, pero este proyecto no tiene
      endpoint de entrada.
    - **Si estás en "Abiertas" y resuelves una conversación,** sale de la lista, pero el
      detalle sigue abierto para que no desaparezca de golpe lo que estabas mirando.

- **Qué haría diferente con más tiempo:**
  - Reabrir automáticamente con un mensaje entrante del estudiante.
  - Guardar `resolvedAt` y `resolvedBy` para métricas y auditoría.
  - Actualización optimista al cambiar el estado.
  - Contador de conversaciones por pestaña.
  - Tests de componentes con Testing Library y un test end-to-end (Playwright) del flujo
    completo.
  - Paginación de la bandeja.

## Documentación que consulté

- TanStack Query — Invalidations from Mutations: https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations
- TanStack Query — Query Invalidation: https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation
- TanStack Query — Query Keys: https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
- MDN — `Date.parse()` (los formatos no ISO dependen de la implementación): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
- MDN — `Array.prototype.sort()`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
- MDN — `History.replaceState()`: https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
- Zod — API (`z.iso.datetime()`, `z.e164()`, `.transform()`, `.pipe()`, `z.strictObject()`): https://zod.dev/api
- Fastify — Testing con `inject`: https://fastify.dev/docs/latest/Guides/Testing/
- Fastify — `setErrorHandler`: https://fastify.dev/docs/latest/Reference/Server/#seterrorhandler
- UIT — Recomendación E.164: https://www.itu.int/rec/T-REC-E.164

## Uso de IA

- **Herramienta(s):** Claude Code (modelo Claude, de Anthropic).
- **Para qué la usé:**
  - Reconstruir el punto de partida a partir del enunciado.
  - Plantear hipótesis de causa raíz y experimentos para comprobarlas (por ejemplo, cómo
    interpreta `new Date()` las fechas `dd/mm/yyyy`).
  - Escribir el código, los tests, los mensajes de commit y este documento.
  - Revisé cada cambio y lo verifiqué localmente con `bun run test`, `bun run check-types`,
    `bun run lint` y `bun run fmt`.
