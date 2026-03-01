export interface Parroquia {
  id: string;
  nombre: string;
  advocacion: string;
  direccion: string;
  cp: string;
  poblacion: string;
  vicaria: number;
  lat: number;
  lng: number;
  email?: string | null;
  telefono?: string | null;
}
