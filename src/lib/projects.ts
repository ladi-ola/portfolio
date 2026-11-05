import type { MarkdownInstance, ImageMetadata } from 'astro';

export interface DiagramNode { id: string; label: string; detail?: string; x: number; y: number }
export interface DiagramEdge { from: string; to: string }
export interface ProjectMeta {
  slug: string;
  order: number;
  title: string;
  summary: string;
  cardSummary: string;
  status: string;
  role: string;
  dates: string;
  tags: string[];
  cover?: string;
  links?: { label: string; href: string }[];
  diagram?: { description: string; width: number; height: number; nodes: DiagramNode[]; edges: DiagramEdge[] };
}

const entries = import.meta.glob<MarkdownInstance<ProjectMeta>>('../content/projects/*.md', { eager: true });
export const projects = Object.values(entries).sort((a, b) => a.frontmatter.order - b.frontmatter.order);

const images = import.meta.glob<{ default: ImageMetadata }>('../assets/projects/**/*.{png,jpg,jpeg,webp,avif}', { eager: true });

export function projectImages(slug: string) {
  return Object.entries(images)
    .filter(([path]) => path.startsWith(`../assets/projects/${slug}/`))
    .sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))
    .map(([path, image]) => ({ name: path.split('/').at(-1)!, image: image.default }));
}

export function projectCover(project: ProjectMeta) {
  const available = projectImages(project.slug);
  return available.find((item) => item.name === project.cover) ?? available[0];
}
