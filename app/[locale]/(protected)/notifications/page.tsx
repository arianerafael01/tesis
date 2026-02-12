import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { notifications } from "@/components/partials/header/data";
import { Badge } from "@/components/ui/badge";

const NotificationsPage = () => {
  const hasNotifications = notifications && notifications.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-medium text-default-800">
          Notificaciones del Sistema
        </div>
        {hasNotifications && (
          <Badge color="secondary" className="text-sm">
            {notifications.length} {notifications.length === 1 ? 'notificación' : 'notificaciones'}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="border-b border-default-200">
          <div className="flex items-center gap-2">
            <Icon icon="heroicons-outline:bell" className="h-5 w-5 text-default-600" />
            <span className="text-lg font-medium text-default-800">
              Todas las Notificaciones
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {hasNotifications ? (
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="divide-y divide-default-200">
                {notifications.map((item, index) => (
                  <div
                    key={`notification-${index}`}
                    className="flex gap-4 p-4 hover:bg-default-50 transition-colors cursor-pointer"
                  >
                    <div className="flex-none">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={item.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {item.title.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-default-800">
                          {item.title}
                        </h4>
                        {item.unreadmessage && (
                          <span className="h-2 w-2 bg-destructive rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-default-600 line-clamp-2">
                        {item.desc}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-default-400">
                        <Icon icon="heroicons-outline:clock" className="h-3.5 w-3.5" />
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="h-20 w-20 rounded-full bg-default-100 flex items-center justify-center mb-4">
                <Icon 
                  icon="heroicons-outline:bell-slash" 
                  className="h-10 w-10 text-default-400"
                />
              </div>
              <h3 className="text-lg font-medium text-default-800 mb-2">
                No hay notificaciones
              </h3>
              <p className="text-sm text-default-600 text-center max-w-sm">
                Tu bandeja de notificaciones está vacía. Cuando recibas notificaciones del sistema, aparecerán aquí.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
