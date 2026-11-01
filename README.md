# Карикатури — курсов сайт

Статичен многостраничен сайт по тема **карикатури** за курса „Увод в уеб програмирането“ (ФМИ).  
Интерфейсът е на български. Технологии: HTML5, CSS3, vanilla JavaScript.

## Страници

| Файл | Съдържание |
|------|------------|
| `index.html` | Начало — герой, статия, видео, аудио, CSS анимация, aside |
| `gallery.html` | Галерия с филтър по жанр |
| `about.html` | История и техники |
| `contact.html` | Форма с различни типове полета и JS валидация |

## Как да отворите локално

### Вариант 1 — директно във файловия мениджър

Отворете `index.html` в модерен браузър (Chrome, Firefox, Edge).

### Вариант 2 — локален HTTP сървър (препоръчително)

От корена на хранилището:

```bash
python3 -m http.server 8080
```

После отворете: <http://localhost:8080/>

## Структура

```
css/styles.css          — общи стилове, breakpoints, layout свойства
js/main.js              — навигация (мобилно меню), филтър на галерията
js/form-validation.js   — клиентска валидация на формата
assets/images/          — SVG илюстрации
assets/media/           — видео (mp4) и аудио (mp3/wav)
```

## Изисквания → къде са покрити

1. **Семантични HTML5 тагове** (`header`, `nav`, `article`, `aside`, `section`, `footer`) — на всяка страница.
2. **Responsive + breakpoints** (~360, ~768, ~992/1024, ~1200) — в `css/styles.css` (`@media`).
3. **Съдържание** — текст, графика (SVG), звук, видео, CSS анимация — `index.html`.
4. **Формуляр + JS валидация** — `contact.html` + `js/form-validation.js`.
5. **CSS layout свойства** — `display`, `visibility`, `position`, `float`, `clear`, `opacity`, `overflow`, `vertical-align` използвани в оформленията (`styles.css`, галерия, статии, aside).
6. **Стилове за съдържание** — типография, цветове, линкове, списъци, изображения.
7. **Хибридни единици** — `px`, `em`, `%` + `@media`.
8. **W3C валидация** — вижте секцията по-долу.

## W3C валидация (HTML5 и CSS3)

Онлайн инструменти на W3C:

- HTML: <https://validator.w3.org/>
- CSS: <https://jigsaw.w3.org/css-validator/>
- Списък с QA инструменти: <https://www.w3.org/QA/Tools/>

### Стъпки

1. Стартирайте локалния сървър или качете файловете на хостинг.
2. За HTML: отворете <https://validator.w3.org/#validate_by_upload> (или „Validate by URI“) и проверете `index.html`, `gallery.html`, `about.html`, `contact.html`.
3. За CSS: отворете <https://jigsaw.w3.org/css-validator/#validate_by_upload> и качете `css/styles.css`.
4. Алтернатива с URI (ако сайтът е публично достъпен): „Validate by URI“ → адрес на страницата / на CSS файла.

Маркерът `@import` за Google Fonts е валиден CSS; при офлайн проверка на файла валидаторът може да предупреди за външния ресурс — това не чупи валидността на правилата в таблицата.

## Лиценз / учебна цел

Учебни материали и оригинални SVG/аудио/видео за демонстрация в курса.
