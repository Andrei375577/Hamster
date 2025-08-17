// Игра CryptoMiner Pro
class CryptoMinerGame {
    constructor() {
        this.gameData = {
            balance: 0,
            totalHashrate: 0,
            cryptoBalances: {
                bitcoin: 0,
                ethereum: 0,
                dogecoin: 0,
                litecoin: 0
            },
            equipment: {
                'gpu-basic': 0,
                'gpu-mid': 0,
                'gpu-high': 0,
                'asic-basic': 0,
                'asic-pro': 0,
                'farm': 0
            },
            miningStatus: {
                bitcoin: false,
                ethereum: false,
                dogecoin: false,
                litecoin: false
            },
            withdrawHistory: []
        };

        this.cryptoPrices = {
            bitcoin: 45000,
            ethereum: 3200,
            dogecoin: 0.08,
            litecoin: 75
        };

        this.priceHistory = {
            bitcoin: [45000],
            ethereum: [3200],
            dogecoin: [0.08],
            litecoin: [75]
        };

        this.equipmentData = {
            'gpu-basic': { hashrate: 20, price: 300, power: 120 },
            'gpu-mid': { hashrate: 60, price: 800, power: 220 },
            'gpu-high': { hashrate: 120, price: 1600, power: 450 },
            'asic-basic': { hashrate: 1000, price: 5000, power: 1350 },
            'asic-pro': { hashrate: 5000, price: 15000, power: 3250 },
            'farm': { hashrate: 25000, price: 100000, power: 15000 }
        };

        this.miningDifficulty = {
            bitcoin: 0.000001,
            ethereum: 0.000005,
            dogecoin: 0.001,
            litecoin: 0.0001
        };

        this.init();
    }

    init() {
        this.loadGame();
        this.setupEventListeners();
        this.updateDisplay();
        this.startGameLoop();
        this.startPriceUpdates();
        this.drawCharts();
    }

    // Система сохранения и загрузки
    saveGame() {
        localStorage.setItem('cryptoMinerPro', JSON.stringify(this.gameData));
    }

    loadGame() {
        const savedData = localStorage.getItem('cryptoMinerPro');
        if (savedData) {
            try {
                const loaded = JSON.parse(savedData);
                this.gameData = { ...this.gameData, ...loaded };
                this.showNotification('Прогресс загружен!', 'success');
            } catch (error) {
                console.error('Ошибка загрузки сохранения:', error);
                this.showNotification('Ошибка загрузки сохранения', 'error');
            }
        } else {
            // Стартовый бонус для новых игроков
            this.gameData.balance = 1000; // $1000 стартовый капитал
            this.showNotification('Добро пожаловать в CryptoMiner Pro! Стартовый бонус: $1000', 'success');
            this.saveGame();
        }
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Переключение вкладок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Кнопки майнинга
        document.querySelectorAll('.mine-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleMining(btn.dataset.crypto));
        });

        // Кнопки покупки оборудования
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', () => this.buyEquipment(btn.dataset.equipment, parseInt(btn.dataset.price)));
        });

        // Кнопки конвертации
        document.querySelectorAll('.convert-btn').forEach(btn => {
            btn.addEventListener('click', () => this.convertCrypto(btn.dataset.crypto));
        });

        // Кнопка вывода
        document.getElementById('withdrawBtn').addEventListener('click', () => this.withdrawFunds());

        // Автосохранение каждые 30 секунд
        setInterval(() => this.saveGame(), 30000);
    }

    // Переключение вкладок
    switchTab(tabName) {
        // Убираем активность со всех кнопок и контента
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Активируем нужную вкладку
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');

        if (tabName === 'market') {
            this.drawCharts();
        }
    }

    // Переключение майнинга
    toggleMining(crypto) {
        const btn = document.querySelector(`[data-crypto="${crypto}"] .mine-btn`);
        const isCurrentlyMining = this.gameData.miningStatus[crypto];

        if (isCurrentlyMining) {
            this.gameData.miningStatus[crypto] = false;
            btn.innerHTML = '<i class="fas fa-play"></i> Начать майнинг';
            btn.classList.remove('mining');
            this.showNotification(`Майнинг ${crypto} остановлен`, 'info');
        } else {
            if (this.gameData.totalHashrate === 0) {
                this.showNotification('Купите оборудование для начала майнинга!', 'error');
                return;
            }
            this.gameData.miningStatus[crypto] = true;
            btn.innerHTML = '<i class="fas fa-stop"></i> Остановить майнинг';
            btn.classList.add('mining');
            this.showNotification(`Майнинг ${crypto} запущен!`, 'success');
        }

        this.updateDisplay();
        this.saveGame();
    }

    // Покупка оборудования
    buyEquipment(equipmentType, price) {
        if (this.gameData.balance >= price) {
            this.gameData.balance -= price;
            this.gameData.equipment[equipmentType]++;
            this.gameData.totalHashrate += this.equipmentData[equipmentType].hashrate;
            
            this.updateDisplay();
            this.saveGame();
            this.showNotification(`Куплено: ${equipmentType}!`, 'success');
        } else {
            this.showNotification('Недостаточно средств!', 'error');
        }
    }

    // Конвертация криптовалюты в доллары
    convertCrypto(crypto) {
        const amount = this.gameData.cryptoBalances[crypto];
        if (amount > 0) {
            const value = amount * this.cryptoPrices[crypto];
            this.gameData.balance += value;
            this.gameData.cryptoBalances[crypto] = 0;
            
            this.updateDisplay();
            this.saveGame();
            this.showNotification(`Конвертировано ${amount.toFixed(8)} ${crypto.toUpperCase()} в $${value.toFixed(2)}`, 'success');
        } else {
            this.showNotification(`У вас нет ${crypto.toUpperCase()} для конвертации`, 'error');
        }
    }

    // Вывод средств
    withdrawFunds() {
        const amount = parseFloat(document.getElementById('withdrawAmount').value);
        const address = document.getElementById('walletAddress').value.trim();

        if (!amount || amount < 10) {
            this.showNotification('Минимальная сумма вывода: $10', 'error');
            return;
        }

        if (!address) {
            this.showNotification('Введите адрес кошелька', 'error');
            return;
        }

        if (amount > this.gameData.balance) {
            this.showNotification('Недостаточно средств', 'error');
            return;
        }

        const fee = amount * 0.02; // 2% комиссия
        const finalAmount = amount - fee;

        this.gameData.balance -= amount;
        
        // Добавляем в историю
        const withdrawal = {
            amount: finalAmount,
            fee: fee,
            address: address,
            date: new Date().toLocaleString('ru-RU'),
            status: 'Обработан'
        };
        
        this.gameData.withdrawHistory.unshift(withdrawal);
        
        // Очищаем форму
        document.getElementById('withdrawAmount').value = '';
        document.getElementById('walletAddress').value = '';
        
        this.updateDisplay();
        this.updateWithdrawHistory();
        this.saveGame();
        
        this.showNotification(`Вывод $${finalAmount.toFixed(2)} обработан! Комиссия: $${fee.toFixed(2)}`, 'success');
    }

    // Обновление истории выводов
    updateWithdrawHistory() {
        const historyContainer = document.getElementById('withdrawHistoryList');
        
        if (this.gameData.withdrawHistory.length === 0) {
            historyContainer.innerHTML = '<p class="no-history">История выводов пуста</p>';
            return;
        }

        historyContainer.innerHTML = this.gameData.withdrawHistory.map(item => `
            <div class="history-item">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <strong>$${item.amount.toFixed(2)}</strong>
                    <span class="status">${item.status}</span>
                </div>
                <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7);">
                    <div>Адрес: ${item.address.substring(0, 20)}...</div>
                    <div>Комиссия: $${item.fee.toFixed(2)} | ${item.date}</div>
                </div>
            </div>
        `).join('');
    }

    // Основной игровой цикл
    startGameLoop() {
        setInterval(() => {
            this.processMining();
            this.updateDisplay();
            this.saveGame();
        }, 1000); // Обновление каждую секунду
    }

    // Обработка майнинга
    processMining() {
        Object.keys(this.gameData.miningStatus).forEach(crypto => {
            if (this.gameData.miningStatus[crypto] && this.gameData.totalHashrate > 0) {
                // Расчет добычи с учетом сложности и хешрейта
                const miningPower = this.gameData.totalHashrate;
                const difficulty = this.miningDifficulty[crypto];
                const baseReward = difficulty * miningPower / 3600; // За секунду
                
                // Добавляем случайность ±20%
                const randomFactor = 0.8 + Math.random() * 0.4;
                const reward = baseReward * randomFactor;
                
                this.gameData.cryptoBalances[crypto] += reward;
            }
        });
    }

    // Обновление цен криптовалют
    startPriceUpdates() {
        setInterval(() => {
            this.updateCryptoPrices();
            this.updateDisplay();
            this.drawCharts();
        }, 10000); // Обновление каждые 10 секунд
    }

    updateCryptoPrices() {
        Object.keys(this.cryptoPrices).forEach(crypto => {
            // Случайное изменение цены ±5%
            const change = (Math.random() - 0.5) * 0.1;
            const newPrice = this.cryptoPrices[crypto] * (1 + change);
            
            // Ограничиваем минимальные цены
            const minPrices = { bitcoin: 20000, ethereum: 1000, dogecoin: 0.01, litecoin: 20 };
            this.cryptoPrices[crypto] = Math.max(newPrice, minPrices[crypto]);
            
            // Сохраняем историю (последние 50 значений)
            this.priceHistory[crypto].push(this.cryptoPrices[crypto]);
            if (this.priceHistory[crypto].length > 50) {
                this.priceHistory[crypto].shift();
            }
        });
    }

    // Отрисовка графиков
    drawCharts() {
        Object.keys(this.cryptoPrices).forEach(crypto => {
            const canvas = document.querySelector(`[data-crypto="${crypto}"] .price-chart`);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const history = this.priceHistory[crypto];
            
            if (history.length < 2) return;
            
            // Очищаем canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Находим min/max для масштабирования
            const min = Math.min(...history);
            const max = Math.max(...history);
            const range = max - min || 1;
            
            // Рисуем линию
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            history.forEach((price, index) => {
                const x = (index / (history.length - 1)) * canvas.width;
                const y = canvas.height - ((price - min) / range) * canvas.height;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        });
    }

    // Обновление отображения
    updateDisplay() {
        // Баланс и общая мощность
        document.getElementById('balance').textContent = this.gameData.balance.toFixed(2);
        document.getElementById('totalHashrate').textContent = this.gameData.totalHashrate.toLocaleString();

        // Цены криптовалют
        Object.keys(this.cryptoPrices).forEach(crypto => {
            const priceElement = document.querySelector(`[data-crypto="${crypto}"] .crypto-price`);
            if (priceElement) {
                priceElement.textContent = this.cryptoPrices[crypto].toFixed(crypto === 'dogecoin' ? 4 : 0);
            }
        });

        // Статистика майнинга
        Object.keys(this.gameData.miningStatus).forEach(crypto => {
            const card = document.querySelector(`[data-crypto="${crypto}"]`);
            if (card) {
                const hashrateElement = card.querySelector('.hashrate');
                const earningsElement = card.querySelector('.earnings');
                const minedElement = card.querySelector('.mined');

                if (this.gameData.miningStatus[crypto]) {
                    const hashrate = this.gameData.totalHashrate;
                    const hourlyEarnings = this.calculateHourlyEarnings(crypto);
                    
                    hashrateElement.textContent = hashrate.toLocaleString();
                    earningsElement.textContent = hourlyEarnings.toFixed(2);
                } else {
                    hashrateElement.textContent = '0';
                    earningsElement.textContent = '0.00';
                }
                
                minedElement.textContent = this.gameData.cryptoBalances[crypto].toFixed(8);
            }
        });

        // Оборудование
        Object.keys(this.gameData.equipment).forEach(equipment => {
            const card = document.querySelector(`[data-equipment="${equipment}"]`);
            if (card) {
                const countElement = card.querySelector('.count');
                const buyBtn = card.querySelector('.buy-btn');
                
                countElement.textContent = this.gameData.equipment[equipment];
                
                const price = this.equipmentData[equipment].price;
                buyBtn.disabled = this.gameData.balance < price;
            }
        });

        // Рыночные данные
        Object.keys(this.cryptoPrices).forEach(crypto => {
            const marketCard = document.querySelector(`#market [data-crypto="${crypto}"]`);
            if (marketCard) {
                const priceElement = marketCard.querySelector('.current-price');
                const changeElement = marketCard.querySelector('.price-change');
                
                priceElement.textContent = `$${this.cryptoPrices[crypto].toFixed(crypto === 'dogecoin' ? 4 : 0)}`;
                
                // Рассчитываем изменение цены
                const history = this.priceHistory[crypto];
                if (history.length >= 2) {
                    const current = history[history.length - 1];
                    const previous = history[history.length - 2];
                    const change = ((current - previous) / previous * 100);
                    
                    changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
                    changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
                }
            }
        });

        // Балансы криптовалют на странице вывода
        Object.keys(this.gameData.cryptoBalances).forEach(crypto => {
            const balanceElement = document.querySelector(`#withdraw [data-crypto="${crypto}"] .amount`);
            if (balanceElement) {
                balanceElement.textContent = this.gameData.cryptoBalances[crypto].toFixed(8);
            }
        });

        // Баланс для вывода
        document.getElementById('withdrawBalance').textContent = this.gameData.balance.toFixed(2);
    }

    // Расчет почасового дохода
    calculateHourlyEarnings(crypto) {
        if (!this.gameData.miningStatus[crypto] || this.gameData.totalHashrate === 0) {
            return 0;
        }
        
        const miningPower = this.gameData.totalHashrate;
        const difficulty = this.miningDifficulty[crypto];
        const hourlyReward = difficulty * miningPower;
        const dollarValue = hourlyReward * this.cryptoPrices[crypto];
        
        return dollarValue;
    }

    // Система уведомлений
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        const container = document.getElementById('notifications');
        container.appendChild(notification);

        // Автоматическое удаление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.cryptoMiner = new CryptoMinerGame();
});

// Добавляем анимацию для удаления уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);