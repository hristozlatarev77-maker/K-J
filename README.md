# K&J Art — курсов сайт

Статичен многостраничен сайт на **K&J Art** (портрети, карикатури, спомени) за курса „Увод в уеб програмирането“ (ФМИ).  
Интерфейс на български. Технологии: HTML5, CSS3, vanilla JavaScript.  
Визуална идентичност: мек cream-pink фон, dusty rose / rose-gold акценти, черн текст; лого и реални поръчки в `assets/brand/`.

## Публичен адрес (GitHub Pages)

Целеви URL след включване на Pages:

**https://hristozlatarev77-maker.github.io/K-J/**

Сайтът е в корена на клон `main` (има `.nojekyll`). Ако адресът още не отваря страницата:

1. <https://github.com/hristozlatarev77-maker/K-J/settings> → **General** → **Danger Zone** → видимост **Public**.
2. <https://github.com/hristozlatarev77-maker/K-J/settings/pages> → Source: *Deploy from a branch* → `main` + `/ (root)` → **Save**.
3. Изчакайте 1–2 минути и отворете https://hristozlatarev77-maker.github.io/K-J/

## Страници

| Файл | Съдържание |
|------|------------|
| `index.html` | Начало — пълен фон `site-background.jpg`, лого, статии, видео, аудио, CSS анимация |
| `gallery.html` | Галерия с реални клиентски поръчки + филтър |
| `about.html` | За K&J и процеса |
| `contact.html` | Форма за поръчка (изисква вход) + JS валидация |
| `js/auth.js` | Регистрация / вход / изход (localStorage) |

## Как да отворите локално

```bash
python3 -m http.server 8080
```

Отворете: <http://localhost:8080/>

## Структура

```
css/styles.css          — бранд тема, breakpoints, layout свойства
js/main.js              — мобилно меню, филтър на галерията
js/form-validation.js   — клиентска валидация
assets/brand/           — лого, фон, примерни поръчки
assets/media/           — видео (mp4) и аудио (mp3/wav)
```

## Изисквания → къде са покрити

1. **Семантични HTML5 тагове** (`header`, `nav`, `article`, `aside`, `section`, `footer`) — на всяка страница.
2. **Responsive + breakpoints** (~360, ~768, ~992/1024, ~1200) — в `css/styles.css`.
3. **Съдържание** — текст, графика (лого/поръчки), звук, видео, CSS анимация — `index.html`.
4. **Формуляр + JS валидация** — `contact.html` + `js/form-validation.js`.
5. **CSS layout свойства** — `display`, `visibility`, `position`, `float`, `clear`, `opacity`, `overflow`, `vertical-align`.
6. **Стилове за съдържание** — типография, цветове, линкове, списъци, изображения.
7. **Хибридни единици** — `px`, `em`, `%` + `@media`.
8. **W3C валидация** — стъпките по-долу.

## W3C валидация (HTML5 и CSS3)

- HTML: <https://validator.w3.org/>
- CSS: <https://jigsaw.w3.org/css-validator/>
- QA инструменти: <https://www.w3.org/QA/Tools/>

1. Качете или посочете URI за `index.html`, `gallery.html`, `about.html`, `contact.html`.
2. Качете `css/styles.css` в CSS валидатора.
3. `@import` за Google Fonts е валиден; офлайн качване може да предупреди за външния ресурс.

## Лиценз / учебна цел

Учебни материали; бранд активи и примерни поръчки от K&J Art за демонстрация в курса.
