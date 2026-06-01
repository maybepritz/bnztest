"use client";

import { useState, useEffect } from "react";
import { 
  Button, IconButton, Avatar, Input, 
  Tooltip, HoverCard, Spinner, Skeleton, 
  Badge, Tabs, Progress, RadioGroup, RadioItem, 
  DropdownMenu, DropdownItem, DropdownDivider,
  Checkbox,
  InputOTP,
  CircularProgress,
  useToast
} from "@/shared/ui";
import { Smile, Settings, Heart, MoreVertical, LogOut, User, Phone } from "lucide-react";
import { IncomingCallToastContent } from "@/shared/hooks/useNotificationsWebSocket";
import { useAudio } from "@/shared/hooks/useAudio";

export default function UIKitPage() {
  const { toast, success, error, warning, info } = useToast();
  const { play } = useAudio();
  const [progress, setProgress] = useState(13);
  const [radioValue, setRadioValue] = useState("apple");
  const [checked, setChecked] = useState(true);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => (p >= 100 ? 0 : p + 5));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-12 pb-32 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">UI Kit</h1>
        <p className="text-secondary">Здесь вы можете посмотреть и протестировать все готовые компоненты.</p>
      </div>

      {/* Buttons */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-primary border-b border-border/50 pb-2">Кнопки</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button isLoading>Загрузка</Button>
          
          <IconButton variant="surface"><Smile size={20} /></IconButton>
          <IconButton variant="glass"><Settings size={20} /></IconButton>
          <IconButton variant="ghost"><Heart size={20} /></IconButton>
        </div>
      </section>

      {/* Badges & Loaders */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-primary border-b border-border/50 pb-2">Бейджи и загрузчики</h2>
        <div className="flex flex-wrap gap-6 items-center">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="outline">Outline</Badge>

          <div className="w-px h-8 bg-border" />
          
          <Spinner size={32} />
          
          <div className="flex flex-col gap-2">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
      </section>

      {/* Form Controls */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-primary border-b border-border/50 pb-2">Элементы форм</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <Input placeholder="Обычный инпут" />
            
            <div className="flex flex-col gap-3 p-4 bg-surface-secondary border border-border/50 rounded-2xl shadow-sm">
              <span className="text-sm font-medium text-primary mb-1">Радио кнопки:</span>
              <RadioGroup name="fruits" value={radioValue} onChange={setRadioValue}>
                <RadioItem value="apple" label="Яблоко" />
                <RadioItem value="banana" label="Банан" />
                <RadioItem value="orange" label="Апельсин" />
              </RadioGroup>
            </div>

            <div className="flex flex-col gap-4 p-4 bg-surface-secondary border border-border/50 rounded-2xl shadow-sm">
              <span className="text-sm font-medium text-primary mb-1">Чекбоксы:</span>
              <Checkbox checked={checked} onChange={setChecked} label="Согласен с правилами" />
              <Checkbox checked={!checked} onChange={(c) => setChecked(!c)} label="Подписаться на рассылку" />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-primary mb-1">Код подтверждения (OTP):</span>
              <InputOTP value={otp} onChange={setOtp} />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-primary mb-1">Круговой прогресс ({progress}%):</span>
              <CircularProgress value={progress} size={64} />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-primary mb-1">Прогресс ({progress}%):</span>
              <Progress value={progress} />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-primary border-b border-border/50 pb-2">Интерактив</h2>
        
        <div className="flex gap-8 items-center">
          <Tooltip content="Я тултип, привет!" position="top">
            <Button variant="secondary">Наведи на меня</Button>
          </Tooltip>

          <HoverCard 
            trigger={<Avatar fallback="HC" size="md" className="cursor-pointer" />}
            side="bottom"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Avatar fallback="HC" size="lg" />
                <div>
                  <h4 className="font-bold text-primary">Иван Иванов</h4>
                  <p className="text-xs text-secondary">@ivan</p>
                </div>
              </div>
              <p className="text-sm text-primary mt-2">Разработчик, люблю делать красивые интерфейсы на React.</p>
            </div>
          </HoverCard>

          <DropdownMenu 
            align="left" 
            trigger={
              <Button variant="secondary" className="gap-2">
                Открыть меню <MoreVertical size={16} />
              </Button>
            }
          >
            <DropdownItem icon={<User size={16} />}>Мой профиль</DropdownItem>
            <DropdownItem icon={<Settings size={16} />}>Настройки</DropdownItem>
            <DropdownDivider />
            <DropdownItem danger icon={<LogOut size={16} />}>Выйти</DropdownItem>
          </DropdownMenu>
        </div>
      </section>

      {/* Tabs */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-primary border-b border-border/50 pb-2">Вкладки (Tabs)</h2>
        
        <Tabs 
          defaultValue="tab1"
          tabs={[
            { 
              value: "tab1", 
              label: "Первая вкладка", 
              content: (
                <div className="p-6 bg-surface-secondary border border-border/50 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-bold text-primary mb-2">Содержимое первой вкладки</h3>
                  <p className="text-secondary leading-relaxed">Здесь может быть любой контент. Вкладки плавно переключаются и выглядят очень аккуратно.</p>
                </div>
              )
            },
            { 
              value: "tab2", 
              label: "Вторая вкладка", 
              content: (
                <div className="p-6 bg-surface-secondary border border-border/50 rounded-2xl shadow-sm">
                  <h3 className="text-lg font-bold text-primary mb-2">Содержимое второй вкладки</h3>
                  <p className="text-secondary leading-relaxed">А тут что-то другое. Вы можете использовать их для настроек, профиля или ленты постов.</p>
                </div>
              )
            }
          ]}
        />
      </section>

      {/* Toasts */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-primary border-b border-border/50 pb-2">Уведомления (Toast)</h2>
        <div className="flex flex-wrap gap-4 items-center p-6 bg-surface-secondary border border-border/50 rounded-2xl shadow-sm">
          <Button 
            variant="secondary" 
            onClick={() => toast({ children: "Обычное уведомление (без авто-закрытия)" })}
          >
            Обычный
          </Button>
          <Button 
            className="!bg-success/20 !text-success border !border-success/30" 
            onClick={() => success("Всё прошло успешно! Данные сохранены.")}
          >
            Успех (Success)
          </Button>
          <Button 
            className="!bg-danger/20 !text-danger border !border-danger/30" 
            onClick={() => error("Произошла ошибка соединения.")}
          >
            Ошибка (Error)
          </Button>
          <Button 
            className="!bg-warning/20 !text-warning border !border-warning/30" 
            onClick={() => warning("Слишком много попыток входа.")}
          >
            Внимание (Warning)
          </Button>
          <Button 
            className="!bg-info/20 !text-info border !border-info/30" 
            onClick={() => info("Просто информация.")}
          >
            Инфо (Info)
          </Button>
        </div>

        {/* Сложные уведомления */}
        <h3 className="text-lg font-medium text-primary mt-4">Сложные уведомления (Rich Toasts)</h3>
        <p className="text-sm text-secondary mb-2">В тост можно передать любой React-компонент, чтобы сделать красивые уведомления.</p>
        <div className="flex flex-wrap gap-4 items-center p-6 bg-surface-secondary border border-border/50 rounded-2xl shadow-sm">
          <Button 
            variant="secondary" 
            onClick={() => {
              play("notification");
              toast({
                autoClose: 5000,
                children: (
                   <div className="flex items-center gap-3 pr-2">
                    <div className="p-2 bg-success/10 text-success rounded-full">
                      <User size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-primary font-medium">Максим</span>
                      <span className="text-xs text-secondary">я питух и ты питух</span>
                    </div>
                    <Button variant="primary" size="sm" className="ml-2 h-7 px-3 text-xs">Ответить</Button>
                  </div>
                )
              });
            }}
          >
            ✉️ Новое сообщение
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => toast({
              autoClose: 4000,
              children: (
                <div className="flex items-center gap-3 pr-2">
                  <div className="p-2 bg-danger/10 text-danger rounded-full">
                    <Heart size={16} className="fill-current" />
                  </div>
                  <span className="text-sm text-primary">
                    <span className="font-bold">Максим</span> оценил вашу публикацию
                  </span>
                </div>
              )
            })}
          >
            ❤️ Лайк
          </Button>

          <Button 
            variant="secondary" 
            onClick={() => toast({
              autoClose: 6000,
              children: (
                <div className="flex items-center gap-3 pr-2">
                  <div className="p-2 bg-success/10 text-success rounded-full">
                    <User size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-primary font-medium">Новый подписчик</span>
                    <span className="text-xs text-secondary">@cyber_ninja теперь читает вас</span>
                  </div>
                  <Button variant="primary" size="sm" className="ml-2 h-7 px-3 text-xs">Подписаться</Button>
                </div>
              )
            })}
          >
            👤 Подписка
          </Button>

          <Button 
            variant="secondary" 
            onClick={() => toast({
              autoClose: 15000,
              children: <IncomingCallToastContent data={{
                callerAvatar: null,
                callerName: "Alexander",
                callerUsername: "alexander"
              }} />
            })}
          >
            📞 Входящий звонок
          </Button>
        </div>
      </section>
    </div>
  );
}
