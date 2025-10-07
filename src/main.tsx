import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { reportWebVitals } from './lib/perf/webVitals';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

performance.mark('app:boot');
createRoot(container).render(<App />);
performance.measure('app:render', 'app:boot');

reportWebVitals();
