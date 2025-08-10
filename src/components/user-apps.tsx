import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserApps } from "@/actions/user-apps";
import { AppCard } from "./app-card";
import { Gamepad2 } from "lucide-react";

export function UserApps() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["userApps"],
    queryFn: getUserApps,
    initialData: [],
  });

  const onAppDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ["userApps"] });
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No games yet</h3>
          <p className="text-gray-400 mb-6">Start creating your first epic game above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-8 max-w-7xl mx-auto">
        {data.map((app) => (
          <AppCard
            key={app.id}
            id={app.id}
            name={app.name}
            createdAt={app.createdAt}
            onDelete={onAppDeleted}
          />
        ))}
      </div>
    </div>
  );
}
