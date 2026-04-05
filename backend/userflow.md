# User Flow

Документ описывает пользовательский опыт платформы через текущий backend API. Это не полная спецификация всех DTO, а практическая карта того, как фронтенд должен вести пользователя по основным сценариям MVP.

## Общие правила

- Все защищенные ручки требуют `Authorization: Bearer <JWT>`.
- Для трассировки каждый ответ содержит `x-request-id`. При ошибке `requestId` также приходит в JSON body.
- Единый формат ошибки:

```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "...",
  "path": "/rents/1/complete",
  "requestId": "...",
  "timestamp": "..."
}
```

- Swagger доступен по `GET /docs`.

## 1. Гость открывает платформу

Что доступно без авторизации:

- `GET /health`
- `GET /posts`
- `GET /posts/:id`
- `GET /users`
- `GET /users/:id`
- `GET /reviews`
- `GET /reviews/:id`

Что делает фронтенд:

1. Загружает каталог объявлений через `GET /posts`.
2. При необходимости использует фильтры:
   - `search`
   - `category`
   - `location`
   - `minPricePerDay`
   - `maxPricePerDay`
   - `availableFrom`
   - `availableTo`
   - `page`
   - `limit`
   - `sortBy`
   - `sortOrder`
3. Открывает карточку объявления через `GET /posts/:id`.
4. Показывает публичный профиль владельца через вложенный `owner` в post response или отдельно через `GET /users/:id`.

## 2. Пользователь логинится через Solana

### Шаг 1. Получить сообщение для подписи

`POST /auth/wallet/message`

Frontend отправляет:

```json
{
  "wallet": "<SOLANA_WALLET_ADDRESS>"
}
```

Backend возвращает:

- `wallet`
- `message`
- `expiresAt`

### Шаг 2. Подписать сообщение кошельком

Frontend подписывает `message` через `signMessage()` в кошельке.

### Шаг 3. Обменять подпись на JWT

`POST /auth/wallet/verify`

Frontend отправляет:

```json
{
  "wallet": "<SOLANA_WALLET_ADDRESS>",
  "message": "<SIGNED_MESSAGE>",
  "signature": "<BASE58_SIGNATURE>"
}
```

Backend:

- проверяет валидность wallet address
- проверяет base58 signature
- проверяет Solana signature cryptographically
- создает пользователя, если его еще нет
- выдает JWT

### Шаг 4. Получить текущий профиль

`GET /auth/me` или `GET /users/me`

Frontend сохраняет JWT и дальше работает только через него.

## 3. Пользователь редактирует свой профиль

### Получить профиль

`GET /users/me`

### Обновить профиль

`PATCH /users/me`

Что можно менять:

- `username`
- `displayName`
- `avatarUrl`
- `bio`

Что нельзя менять через API профиля:

- `walletAddress`

## 4. Владелец загружает изображение и создает объявление

### Шаг 1. Получить presigned upload URL

`POST /files/upload-url`

Frontend отправляет:

```json
{
  "fileName": "camera.jpg",
  "contentType": "image/jpeg",
  "size": 524288
}
```

Backend возвращает:

- `bucket`
- `objectKey`
- `uploadUrl`
- `fileUrl`
- `expiresInSeconds`

### Шаг 2. Загрузить файл в Minio

Frontend делает `PUT` в `uploadUrl`.

### Шаг 3. Создать объявление

`POST /posts`

Frontend отправляет post payload, включая `images[]` с `objectKey` и `url`.

Важно:

- `objectKey` должен начинаться с `posts/<currentUserId>/`
- чужой `objectKey` backend отклонит

Если post создается без `status`, он станет `draft`.

## 5. Владелец публикует объявление

`POST /posts/:id/publish`

Перед публикацией backend проверяет:

- есть хотя бы одно изображение
- `pricePerDay > 0`
- `depositAmount >= 0`
- обязательные поля заполнены

После публикации объявление становится доступно в публичном каталоге.

Дополнительные действия владельца:

- `POST /posts/:id/pause`
- `POST /posts/:id/archive`
- `PATCH /posts/:id`
- `DELETE /posts/:id`

Ограничение:

- нельзя архивировать, ставить на паузу или удалять post, если по нему есть нетерминальные rents

## 6. Владелец просматривает свои объявления

`GET /posts/mine`

Возвращаются и активные, и неактивные посты владельца.

## 7. Арендатор создает заявку на аренду

### Шаг 1. Найти пост

Через публичный каталог `GET /posts`.

### Шаг 2. Создать rent request

`POST /rents`

Frontend отправляет:

```json
{
  "postId": 1,
  "startDate": "2026-04-15",
  "endDate": "2026-04-17"
}
```

Backend:

- не даст арендовать свою же вещь
- не даст создать rent для неактивного post
- не даст создать пересекающийся rent
- рассчитает:
  - `daysCount`
  - `rentAmount`
  - `depositAmount`
  - `totalAmount`

Статус нового rent:

- `pending`

## 8. Владелец подтверждает или отклоняет rent

### Подтвердить

`POST /rents/:id/approve`

Только владелец вещи.

### Отклонить

`POST /rents/:id/reject`

Body:

```json
{
  "reason": "Dates are no longer available"
}
```

После подтверждения rent переходит в `approved`.

## 9. Арендатор подтверждает on-chain платежи

### Арендная часть

`POST /payments/rents/:id/rent`

### Депозит

`POST /payments/rents/:id/deposit`

Frontend отправляет только `signature`.

Backend сам:

- ищет tx через Solana RPC
- проверяет, что tx успешна
- проверяет signer
- проверяет `mint`
- проверяет amount
- прикрепляет `paymentTxSignature` или `depositTxSignature` к rent

### После этого арендатор переводит rent в `paid`

`POST /rents/:id/mark-paid`

Backend не даст сделать это, пока требуемые tx не провалидированы.

## 10. Владелец подтверждает передачу вещи

`POST /rents/:id/handover`

Только владелец.

После этого:

- rent -> `active`
- post -> `rented`

## 11. Спор или отмена

### Отмена

`POST /rents/:id/cancel`

Доступно для участников сделки, пока status:

- `pending`
- `approved`

### Спор

`POST /rents/:id/dispute`

Доступно для участников сделки, когда status:

- `active`

## 12. Возврат и завершение аренды

Если депозит возвращается через on-chain tx, владелец сначала подтверждает возвратную транзакцию:

`POST /payments/rents/:id/return`

Потом владелец завершает аренду:

`POST /rents/:id/complete`

После этого:

- rent -> `completed`
- если больше нет активных/disputed rent для post, post возвращается в `active`

## 13. Отзывы после завершения аренды

### Создать отзыв

`POST /reviews`

Frontend отправляет:

```json
{
  "rentId": 1,
  "targetUserId": 2,
  "rating": 5,
  "comment": "Smooth and reliable rental experience"
}
```

Backend проверяет:

- rent существует
- rent имеет статус `completed`
- автор и target являются сторонами сделки
- на эту сторону в этой аренде отзыв еще не оставлялся

### Обновить / удалить отзыв

- `PATCH /reviews/:id`
- `DELETE /reviews/:id`

Только автор отзыва.

После create/update/delete backend пересчитывает рейтинг пользователя.

## 14. Что показывать пользователю в интерфейсе по статусам rent

### `pending`

- renter: заявка отправлена, ждет ответа
- owner: доступны `approve` и `reject`

### `approved`

- renter: нужно провести on-chain оплату и депозит
- owner: ждет оплаты

### `paid`

- owner: доступно подтверждение передачи (`handover`)
- renter: ждет передачи вещи

### `active`

- обе стороны: аренда идет
- участникам доступен `dispute`

### `disputed`

- аренда спорная
- владелец все еще может завершить rent, если спор урегулирован

### `completed`

- аренда завершена
- можно оставлять отзывы

### `rejected` / `cancelled`

- сделка не состоялась

## 15. Минимальный happy-path для фронтенда

1. Пользователь логинится через `auth/wallet/message` -> `auth/wallet/verify`
2. Владелец получает `files/upload-url`, загружает изображение, создает `POST /posts`
3. Владелец публикует post через `POST /posts/:id/publish`
4. Арендатор находит post через `GET /posts`
5. Арендатор создает rent через `POST /rents`
6. Владелец подтверждает rent через `POST /rents/:id/approve`
7. Арендатор подтверждает платежи через `POST /payments/rents/:id/rent` и `POST /payments/rents/:id/deposit`
8. Арендатор переводит rent в `paid` через `POST /rents/:id/mark-paid`
9. Владелец подтверждает передачу через `POST /rents/:id/handover`
10. После возврата владелец при необходимости подтверждает return tx через `POST /payments/rents/:id/return`
11. Владелец завершает rent через `POST /rents/:id/complete`
12. Стороны оставляют отзывы через `POST /reviews`

## 16. Что уже можно отдавать фронтенду

Для MVP фронтенд уже может опираться на backend как на рабочий API для:

- auth
- profile
- catalog
- post owner flow
- rent flow
- payments verification flow
- reviews
- health/docs

Если фронт ориентируется на MVP, backend достаточно готов для интеграции.
