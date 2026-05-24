# ⚔️ SkyRift Server

`SkyRift Server` - backend-сервер для multiplayer RPG/online game-проекта `SkyRift`.

Здесь собраны авторизация, GraphQL API, realtime-взаимодействие по WebSocket, игровая симуляция мира, боевая система, перемещение, NPC, квесты, инвентарь и вспомогательная инфраструктура.

## ✨ Что умеет проект

В сервер уже заложены основные игровые подсистемы:

- 🔐 регистрация, логин, refresh/logout и работа с токенами
- 👤 пользователи и игровые персонажи
- 🧙 классы персонажей, навыки и эффекты
- 🎒 инвентарь, экипировка и предметы
- 🗺 локации, спавны, тайловые карты и телепорты
- 👾 мобы и NPC
- ⚔️ realtime-бой, урон, AOE, снаряды и восстановление
- 🧭 перемещение, pathfinding и spatial grid
- 📜 квесты и прогресс игрока
- 💬 чат и игровые realtime-события
- 📡 presence и сессии игроков через Redis
- 🌱 сидинг мира и стартовых игровых данных

## 📚 Содержание

- [Обзор](#-обзор)
- [Технологический стек](#-технологический-стек)
- [Функциональность](#-функциональность)
- [Архитектура](#-архитектура)
- [Структура проекта](#-структура-проекта)
- [API и realtime](#-api-и-realtime)
- [Quick Start](#-quick-start)
- [Docker](#-docker)
- [Скрипты](#-скрипты)

## 📖 Обзор

`SkyRift Server` построен как модульный backend на `NestJS` и разделен на два больших слоя:

- `modules` - persistent-домен и бизнес-сущности, которые живут в PostgreSQL
- `realtime` - игровая runtime-логика, которая обслуживает живой мир, сокеты, симуляцию и боевые тики

При запуске сервер:

- поднимает GraphQL API
- подключает PostgreSQL и Redis
- инициализирует realtime-подсистемы
- загружает ассеты карт
- выполняет bootstrap игрового мира

То есть backend не просто отдает данные, а держит активное состояние мира и обрабатывает игровые действия в реальном времени.

## 🧰 Технологический стек

### Core

- `TypeScript`
- `Node.js`
- `NestJS`
- `CQRS`

### API

- `GraphQL`
- `Apollo Server`
- `cookie-based auth`

### Realtime

- `WebSocket`
- `Socket.IO`
- `Redis`

### Data

- `PostgreSQL`
- `TypeORM`

### Game Runtime

- `EasyStar.js` для pathfinding
- in-memory runtime repositories
- tick-based simulation

### DevOps

- `Docker`
- `Docker Compose`

## 🎮 Функциональность

| Модуль                     | Описание                                               |
| -------------------------- | ------------------------------------------------------ |
| 🔐 Auth                    | Регистрация, вход, refresh token, logout               |
| 👤 Users                   | Пользователи и текущий профиль                         |
| 🧝 Characters              | Игровые персонажи и получение персонажей пользователя  |
| 🧙 Character Classes       | Классы персонажей и базовые параметры                  |
| 🎒 Items / Bag / Equipment | Предметы, сумка, экипировка, runtime-перемещение вещей |
| ✨ Skills / Effects        | Навыки, эффекты, AOE и боевые воздействия              |
| 📜 Quests                  | Квесты и прогресс по ним                               |
| 👾 Mobs / NPC              | Игровые сущности мира, поведение и взаимодействие      |
| 🗺 Locations / Spawn       | Локации, точки появления, карты и телепорты            |
| ⚔️ Combat                  | Атаки, снаряды, урон, боевые тики                      |
| 🧭 Movement                | Перемещение, очереди движения, pathfinding             |
| 💬 Chat                    | World / location / direct сообщения                    |
| 📡 Presence                | Онлайн-состояние соединений и игроков через Redis      |
| 🌱 Seed                    | Загрузка мира, карт и стартовых данных                 |

## 🏗 Архитектура

Проект организован модульно и сочетает `DDD`, `CQRS` и `ports & adapters`.

Общий поток выглядит так:

```text
Client
  │
  ├── GraphQL API
  │     └── use-cases / facades / repositories
  │
  └── WebSocket Gateway
        └── realtime use-cases / runtime services / in-memory state
                    │
                    ├── PostgreSQL
                    ├── Redis
                    └── Game world simulation
```

Что важно в текущей структуре:

- persistent-модули отвечают за сущности и данные, которые должны храниться между сессиями
- realtime-модули отвечают за живое состояние мира и реакцию на игровые события
- CQRS используется для разделения команд, query-объектов, фасадов и use-case логики
- часть runtime-данных хранится в памяти для быстрой обработки тиков и боевых событий

## 📂 Структура проекта

```text
src
├─ app.module.ts
├─ main.ts
├─ infrastructure
│  ├─ database
│  ├─ graphql
│  ├─ redis
│  ├─ seed
│  └─ ws
├─ modules
│  ├─ auth
│  ├─ user
│  ├─ character
│  ├─ character-class
│  ├─ item
│  ├─ bag
│  ├─ equipment
│  ├─ skill
│  ├─ effect
│  ├─ quest
│  ├─ npc
│  ├─ mob
│  ├─ location
│  ├─ spawn
│  └─ faction
├─ realtime
│  ├─ gateway
│  ├─ flow
│  ├─ simulation
│  ├─ combat
│  ├─ movement
│  ├─ interaction
│  ├─ presence
│  ├─ chat
│  ├─ player-session
│  ├─ mob-session
│  ├─ npc-session
│  ├─ path-finding
│  └─ spatial-grid
├─ common
└─ assets
   ├─ maps
   └─ tilesets
```

## 🔌 API и realtime

### GraphQL API

Сервер поднимает GraphQL endpoint и автоматически собирает схему в файл:

- `src/schema.gql`

В проекте уже есть операции для:

- `signUp`
- `signIn`
- `refreshTokens`
- `logout`
- `getCurrentUser`
- `findUserCharacters`

GraphQL playground включается в dev-режиме.

### WebSocket gateway

Realtime-взаимодействие работает через `Socket.IO` namespace:

- `/game`

Сокет-слой обрабатывает игровые события, например:

- вход в мир
- перемещение персонажа
- атаку и отмену атаки
- использование навыков
- использование предметов
- экипировку / снятие экипировки
- разговор с NPC
- использование телепортов
- игровой чат
- ping/pong и connection stats

## ⚡ Quick Start

### 1. Установка зависимостей

```bash
npm install
```

### 2. Подготовка окружения

Создайте `.env` и заполните основные переменные:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=skyrift

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USER=default
REDIS_PASSWORD=redis

ACCESS_SECRET=your_access_secret
REFRESH_SECRET=your_refresh_secret
```

### 3. Поднять инфраструктуру

```bash
docker compose up -d
```

### 4. Заполнить проект стартовыми данными

```bash
npm run seed
```

### 5. Запустить сервер

```bash
npm run start:dev
```

После запуска приложение будет доступно по адресу:

- API: `http://localhost:3001/graphql`
- Assets: `http://localhost:3001/assets/...`
- WebSocket namespace: `ws://localhost:3001/game`

## 🐳 Docker

Через `docker-compose.yaml` поднимаются:

- `PostgreSQL`
- `Redis`

Команда запуска:

```bash
docker compose up -d
```

Если нужно остановить контейнеры:

```bash
docker compose down
```

## 🛠 Скрипты

Основные npm-скрипты проекта:

```bash
npm run start
npm run start:dev
npm run start:prod

npm run build
npm run lint

npm run seed
```

## 💡 Заметки по проекту

- при старте вызывается bootstrap игрового мира, поэтому часть runtime-состояния инициализируется автоматически
- карты и тайлсеты лежат прямо в репозитории в `src/assets`
- backend рассчитан на связку с отдельным frontend-клиентом игры

## 🚀 Статус

Проект находится в стадии активной разработки и представляет собой серверную основу для realtime RPG-игры `SkyRift`.
