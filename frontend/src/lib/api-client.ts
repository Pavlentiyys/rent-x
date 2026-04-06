const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  pricePerDay: number;
  deposit: number;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  images: Array<{ url: string; order: number }>;
  status: 'active' | 'rented' | 'paused';
  rating?: number;
  reviewCount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchPosts(
  page: number = 1,
  limit: number = 12,
  category?: string,
  search?: string,
  token?: string
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(category && { category }),
    ...(search && { search }),
  });

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/posts?${params}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.statusText}`);
  }

  return response.json() as Promise<PaginatedResponse<Post>>;
}

export async function fetchPostById(id: number, token?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch post: ${response.statusText}`);
  }

  return response.json() as Promise<Post>;
}

export async function fetchMyPosts(
  token: string,
  page: number = 1,
  limit: number = 10
) {
  if (!token) {
    throw new Error('Authentication token required');
  }

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/posts/mine?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch my posts: ${response.statusText}`);
  }

  return response.json() as Promise<PaginatedResponse<Post>>;
}
