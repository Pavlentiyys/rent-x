const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const AUTH_TOKEN_KEY = 'rentx_auth_token';

// ── Token helpers ────────────────────────────────────────────────────────────

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  walletAddress: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  documentUrl: string | null;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PostOwner = Pick<UserProfile, 'id' | 'walletAddress' | 'username' | 'displayName' | 'avatarUrl' | 'isVerified'>;

export interface PostImage {
  id: number;
  objectKey: string;
  url: string;
  sortOrder: number;
}

export interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  pricePerDay: string;
  depositAmount: string;
  currencyMint: string;
  location: string | null;
  status: string;
  availableFrom: string | null;
  availableTo: string | null;
  owner: PostOwner | null;
  images: PostImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Rent {
  id: number;
  startDate: string;
  endDate: string;
  daysCount: number;
  pricePerDay: string;
  rentAmount: string;
  depositAmount: string;
  totalAmount: string;
  status: string;
  cancelReason: string | null;
  post: Post | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── SIWS Auth ────────────────────────────────────────────────────────────────

export async function generateSiwsMessage(wallet: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/wallet/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate SIWS message: ${response.statusText}`);
  }

  const data = await response.json();
  return data.message as string;
}

export async function verifySiwsSignature(
  wallet: string,
  message: string,
  signature: string,
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/wallet/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet, message, signature }),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token as string;
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function getMe(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to get user profile');
  return response.json();
}

export async function updateUserProfile(
  token: string,
  data: Partial<Pick<UserProfile, 'username' | 'displayName' | 'avatarUrl' | 'bio' | 'documentUrl'>>,
): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || 'Failed to update profile');
  }
  return response.json();
}

// ── Posts ────────────────────────────────────────────────────────────────────

export async function fetchPosts(
  page: number = 1,
  limit: number = 12,
  category?: string,
  search?: string,
  token?: string,
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(category && { category }),
    ...(search && { search }),
  });

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

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
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

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
  limit: number = 10,
) {
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

export interface CreatePostData {
  title: string;
  description: string;
  category: string;
  pricePerDay: string;
  depositAmount: string;
  currencyMint: string;
  status?: "draft" | "active";
  location?: string;
  availableFrom?: string;
  availableTo?: string;
  images?: { objectKey: string; url: string; sortOrder?: number }[];
}

export interface UploadUrlResponse {
  objectKey: string;
  uploadUrl: string;
  fileUrl: string;
  expiresInSeconds: number;
}

export async function getUploadUrl(
  token: string,
  fileName: string,
  contentType: string,
  size: number,
): Promise<UploadUrlResponse> {
  const response = await fetch(`${API_BASE_URL}/files/upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ fileName, contentType, size }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || 'Failed to get upload URL');
  }
  return response.json();
}

export async function uploadFileToStorage(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
}

export async function updatePost(
  token: string,
  id: number,
  data: Partial<CreatePostData>,
): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || 'Failed to update post');
  }
  return response.json();
}

export async function createPost(token: string, data: CreatePostData): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || 'Failed to create post');
  }
  return response.json();
}

// ── Rents ────────────────────────────────────────────────────────────────────

export async function fetchMyRents(token: string) {
  const response = await fetch(`${API_BASE_URL}/rents`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch my rents: ${response.statusText}`);
  }

  return response.json() as Promise<Rent[]>;
}
