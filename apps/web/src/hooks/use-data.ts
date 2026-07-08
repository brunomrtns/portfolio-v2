import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.products.list(),
  });
}

export function useArticles(params?: { page?: number; limit?: number; categoryId?: string }) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => api.articles.list(params),
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => api.articles.get(slug),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => api.skills.list(),
  });
}

export function useExperience() {
  return useQuery({
    queryKey: ['experience'],
    queryFn: () => api.experience.list(),
  });
}
