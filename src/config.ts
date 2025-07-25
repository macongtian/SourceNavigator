import * as vscode from 'vscode';
import * as path from 'path';

export interface SourceNavigatorConfig {
    projectName: string;
    description: string;
    path: string;
    port: number;
}

export const DEFAULT_CONFIG: SourceNavigatorConfig = {
    projectName: "language-tools",
    description: "Language tools and code analysis",
    path: "",  // Empty path for backwards compatibility
    port: 8009 // Default port for backwards compatibility
};

export async function findSourceNavigatorConfig(workspaceFolder: vscode.WorkspaceFolder): Promise<SourceNavigatorConfig> {
    const configPath = path.join(workspaceFolder.uri.fsPath, 'source-navigator.config.json');
    
    try {
        // Check if config file exists and read it
        const configFile = await vscode.workspace.fs.readFile(vscode.Uri.file(configPath));
        const configContent = Buffer.from(configFile).toString('utf8');
        const config: SourceNavigatorConfig = JSON.parse(configContent);
        
        // Validate config
        if (!config.projectName || !config.description || config.path === undefined) {
            throw new Error('Invalid source-navigator.config.json: missing required fields');
        }

        // Use default port if not specified
        if (config.port === undefined) {
            config.port = DEFAULT_CONFIG.port;
        }
        
        return {
            projectName: config.projectName,
            description: config.description,
            path: config.path,
            port: config.port
        };
    } catch (error) {
        console.log(`No valid source-navigator.config.json found in ${workspaceFolder.name}, using default config`);
        return DEFAULT_CONFIG;
    }
}

export function getProjectBasePath(config: SourceNavigatorConfig): string {
    // For backwards compatibility, if path is empty, return empty string (root path)
    if (!config.path) {
        return '';
    }
    if (!config.path.startsWith('/')) {
        config.path = '/' + config.path;
    }
    return `${config.path}`;
} 