# K&J Art

Сайт на ателие **K&J Art** — портрети, карикатури и спомени по поръчка.  
Интерфейс на български. Статични страници с HTML, CSS и JavaScript.

Визуална идентичност: мек cream-pink фон, dusty rose / rose-gold акценти; лого и портфолио в `assets/brand/`.

## Публичен адрес (GitHub Pages)

**https://hristozlatarev77-maker.github.io/K-J/**

Сайтът е в корена на клон `main` (има `.nojekyll`). Ако адресът още не отваря страницата:

1. <https://github.com/hristozlatarev77-maker/K-J/settings> → **General** → **Danger Zone** → видимост **Public**.
2. <https://github.com/hristozlatarev77-maker/K-J/settings/pages> → Source: *Deploy from a branch* → `main` + `/ (root)` → **Save**.
3. Изчакайте 1–2 минути и отворете https://hristozlatarev77-maker.github.io/K-J/

## Страници

| Файл | Съдържание |
|------|------------|
| `index.html` | Начало — бранд фон, лого, представяне |
| `gallery.html` | Галерия с клиентски поръчки + филтър |
| `about.html` | За ателието, процес, видео и звук |
| `contact.html` | Форма за поръчка (с вход/регистрация) |
| `js/auth.js` | Регистрация / вход / изход |

## Как да отворите локално

```bash
python3 -m http.server 8080
```

Отворете: <http://localhost:8080/>

## Структура

```
css/styles.css          — тема, breakpoints, layout
js/main.js              — меню, филтър на галерията
js/form-validation.js   — валидация на формата за поръчка
assets/brand/           — лого, фон, портфолио
assets/media/           — видео (mp4) и аудио (mp3/wav)
```
