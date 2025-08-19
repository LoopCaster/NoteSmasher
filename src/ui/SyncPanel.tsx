import React, { useState, useEffect } from 'react';
import { GistStorage, GistData } from '../utils/gistStorage';

interface Props {
	gistStorage: GistStorage;
	onSync: (data: GistData) => void;
	onExport: () => GistData;
}

export const SyncPanel: React.FC<Props> = ({ gistStorage, onSync, onExport }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [token, setToken] = useState('');
	const [isConnected, setIsConnected] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [gistId, setGistId] = useState('');
	const [showGistIdInput, setShowGistIdInput] = useState(false);

	useEffect(() => {
		checkConnection();
	}, []);

	const checkConnection = async () => {
		const connected = await gistStorage.testConnection();
		setIsConnected(connected);
		if (connected) {
			setToken(gistStorage.getToken() || '');
			setGistId(gistStorage.getGistId() || '');
		}
	};

	const handleConnect = async () => {
		if (!token.trim()) {
			setMessage('Please enter a GitHub token');
			return;
		}

		setIsLoading(true);
		setMessage('');

		try {
			gistStorage.setToken(token);
			const connected = await gistStorage.testConnection();
			
			if (connected) {
				setIsConnected(true);
				setMessage('Connected to GitHub!');
				
				// Try to load existing data
				const existingData = await gistStorage.loadGist();
				if (existingData) {
					onSync(existingData);
					setMessage('Data loaded from GitHub!');
				}
			} else {
				setMessage('Invalid token. Please check your GitHub token.');
				gistStorage.clearAuth();
			}
		} catch (error) {
			setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSync = async () => {
		setIsLoading(true);
		setMessage('');

		try {
			const data = onExport();
			
			if (gistStorage.getGistId()) {
				// Update existing gist
				await gistStorage.updateGist(data);
				setMessage('Data synced to GitHub!');
			} else {
				// Create new gist
				await gistStorage.createGist(data);
				setMessage('Data uploaded to GitHub!');
			}
		} catch (error) {
			setMessage(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLoad = async () => {
		setIsLoading(true);
		setMessage('');

		try {
			const data = await gistStorage.loadGist();
			if (data) {
				onSync(data);
				setMessage('Data loaded from GitHub!');
			} else {
				setMessage('No data found on GitHub');
			}
		} catch (error) {
			setMessage(`Load failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDisconnect = () => {
		gistStorage.clearAuth();
		setIsConnected(false);
		setToken('');
		setGistId('');
		setMessage('Disconnected from GitHub');
	};

	const handleSetGistId = () => {
		if (gistId.trim()) {
			gistStorage.setGistId(gistId.trim());
			setShowGistIdInput(false);
			setMessage('Gist ID set successfully');
		}
	};

	return (
		<>
			<button 
				className="button ghost" 
				onClick={() => setIsOpen(!isOpen)}
				style={{ position: 'fixed', top: 8, right: 8, zIndex: 1000 }}
			>
				{isConnected ? '☁️' : '☁️'} Sync
			</button>

			{isOpen && (
				<div style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: 'rgba(0,0,0,0.8)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 2000
				}}>
					<div className="card" style={{ maxWidth: 500, width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
						<div className="toolbar" style={{ marginBottom: 16 }}>
							<strong>GitHub Sync</strong>
							<span className="spacer" />
							<button className="button ghost" onClick={() => setIsOpen(false)}>✕</button>
						</div>

						{!isConnected ? (
							<div>
								<p style={{ marginBottom: 16, color: 'var(--muted)' }}>
									Connect to GitHub to sync your data across devices. You'll need a GitHub Personal Access Token.
								</p>
								
								<div style={{ marginBottom: 16 }}>
									<label style={{ display: 'block', marginBottom: 8, color: 'var(--muted)' }}>
										GitHub Personal Access Token:
									</label>
									<input
										type="password"
										value={token}
										onChange={(e) => setToken(e.target.value)}
										className="jobs-input"
										placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
									/>
								</div>

								<div style={{ marginBottom: 16 }}>
									<a 
										href="https://github.com/settings/tokens/new?description=NoteSmasher&scopes=gist" 
										target="_blank" 
										rel="noopener noreferrer"
										className="button ghost"
										style={{ textDecoration: 'none' }}
									>
										Create GitHub Token
									</a>
								</div>

								<div className="toolbar">
									<button 
										className="button" 
										onClick={handleConnect}
										disabled={isLoading}
									>
										{isLoading ? 'Connecting...' : 'Connect'}
									</button>
								</div>
							</div>
						) : (
							<div>
								<p style={{ marginBottom: 16, color: 'var(--accent-2)' }}>
									✓ Connected to GitHub
								</p>

								{gistId && (
									<div style={{ marginBottom: 16, padding: 8, background: 'rgba(124,156,255,0.1)', borderRadius: 4 }}>
										<small style={{ color: 'var(--muted)' }}>Gist ID: {gistId}</small>
									</div>
								)}

								<div className="toolbar" style={{ marginBottom: 16 }}>
									<button 
										className="button" 
										onClick={handleSync}
										disabled={isLoading}
									>
										{isLoading ? 'Syncing...' : 'Upload to GitHub'}
									</button>
									<button 
										className="button ghost" 
										onClick={handleLoad}
										disabled={isLoading}
									>
										{isLoading ? 'Loading...' : 'Load from GitHub'}
									</button>
								</div>

								<div className="toolbar" style={{ marginBottom: 16 }}>
									<button 
										className="button ghost" 
										onClick={() => setShowGistIdInput(!showGistIdInput)}
									>
										{showGistIdInput ? 'Cancel' : 'Set Gist ID'}
									</button>
									<button 
										className="button ghost" 
										onClick={handleDisconnect}
									>
										Disconnect
									</button>
								</div>

								{showGistIdInput && (
									<div style={{ marginBottom: 16 }}>
										<label style={{ display: 'block', marginBottom: 8, color: 'var(--muted)' }}>
											Gist ID (from the other computer):
										</label>
										<div style={{ display: 'flex', gap: 8 }}>
											<input
												type="text"
												value={gistId}
												onChange={(e) => setGistId(e.target.value)}
												className="jobs-input"
												placeholder="1234567890abcdef..."
												style={{ flex: 1 }}
											/>
											<button 
												className="button" 
												onClick={handleSetGistId}
											>
												Set
											</button>
										</div>
									</div>
								)}
							</div>
						)}

						{message && (
							<div style={{ 
								marginTop: 16, 
								padding: 12, 
								borderRadius: 8, 
								background: message.includes('Error') || message.includes('failed') 
									? 'rgba(255,100,100,0.1)' 
									: 'rgba(66,211,146,0.1)',
								border: `1px solid ${message.includes('Error') || message.includes('failed') 
									? 'rgba(255,100,100,0.3)' 
									: 'rgba(66,211,146,0.3)'}`,
								color: message.includes('Error') || message.includes('failed') 
									? '#ff6464' 
									: '#42d392'
							}}>
								{message}
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};
