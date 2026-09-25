export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}
