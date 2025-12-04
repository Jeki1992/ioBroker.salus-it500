# Приклади скриптів для Salus IT500

Цей файл містить приклади скриптів для використання з адаптером Salus IT500 в ioBroker.

## Базові приклади

### 1. Встановлення температури
```javascript
// Встановити температуру на 21°C
setState('salus-it500.0.setTemp', 21);
```

### 2. Перемикання режиму AUTO
```javascript
// Увімкнути AUTO режим
setState('salus-it500.0.autoMode', true);

// Вимкнути AUTO режим (ручний режим)
setState('salus-it500.0.autoMode', false);
```

### 3. Читання поточної температури
```javascript
const currentTemp = getState('salus-it500.0.currentTemp').val;
log(`Поточна температура: ${currentTemp}°C`);
```

### 4. Перевірка статусу опалення
```javascript
const heatStatus = getState('salus-it500.0.heatStatus').val;
if (heatStatus) {
    log('Опалення увімкнено');
} else {
    log('Опалення вимкнено');
}
```

## Розширені приклади

### 5. Автоматичне зниження температури вночі
```javascript
// Встановити знижену температуру о 22:00
schedule('0 22 * * *', function() {
    setState('salus-it500.0.setTemp', 18);
    log('Температура знижена до 18°C на ніч');
});

// Повернути нормальну температуру о 6:00
schedule('0 6 * * *', function() {
    setState('salus-it500.0.setTemp', 21);
    log('Температура підвищена до 21°C на день');
});
```

### 6. Економія енергії при відсутності вдома
```javascript
// Припустимо, у вас є датчик присутності: 0_userdata.0.presence
on({ id: '0_userdata.0.presence', change: 'any' }, function(obj) {
    if (obj.state.val === false) {
        // Нікого немає вдома - зниження температури
        setState('salus-it500.0.setTemp', 16);
        log('Нікого немає вдома, температура знижена до 16°C');
    } else {
        // Хтось є вдома - підвищення температури
        setState('salus-it500.0.setTemp', 21);
        log('Хтось є вдома, температура підвищена до 21°C');
    }
});
```

### 7. Сповіщення при проблемах з підключенням
```javascript
on({ id: 'salus-it500.0.info.connection', change: 'any' }, function(obj) {
    if (obj.state.val === false) {
        // Відправити сповіщення (потрібен адаптер telegram, pushover тощо)
        sendTo('telegram.0', 'send', {
            text: '⚠️ Втрачено з\'єднання з термостатом Salus IT500!'
        });
    } else {
        sendTo('telegram.0', 'send', {
            text: '✅ З\'єднання з термостатом Salus IT500 відновлено'
        });
    }
});
```

### 8. Логування змін температури
```javascript
on({ id: 'salus-it500.0.currentTemp', change: 'ne' }, function(obj) {
    const temp = obj.state.val;
    const oldTemp = obj.oldState.val;
    log(`Температура змінилась: ${oldTemp}°C → ${temp}°C`);
    
    // Додатково можна зберігати в історію (потрібен адаптер history або influxdb)
});
```

### 9. Адаптивне керування на основі зовнішньої температури
```javascript
// Припустимо, у вас є датчик зовнішньої температури
on({ id: 'javascript.0.outdoor_temp', change: 'any' }, function(obj) {
    const outdoorTemp = obj.state.val;
    let targetTemp = 21;
    
    if (outdoorTemp < -10) {
        targetTemp = 23; // Холодно - підвищити температуру
    } else if (outdoorTemp > 10) {
        targetTemp = 19; // Тепло - знизити температуру
    }
    
    setState('salus-it500.0.setTemp', targetTemp);
    log(`Зовнішня температура: ${outdoorTemp}°C, встановлена температура: ${targetTemp}°C`);
});
```

### 10. Тижневий графік температур
```javascript
// Робочі дні (Понеділок-П'ятниця)
// 6:00 - прокидання
schedule('0 6 * * 1-5', function() {
    setState('salus-it500.0.setTemp', 22);
});

// 8:00 - на роботі
schedule('0 8 * * 1-5', function() {
    setState('salus-it500.0.setTemp', 18);
});

// 18:00 - повернення з роботи
schedule('0 18 * * 1-5', function() {
    setState('salus-it500.0.setTemp', 22);
});

// 22:00 - сон
schedule('0 22 * * 1-5', function() {
    setState('salus-it500.0.setTemp', 19);
});

// Вихідні (Субота-Неділя)
// 8:00 - прокидання
schedule('0 8 * * 6-7', function() {
    setState('salus-it500.0.setTemp', 22);
});

// 23:00 - сон
schedule('0 23 * * 6-7', function() {
    setState('salus-it500.0.setTemp', 19);
});
```

### 11. Моніторинг ефективності опалення
```javascript
// Перевірка, чи досягнута цільова температура
const CHECK_INTERVAL = 30 * 60 * 1000; // 30 хвилин

setInterval(function() {
    const currentTemp = getState('salus-it500.0.currentTemp').val;
    const setTemp = getState('salus-it500.0.setTemp').val;
    const heatStatus = getState('salus-it500.0.heatStatus').val;
    
    const diff = setTemp - currentTemp;
    
    if (heatStatus && diff > 2) {
        log(`⚠️ Опалення працює, але температура нижче цільової на ${diff.toFixed(1)}°C`);
        // Можливо, проблема з системою опалення
    }
}, CHECK_INTERVAL);
```

### 12. Інтеграція з віконними контактами
```javascript
// Якщо відчинено вікно - вимкнути опалення
on({ id: 'hm-rpc.0.*.STATE', val: true }, function(obj) {
    // Вікно відчинено
    setState('salus-it500.0.autoMode', false);
    setState('salus-it500.0.setTemp', 5); // Мінімальна температура
    log('Вікно відчинено - опалення вимкнено');
});

on({ id: 'hm-rpc.0.*.STATE', val: false }, function(obj) {
    // Вікно закрито
    setState('salus-it500.0.autoMode', true);
    setState('salus-it500.0.setTemp', 21);
    log('Вікно закрито - опалення увімкнено');
});
```

## Корисні поради

1. **Не встановлюйте інтервал опитування менше 30 секунд** - це може призвести до блокування від сервера Salus
2. **Використовуйте режим AUTO для програмованого графіку** - це економить енергію
3. **Моніторте стан підключення** - створіть сповіщення при втраті з'єднання
4. **Ведіть історію температур** - це допоможе аналізувати ефективність опалення

## Troubleshooting

### Проблема: Адаптер не підключається
- Перевірте правильність логіна та пароля
- Перевірте, чи працює сайт salus-it500.com
- Подивіться логи адаптера для деталей помилки

### Проблема: Температура не змінюється
- Переконайтеся, що термостат онлайн на сайті salus-it500.com
- Перевірте, чи не встановлено блокування на самому термостаті
- Подивіться стан `info.connection`

### Проблема: Часті втрати підключення
- Збільште інтервал опитування
- Перевірте стабільність інтернет-з'єднання
- Перезапустіть адаптер

