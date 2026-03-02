import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/context/AuthProvider";
import { AppRouter } from "@/router/AppRouter";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster theme="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
