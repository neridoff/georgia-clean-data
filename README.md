# Georgia Clean: почасовая история через GitHub Actions

Раз в час GitHub запрашивает Electricity Maps (зона GE) и дописывает
показание в `history.json`. Виджет при каждом обновлении берёт пропущенные
часы из этого файла.

## Установка (~10 минут)

1. **Создайте репозиторий** на github.com: New repository →
   имя `georgia-clean-data` → **Public** → Create.

2. **Загрузите `fetch.js` и `history.json`**: Add file → Upload files →
   перетащите оба файла → Commit changes.

3. **Добавьте workflow**: Add file → Create new file →
   в поле имени наберите `.github/workflows/hourly.yml`
   (слэши сами создадут папки) → вставьте содержимое `hourly.yml` → Commit.

4. **Добавьте ключ**: Settings → Secrets and variables → Actions →
   New repository secret → Name: `ELECTRICITYMAPS_TOKEN`,
   Secret: ваш ключ Electricity Maps → Add secret.

5. **Проверьте запуск**: Actions → Hourly reading → Run workflow.
   Через ~30 с должна появиться зелёная галочка, а в `history.json`
   первая запись. Дальше он запускается сам каждый час в :07.

6. **Подключите виджет**: откройте `history.json` → кнопка **Raw** →
   скопируйте адрес (вида
   `https://raw.githubusercontent.com/ВАШ_ЛОГИН/georgia-clean-data/main/history.json`)
   и вставьте его в `remoteHistoryURL` в CONFIG скрипта Georgia Clean.

## Что где лежит

- Ключ: только в Secrets репозитория (зашифрован, в логах скрыт) и в
  Keychain Scriptable на телефоне. В файлах его нет.
- `history.json`: последние 60 дней, `[{ time, intensity, carbonFree }]`.
  Публичный, но это открытые данные о сети Грузии.

## Если что-то не так

- Красный крестик в Actions: откройте запуск и посмотрите шаг
  `node fetch.js`. Обычно это опечатка в имени секрета или неверный ключ.
- После 60 дней без активности GitHub может отключить расписание
  (придёт письмо). Включается кнопкой Enable workflow во вкладке Actions.
