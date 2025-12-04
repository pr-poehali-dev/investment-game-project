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
  type: 'invest' | 'win' | 'withdraw';
  amount: number;
  date: string;
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
              <div className="text-sm text-muted-foreground mb-2">
                До выигрыша осталось участников:
              </div>
              <div className="text-6xl font-extrabold gradient-text mb-1">
                {15 - currentParticipant}
              </div>
              <div className="text-sm text-muted-foreground">
                Текущий фонд: <span className="text-accent font-semibold">{totalPool}₽</span> • 
                Выигрыш: <span className="text-primary font-semibold">{winAmount.toFixed(2)}₽</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-purple transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                       style={{ backgroundSize: '200% 100%' }} 
                  />
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Участник {currentParticipant}</span>
                <span>15 участников</span>
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
                      <div>
                        <div className="font-semibold">
                          {item.type === 'invest' && 'Инвестиция'}
                          {item.type === 'win' && '🎉 Выигрыш'}
                          {item.type === 'withdraw' && 'Вывод средств'}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.date}</div>
                      </div>
                    </div>
                    <div className={`font-bold text-lg ${item.type === 'win' ? 'text-primary' : item.type === 'withdraw' ? 'text-accent' : 'text-muted-foreground'}`}>
                      {item.type === 'invest' ? '-' : '+'}{item.amount.toFixed(2)}₽
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
    </div>
  );
};

export default Index;
