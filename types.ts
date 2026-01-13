export interface BrandEntity {
  type: string;
  title: string;
  category: string;
  markdown?: string;
  urls?: string | null;
}

export interface SearchResultItem {
  type: string;
  url: string;
  domain: string;
  title: string;
  description?: string;
  snippet?: string;
}

export interface SourceItem {
  type: string;
  title: string;
  url: string;
  domain: string;
  source_name?: string;
}

export interface ScraperItem {
  type: string;
  rank_group: number;
  rank_absolute: number;
  markdown: string;
  brand_entities?: BrandEntity[];
}

export interface TaskResult {
  keyword: string;
  location_code: number;
  language_code: string;
  // These fields are siblings of 'items' in the API response
  fan_out_queries?: string[];
  brand_entities?: BrandEntity[];
  search_results?: SearchResultItem[];
  sources?: SourceItem[];
  items: ScraperItem[];
}

export interface Task {
  id: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  result_count: number;
  path: string[];
  data: any;
  result: TaskResult[];
}

export interface DataForSeoResponse {
  version: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks: Task[];
}

export interface ApiCredentials {
  login: string;
  pass: string;
}

export interface SearchParams {
  keywords: string[]; // Changed from single keyword to array
  location_code: number;
  language_code: string;
}