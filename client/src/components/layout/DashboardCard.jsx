import { Card, CardContent } from "@/components/ui/card";

export default function DashboardCard({
    title,
    value,
    icon: Icon,
    onClick,
}) {
    return (
        <Card
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={
                onClick
                    ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onClick(e);
                          }
                      }
                    : undefined
            }
            className={`shadow-sm hover:shadow-md transition ${
                onClick
                    ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    : ""
            }`}
        >
            <CardContent className="flex items-center justify-between p-4 sm:p-6 gap-2">
                <div className="min-w-0">
                    <p className="text-slate-500 text-xs sm:text-sm truncate">
                        {title}
                    </p>

                    <h2 className="text-xl sm:text-3xl font-bold mt-1 sm:mt-2">
                        {value}
                    </h2>
                </div>

                {Icon && (
                    <Icon
                        size={28}
                        className="text-blue-600 shrink-0 sm:hidden"
                    />
                )}
                {Icon && (
                    <Icon
                        size={38}
                        className="text-blue-600 shrink-0 hidden sm:block"
                    />
                )}
            </CardContent>
        </Card>
    );
}