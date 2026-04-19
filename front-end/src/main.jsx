import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MainLayout from './layouts/MainLayout';
import { store } from './store';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker1x from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow,
});

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <MainLayout />
  </Provider>
)
