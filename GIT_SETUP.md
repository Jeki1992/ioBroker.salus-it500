# Git Setup для ioBroker.salus-it500

## Початкове налаштування Git репозиторію

### Крок 1: Ініціалізація Git

```bash
cd /Users/oleksandrzaiec/WebstormProjects/iobroker.salus-it500

# Ініціалізація репозиторію (якщо ще не ініціалізовано)
git init -b main

# Додати всі файли
git add .

# Створити перший коміт
git commit -m "Initial release v0.0.1

- Add Salus IT500 API library
- Implement ioBroker adapter
- Add full documentation (EN, UK)
- Add 12 usage examples
- Add translations for 11 languages
- All tests passing
- Ready for production use"
```

### Крок 2: Підключення до GitHub

```bash
# Створіть новий репозиторій на GitHub: 
# https://github.com/new
# Назва: ioBroker.salus-it500

# Підключити remote репозиторій
git remote add origin https://github.com/Jeki1992/ioBroker.salus-it500.git

# Перевірити remote
git remote -v

# Відправити код на GitHub
git push -u origin main
```

### Крок 3: Створення .gitignore (якщо потрібно)

Файл `.gitignore` вже має бути створений, але перевірте що в ньому є:

```
node_modules/
*.log
.idea/
.vscode/
*.tgz
package-lock.json
.DS_Store
```

## Робота з версіями

### Створення нової версії

```bash
# Оновити версію в package.json та io-package.json
npm version patch  # для 0.0.1 -> 0.0.2
npm version minor  # для 0.0.1 -> 0.1.0
npm version major  # для 0.0.1 -> 1.0.0

# Або вручну відредагувати файли та створити тег
git tag -a v0.0.1 -m "Release version 0.0.1"
git push origin v0.0.1
```

### Структура комітів

Використовуйте conventional commits для зручності:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: fix bug in API"
git commit -m "docs: update README"
git commit -m "chore: update dependencies"
git commit -m "test: add new tests"
```

## GitHub Actions (CI/CD)

### Налаштування автоматичного тестування

Створіть файл `.github/workflows/test-and-release.yml` для автоматичного тестування та релізу.

Базовий приклад вже має бути в проекті, створеному @iobroker/create-adapter.

### Налаштування секретів

Для автоматичного релізу потрібно додати секрети в GitHub:

1. Перейдіть до: https://github.com/Jeki1992/ioBroker.salus-it500/settings/secrets/actions
2. Додайте:
   - `AUTO_MERGE_TOKEN` - Personal Access Token з правами на push
   - `NPM_TOKEN` - NPM токен для публікації (якщо плануєте публікувати)

## Робочий процес розробки

### Створення нової функції

```bash
# Створити нову гілку
git checkout -b feature/new-feature

# Працювати над функцією
# ...редагувати файли...

# Додати зміни
git add .
git commit -m "feat: add new feature description"

# Відправити на GitHub
git push origin feature/new-feature

# Створити Pull Request на GitHub
```

### Виправлення багу

```bash
# Створити гілку для виправлення
git checkout -b fix/bug-description

# Виправити баг
# ...редагувати файли...

# Коміт
git add .
git commit -m "fix: description of bug fix"

# Push
git push origin fix/bug-description
```

## Перед публікацією в NPM

### Перевірка package.json

Переконайтеся що всі поля заповнені:
- `name`: iobroker.salus-it500
- `version`: 0.0.1
- `description`: Control and monitor Salus IT500 thermostat
- `author`: Alex <o.zaiets@ukr.net>
- `license`: MIT
- `repository`: посилання на GitHub
- `keywords`: salus, it500, thermostat, heating, climate-control

### Команди для публікації

```bash
# Логін в NPM (якщо ще не залогінені)
npm login

# Перевірка що буде опубліковано
npm pack
tar -tzf iobroker.salus-it500-0.0.1.tgz

# Публікація
npm publish

# Або сухий запуск
npm publish --dry-run
```

## Корисні Git команди

```bash
# Статус репозиторію
git status

# Переглянути історію
git log --oneline

# Переглянути зміни
git diff

# Скасувати незакомічені зміни
git checkout -- .

# Переглянути теги
git tag

# Видалити локальну гілку
git branch -d branch-name

# Оновити з remote
git pull origin main
```

## Checklist перед першим релізом

- [ ] Всі тести проходять (`npm test`)
- [ ] Код відповідає стандартам (`npm run lint`)
- [ ] TypeScript перевірка OK (`npm run check`)
- [ ] README.md заповнено
- [ ] CHANGELOG.md оновлено
- [ ] Версія в package.json та io-package.json співпадають
- [ ] Створено Git репозиторій
- [ ] Код відправлено на GitHub
- [ ] Створено release/tag на GitHub
- [ ] GitHub Actions налаштовано
- [ ] Протестовано з реальним пристроєм

## Після публікації

### Додати адаптер до офіційного репозиторію ioBroker

1. Fork репозиторію: https://github.com/ioBroker/ioBroker.repositories
2. Додати ваш адаптер до `sources-dist.json`
3. Створити Pull Request
4. Дочекатися схвалення від команди ioBroker

Приклад запису в `sources-dist.json`:

```json
"salus-it500": {
  "meta": "https://raw.githubusercontent.com/Jeki1992/ioBroker.salus-it500/main/io-package.json",
  "icon": "https://raw.githubusercontent.com/Jeki1992/ioBroker.salus-it500/main/admin/salus-it500.png",
  "type": "climate-control"
}
```

## Підтримка користувачів

### GitHub Issues

Використовуйте GitHub Issues для:
- Багрепорти
- Запити на нові функції
- Питання користувачів

### Відповіді на питання

Регулярно перевіряйте:
- GitHub Issues: https://github.com/Jeki1992/ioBroker.salus-it500/issues
- ioBroker Forum (після додавання до офіційного репозиторію)
- GitHub Discussions (якщо увімкнуто)

---

**Готово!** Тепер ви знаєте як працювати з Git для цього проекту.

