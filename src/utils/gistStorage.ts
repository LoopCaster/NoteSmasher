export interface GistData {
	jobs: string[];
	notes: Record<string, Record<string, string>>;
	tasks: Record<string, any[]>;
}

export class GistStorage {
	private gistId: string | null = null;
	private token: string | null = null;

	constructor() {
		this.token = localStorage.getItem('notesmasher.github_token');
		this.gistId = localStorage.getItem('notesmasher.gist_id');
	}

	setToken(token: string) {
		this.token = token;
		localStorage.setItem('notesmasher.github_token', token);
	}

	getToken(): string | null {
		return this.token;
	}

	setGistId(gistId: string) {
		this.gistId = gistId;
		localStorage.setItem('notesmasher.gist_id', gistId);
	}

	getGistId(): string | null {
		return this.gistId;
	}

	async createGist(data: GistData): Promise<string> {
		if (!this.token) {
			throw new Error('GitHub token not set');
		}

		const response = await fetch('https://api.github.com/gists', {
			method: 'POST',
			headers: {
				'Authorization': `token ${this.token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				description: 'NoteSmasher Data Sync',
				public: false,
				files: {
					'notesmasher-data.json': {
						content: JSON.stringify(data, null, 2)
					}
				}
			})
		});

		if (!response.ok) {
			throw new Error(`Failed to create gist: ${response.statusText}`);
		}

		const gist = await response.json();
		this.setGistId(gist.id);
		return gist.id;
	}

	async updateGist(data: GistData): Promise<void> {
		if (!this.token || !this.gistId) {
			throw new Error('GitHub token or Gist ID not set');
		}

		const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
			method: 'PATCH',
			headers: {
				'Authorization': `token ${this.token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				files: {
					'notesmasher-data.json': {
						content: JSON.stringify(data, null, 2)
					}
				}
			})
		});

		if (!response.ok) {
			throw new Error(`Failed to update gist: ${response.statusText}`);
		}
	}

	async loadGist(): Promise<GistData | null> {
		if (!this.token || !this.gistId) {
			return null;
		}

		try {
			const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
				headers: {
					'Authorization': `token ${this.token}`,
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to load gist: ${response.statusText}`);
			}

			const gist = await response.json();
			const file = gist.files['notesmasher-data.json'];
			
			if (!file || !file.content) {
				return null;
			}

			return JSON.parse(file.content);
		} catch (error) {
			console.error('Failed to load gist:', error);
			return null;
		}
	}

	async testConnection(): Promise<boolean> {
		if (!this.token) {
			return false;
		}

		try {
			const response = await fetch('https://api.github.com/user', {
				headers: {
					'Authorization': `token ${this.token}`,
				}
			});

			return response.ok;
		} catch {
			return false;
		}
	}

	clearAuth() {
		this.token = null;
		this.gistId = null;
		localStorage.removeItem('notesmasher.github_token');
		localStorage.removeItem('notesmasher.gist_id');
	}
}
