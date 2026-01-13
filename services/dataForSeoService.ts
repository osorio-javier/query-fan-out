import { ApiCredentials, DataForSeoResponse, SearchParams, TaskResult } from '../types';

const API_URL = "https://api.dataforseo.com/v3/ai_optimization/chat_gpt/llm_scraper/live/advanced";

export interface BatchResponse {
  results: TaskResult[];
  errors: string[];
}

export const get_llm_responses = async (
  credentials: ApiCredentials,
  params: SearchParams
): Promise<BatchResponse> => {
  const authString = btoa(`${credentials.login}:${credentials.pass}`);
  
  // We execute requests in parallel, one request per keyword.
  // The 'Live' endpoint often returns 40401 (Task Not Found) when processing a batch of complex tasks 
  // because the internal timeout is reached before all tasks in the batch are ready.
  // Sending individual requests ensures each task gets its own execution context and timeout window.
  const promises = params.keywords.map(async (kw) => {
    // Payload is an array containing a single task
    const payload = [{
      keyword: kw,
      location_code: params.location_code,
      language_code: params.language_code,
      force_web_search: true
    }];

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        return { error: `HTTP ${response.status}: ${text}`, keyword: kw };
      }

      const data: DataForSeoResponse = await response.json();

      if (data.status_code === 20000) {
        const task = data.tasks?.[0];
        
        // Check for task-level success
        if (task && task.result && task.result.length > 0) {
          return { success: task.result[0] };
        } else {
          // Task level error (e.g. 40401 inside the 200 OK response)
          const msg = task?.status_message || "No result found";
          const code = task?.status_code || 0;
          return { error: `${msg} (Code: ${code})`, keyword: kw };
        }
      } else {
        // API level error
        return { error: `${data.status_message} (Code: ${data.status_code})`, keyword: kw };
      }
    } catch (error: any) {
      return { error: error.message || "Network error", keyword: kw };
    }
  });

  const responses = await Promise.all(promises);

  const results: TaskResult[] = [];
  const errors: string[] = [];

  responses.forEach(r => {
    if ('success' in r && r.success) {
      results.push(r.success);
    } else if ('error' in r && r.error) {
      errors.push(`Keyword "${r.keyword}": ${r.error}`);
    }
  });

  return { results, errors };
};