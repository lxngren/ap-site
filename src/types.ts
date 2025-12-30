export interface Project {
  id: number
  title: string
  client: string
  description: string
  category: string // Можно вернуть union type 'All' | '...', если нужно строго
  thumbnailUrl: string // Используем это имя поля
  vimeoId?: string // Добавили опциональное поле
  isFeatured?: boolean
}
