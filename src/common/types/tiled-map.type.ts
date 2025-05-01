// Тип для слоя карты (tilelayer)
export interface TileLayer {
  data: number[]; // Массив ID тайлов, длина = width * height (в данном случае 64 * 64 = 4096)
  height: number; // Высота слоя в тайлах (в данном случае 64)
  id: number; // Уникальный идентификатор слоя (например, 1)
  name: string; // Имя слоя, например, "Ground"
  opacity: number; // Прозрачность слоя (0–1, в данном случае 1)
  type: 'tilelayer'; // Тип слоя, в данном случае "tilelayer"
  visible: boolean; // Видимость слоя (в данном случае true)
  width: number; // Ширина слоя в тайлах (в данном случае 64)
  x: number; // Координата X слоя (в данном случае 0)
  y: number; // Координата Y слоя (в данном случае 0)
}

// Тип для тайлсета
interface Tileset {
  firstgid: number; // Первый глобальный ID тайла в тайлсете (например, 1)
  source: string; // Путь к файлу тайлсета (например, "../.../tileset1.tsx")
}

// Основной тип для Tiled карты
export interface TiledMap {
  compressionlevel: number; // Уровень сжатия (-1 означает без сжатия)
  height: number; // Высота карты в тайлах (например, 64)
  infinite: boolean; // Является ли карта бесконечной (например, false)
  layers: TileLayer[]; // Массив слоев карты, содержащий tilelayer, такой как "Ground"
  nextlayerid: number; // Следующий доступный ID для нового слоя (например, 4)
  nextobjectid: number;
  properties: Property[]; // Следующий доступный ID для нового объекта (например, 1)
  orientation: 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal'; // Тип ориентации карты (например, "orthogonal")
  renderorder: 'right-down' | 'right-up' | 'left-down' | 'left-up'; // Порядок рендеринга (например, "right-down")
  tiledversion: string; // Версия Tiled (например, "1.11.2")
  tileheight: number; // Высота тайла в пикселях (например, 32)
  tilesets: Tileset[]; // Массив тайлсетов, используемых в карте
  tilewidth: number; // Ширина тайла в пикселях (например, 32)
  type: 'map'; // Тип документа, в данном случае "map"
  version: string; // Версия формата Tiled (например, "1.10")
  width: number; // Ширина карты в тайлах (например, 64)
}

interface Property {
  name: string; // Имя свойства (например, "isWalkable")
  type: 'bool' | 'int' | 'float' | 'string'; // Тип свойства (например, "bool")
  value: boolean | number | string; // Значение свойства (например, true или false)
}
