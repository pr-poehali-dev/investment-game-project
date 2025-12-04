import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface User {
  username: string;
  balance: number;
  totalInvested: number;
  totalWon: number;
  history: HistoryItem[];
}

interface HistoryItem {
  id: string;
  type: 'invest' | 'win' | 'withdraw' | 'deposit';
  amount: number;
  date: string;
}

interface DepositMethod {
  id: string;
  title: string;
  icon: string;
  description: string;
  steps: string[];
  processingTime: string;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(true);
  const [currentParticipant, setCurrentParticipant] = useState(1);
  const [user, setUser] = useState<User>({
    username: '',
    balance: 0,
    totalInvested: 0,
    totalWon: 0,
    history: []
  });
  
  const [authForm, setAuthForm] = useState({
    username: '',
    password: ''
  });

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [selectedDepositMethod, setSelectedDepositMethod] = useState<DepositMethod | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const depositMethods: DepositMethod[] = [
    {
      id: 'card',
      title: 'Банковская карта',
      icon: 'CreditCard',
      description: 'Пополнение через Visa/MasterCard/Мир',
      steps: [
        'Введите сумму пополнения',
        'Нажмите "Продолжить"',
        'Введите данные банковской карты',
        'Подтвердите платёж через SMS',
        'Средства зачислятся мгновенно'
      ],
      processingTime: 'Мгновенно'
    },
    {
      id: 'sbp',
      title: 'СБП (Система быстрых платежей)',
      icon: 'Smartphone',
      description: 'Быстрый перевод через мобильный банк',
      steps: [
        'Введите сумму пополнения',
        'Скопируйте номер телефона получателя',
        'Откройте приложение вашего банка',
        'Переведите деньги по номеру телефона через СБП',
        'Средства зачислятся в течение 1-2 минут'
      ],
      processingTime: '1-2 минуты'
    },
    {
      id: 'qiwi',
      title: 'QIWI Кошелёк',
      icon: 'Wallet',
      description: 'Пополнение через QIWI',
      steps: [
        'Введите сумму пополнения',
        'Войдите в свой QIWI Кошелёк',
        'Переведите средства на указанный номер',
        'Подтвердите платёж',
        'Средства зачислятся в течение 5 минут'
      ],
      processingTime: 'До 5 минут'
    },
    {
      id: 'crypto',
      title: 'Криптовалюта',
      icon: 'Bitcoin',
      description: 'Пополнение через USDT/BTC/ETH',
      steps: [
        'Выберите криптовалюту (USDT, BTC, ETH)',
        'Введите сумму пополнения',
        'Скопируйте адрес кошелька',
        'Отправьте криптовалюту с вашего кошелька',
        'Средства зачислятся после 3 подтверждений в сети'
      ],
      processingTime: '10-30 минут'
    },
    {
      id: 'yoomoney',
      title: 'ЮMoney',
      icon: 'Coins',
      description: 'Пополнение через ЮMoney (бывший Яндекс.Деньги)',
      steps: [
        'Введите сумму пополнения',
        'Войдите в ЮMoney',
        'Переведите средства на указанный счёт',
        'Подтвердите операцию',
        'Средства зачислятся в течение 5 минут'
      ],
      processingTime: 'До 5 минут'
    },
    {
      id: 'promo',
      title: 'Промокод',
      icon: 'Gift',
      description: 'Активация промокода для получения бонуса',
      steps: [
        'Введите промокод в специальное поле',
        'Нажмите "Активировать"',
        'Бонус будет начислен на ваш баланс мгновенно',
        'Проверьте баланс после активации'
      ],
      processingTime: 'Мгновенно'
    }
  ];

  const totalPool = currentParticipant * 50;
  const winAmount = totalPool * 0.07;
  const progressPercent = (currentParticipant / 15) * 100;

  const handleAuth = (isRegister: boolean) => {
    if (!authForm.username || !authForm.password) {
      toast.error('Заполните все поля');
      return;
    }

    setUser({
      username: authForm.username,
      balance: isRegister ? 100 : 500,
      totalInvested: 0,
      totalWon: 0,
      history: []
    });
    
    setIsAuthenticated(true);
    setShowAuthDialog(false);
    toast.success(`Добро пожаловать, ${authForm.username}!`);
  };

  const handleInvest = () => {
    if (user.balance < 50) {
      toast.error('Недостаточно средств! Пополните баланс минимум на 50₽');
      return;
    }

    const newBalance = user.balance - 50;
    const newParticipant = currentParticipant + 1;
    
    if (newParticipant === 15) {
      const prize = winAmount;
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        type: 'win',
        amount: prize,
        date: new Date().toLocaleString('ru-RU')
      };

      setUser({
        ...user,
        balance: newBalance + prize,
        totalInvested: user.totalInvested + 50,
        totalWon: user.totalWon + prize,
        history: [historyItem, ...user.history]
      });

      toast.success(`🎉 Поздравляем! Вы 15-й участник! Выигрыш: ${prize.toFixed(2)}₽`, {
        duration: 5000
      });

      setCurrentParticipant(1);
    } else {
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        type: 'invest',
        amount: 50,
        date: new Date().toLocaleString('ru-RU')
      };

      setUser({
        ...user,
        balance: newBalance,
        totalInvested: user.totalInvested + 50,
        history: [historyItem, ...user.history]
      });

      setCurrentParticipant(newParticipant);
      toast.success('Инвестиция совершена! Ждём 15-го участника...');
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Укажите корректную сумму');
      return;
    }

    if (amount > user.balance) {
      toast.error('Недостаточно средств на балансе');
      return;
    }

    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      type: 'withdraw',
      amount: amount,
      date: new Date().toLocaleString('ru-RU')
    };

    setUser({
      ...user,
      balance: user.balance - amount,
      history: [historyItem, ...user.history]
    });

    toast.success(`Заявка на вывод ${amount}₽ создана!`);
    setShowWithdrawDialog(false);
    setWithdrawAmount('');
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Укажите корректную сумму');
      return;
    }

    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      type: 'deposit',
      amount: amount,
      date: new Date().toLocaleString('ru-RU')
    };

    setUser({
      ...user,
      balance: user.balance + amount,
      history: [historyItem, ...user.history]
    });

    toast.success(`Баланс пополнен на ${amount}₽!`, {
      description: `Способ: ${selectedDepositMethod?.title}`
    });
    
    setSelectedDepositMethod(null);
    setDepositAmount('');
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md glass-effect border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-3xl gradient-text text-center">InvestWin</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Инвестируй и выигрывай каждый 15-й раз!
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Имя пользователя</Label>
                <Input 
                  id="login-username"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                  placeholder="Введите имя"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Пароль</Label>
                <Input 
                  id="login-password"
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  placeholder="Введите пароль"
                />
              </div>
              <Button 
                className="w-full gradient-purple hover:opacity-90 transition-opacity"
                onClick={() => handleAuth(false)}
              >
                Войти
              </Button>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username">Имя пользователя</Label>
                <Input 
                  id="register-username"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                  placeholder="Придумайте имя"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Пароль</Label>
                <Input 
                  id="register-password"
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  placeholder="Придумайте пароль"
                />
              </div>
              <Button 
                className="w-full gradient-purple hover:opacity-90 transition-opacity"
                onClick={() => handleAuth(true)}
              >
                Зарегистрироваться
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 opacity-50" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl md:text-5xl font-extrabold gradient-text">InvestWin</h1>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setIsAuthenticated(false);
                setShowAuthDialog(true);
              }}
            >
              <Icon name="LogOut" size={20} />
            </Button>
          </div>
          <p className="text-muted-foreground">Привет, {user.username}!</p>
        </header>

        <div className="grid gap-6 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Card className="glass-effect border-primary/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon name="Wallet" size={24} className="text-primary" />
                <span className="text-sm text-muted-foreground">Баланс</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDepositDialog(true)}
                  className="border-primary/30"
                >
                  <Icon name="Plus" size={16} className="mr-1" />
                  Пополнить
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWithdrawDialog(true)}
                  className="border-primary/30"
                >
                  <Icon name="ArrowUpRight" size={16} className="mr-1" />
                  Вывести
                </Button>
              </div>
            </div>
            <div className="text-5xl font-bold gradient-text mb-2">
              {user.balance.toFixed(2)}₽
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary">{user.totalInvested}₽</div>
                <div className="text-xs text-muted-foreground">Инвестировано</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/10">
                <div className="text-2xl font-bold text-secondary">{user.totalWon.toFixed(2)}₽</div>
                <div className="text-xs text-muted-foreground">Выиграно</div>
              </div>
            </div>
          </Card>

          <Card className="glass-effect border-primary/20 p-6">
            <div className="text-center mb-6">
              <div className="text-sm text-muted-foreground mb-3">
                Инвестируй и получай шанс выиграть!
              </div>
              <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
                <div className="text-sm text-muted-foreground mb-1">Текущий фонд</div>
                <div className="text-4xl font-extrabold gradient-text mb-2">{totalPool}₽</div>
                <div className="text-sm">
                  Выигрыш каждого 15-го: <span className="text-primary font-bold text-lg">{winAmount.toFixed(2)}₽</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Icon name="Sparkles" size={16} className="text-primary" />
                <span>Следующий выигрыш может быть твоим!</span>
              </div>
            </div>

            <Button 
              className="w-full h-16 text-xl font-bold gradient-purple hover:opacity-90 transition-opacity animate-pulse-slow shadow-lg shadow-primary/50"
              onClick={handleInvest}
              disabled={user.balance < 50}
            >
              <Icon name="TrendingUp" size={24} className="mr-2" />
              Инвестировать 50₽
            </Button>
            
            {user.balance < 50 && (
              <p className="text-center text-sm text-destructive mt-2">
                Недостаточно средств. Пополните баланс!
              </p>
            )}
          </Card>

          <Card className="glass-effect border-primary/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="History" size={24} className="text-primary" />
              <h2 className="text-xl font-bold">История операций</h2>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {user.history.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  История пуста. Совершите первую инвестицию!
                </p>
              ) : (
                user.history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {item.type === 'invest' && <Icon name="ArrowDown" size={20} className="text-muted-foreground" />}
                      {item.type === 'win' && <Icon name="Trophy" size={20} className="text-primary" />}
                      {item.type === 'withdraw' && <Icon name="ArrowUpRight" size={20} className="text-accent" />}
                      {item.type === 'deposit' && <Icon name="Plus" size={20} className="text-secondary" />}
                      <div>
                        <div className="font-semibold">
                          {item.type === 'invest' && 'Инвестиция'}
                          {item.type === 'win' && '🎉 Выигрыш'}
                          {item.type === 'withdraw' && 'Вывод средств'}
                          {item.type === 'deposit' && 'Пополнение'}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.date}</div>
                      </div>
                    </div>
                    <div className={`font-bold text-lg ${item.type === 'win' ? 'text-primary' : item.type === 'withdraw' ? 'text-accent' : item.type === 'deposit' ? 'text-secondary' : 'text-muted-foreground'}`}>
                      {item.type === 'invest' || item.type === 'withdraw' ? '-' : '+'}{item.amount.toFixed(2)}₽
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="glass-effect border-primary/20">
          <DialogHeader>
            <DialogTitle className="gradient-text">Вывод средств</DialogTitle>
            <DialogDescription>
              Доступно для вывода: <span className="text-primary font-bold">{user.balance.toFixed(2)}₽</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Сумма вывода</Label>
              <Input 
                id="withdraw-amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Введите сумму"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="withdraw-method">Способ вывода</Label>
              <Input 
                id="withdraw-method"
                placeholder="Банковская карта / Кошелёк"
              />
            </div>

            <Button 
              className="w-full gradient-purple hover:opacity-90 transition-opacity"
              onClick={handleWithdraw}
            >
              <Icon name="CheckCircle" size={20} className="mr-2" />
              Подтвердить вывод
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent className="glass-effect border-primary/20 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="gradient-text text-2xl">Пополнение баланса</DialogTitle>
            <DialogDescription>
              Выберите удобный способ пополнения фондового баланса
            </DialogDescription>
          </DialogHeader>
          
          {!selectedDepositMethod ? (
            <div className="grid gap-3 mt-2">
              {depositMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedDepositMethod(method)}
                  className="text-left p-4 rounded-xl glass-effect border border-primary/10 hover:border-primary/40 transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon name={method.icon} size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 group-hover:gradient-text transition-all">{method.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Icon name="Clock" size={14} className="text-accent" />
                        <span className="text-accent font-semibold">{method.processingTime}</span>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDepositMethod(null)}
                className="mb-2"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Назад к способам
              </Button>

              <Card className="glass-effect border-primary/20 p-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon name={selectedDepositMethod.icon} size={28} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl gradient-text">{selectedDepositMethod.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedDepositMethod.description}</p>
                    <div className="flex items-center gap-2 text-xs mt-2">
                      <Icon name="Clock" size={14} className="text-accent" />
                      <span className="text-accent font-semibold">Время зачисления: {selectedDepositMethod.processingTime}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Icon name="ListChecks" size={18} className="text-primary" />
                    Алгоритм действий:
                  </h4>
                  <ol className="space-y-2">
                    {selectedDepositMethod.steps.map((step, index) => (
                      <li key={index} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm text-foreground pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Card>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Сумма пополнения (₽)</Label>
                  <Input 
                    id="deposit-amount"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Введите сумму"
                    className="text-lg"
                  />
                </div>

                <Button 
                  className="w-full h-12 gradient-purple hover:opacity-90 transition-opacity text-lg font-bold"
                  onClick={handleDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                >
                  <Icon name="CheckCircle" size={20} className="mr-2" />
                  Подтвердить пополнение
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;