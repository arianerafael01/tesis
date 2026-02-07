import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

const AnalyticsPage = () => {
  const t = useTranslations("AnalyticsDashboard");
  
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🛠️</span>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-default-900 dark:text-default-100 mb-4">
            Página en Mantenimiento
          </h1>
          
          <p className="text-default-600 dark:text-default-400 mb-6">
            Estamos trabajando para mejorar esta sección. 
            <br />
            ¡Volveremos pronto con nuevas funcionalidades!
          </p>
          
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-primary-600 dark:text-primary-400">
              💡 Mientras tanto, puedes explorar las otras secciones del sistema
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;