import { BrowserRouter } from 'react-router-dom';
import { AppInfrastructureProvider } from './providers/AppInfrastructureProvider';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <AppInfrastructureProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppInfrastructureProvider>
  );
}

export default App;
