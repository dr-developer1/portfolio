import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import type { editor as MonacoEditor } from 'monaco-editor';
import type {
  PlaygroundWorkspace,
  PlaygroundFile,
  PlaygroundPresetId,
} from '../../types/playground';
import styles from './PlaygroundMobile.module.css';

interface PlaygroundMobileProps {
  workspace: PlaygroundWorkspace;
  preset: PlaygroundPresetId;
  onFileSelect: (file: PlaygroundFile) => void;
  onCodeChange: (content: string) => void;
  onLanguageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
  onReset: () => void;
  isRunning: boolean;
  loadingHint?: string | null;
  outputs: Array<{ id: string; type: string; message: string }>;
}

export const PlaygroundMobile: React.FC<PlaygroundMobileProps> = ({
  workspace,
  preset,
  onFileSelect,
  onCodeChange,
  onLanguageChange,
  onRun,
  onStop,
  onClear,
  onReset,
  isRunning,
  loadingHint,
  outputs,
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'code' | 'console'>('code');
  const [editor, setEditor] = useState<MonacoEditor.IStandaloneCodeEditor | null>(null);

  const activeFile =
    workspace.files.find((f) => f.id === workspace.activeFileId) ?? workspace.files[0];

  const handleEditorMount = (editorInstance: MonacoEditor.IStandaloneCodeEditor) => {
    setEditor(editorInstance);
  };

  const insertSymbol = (symbol: string) => {
    if (editor) {
      const position = editor.getPosition();
      const selection = editor.getSelection();
      if (position && selection) {
        editor.executeEdits('keyboard', [
          {
            range: selection,
            text: symbol,
            forceMoveMarkers: true,
          },
        ]);
        editor.focus();
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Bar: Actions */}
      <div className={styles.topBar}>
        <div>
          <div className={styles.statusText}>{activeFile.name}</div>
          <div className={styles.presetText}>Preset: {preset}</div>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.runButton}
            onClick={() => {
              setActiveTab('console');
              onRun();
            }}
            disabled={isRunning}
          >
            {isRunning ? '...' : '▶'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.content}>
        {activeTab === 'files' && (
          <div className={styles.fileList}>
            <div className={styles.fileListHeader}>
              <label htmlFor="mobile-lang-select" className={styles.languageLabel}>
                Language
              </label>
              <select
                id="mobile-lang-select"
                value={workspace.activeLanguage}
                onChange={onLanguageChange}
                className={styles.languageSelect}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
              </select>
            </div>

            {workspace.files.map((file) => (
              <button
                type="button"
                key={file.id}
                className={`${styles.fileItem} ${file.id === workspace.activeFileId ? styles.activeFile : ''}`}
                onClick={() => {
                  onFileSelect(file);
                  setActiveTab('code');
                }}
              >
                {file.name}
              </button>
            ))}
            <button type="button" className={styles.resetButton} onClick={onReset}>
              Reset Workspace
            </button>
          </div>
        )}

        {activeTab === 'code' && (
          <div className={styles.editorWrapper}>
            <Editor
              height="100%"
              language={activeFile.language}
              value={activeFile.content}
              onChange={(val) => onCodeChange(val ?? '')}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                lineNumbers: 'off',
                folding: false,
                fontSize: 14,
                wordWrap: 'on',
                padding: { top: 10 },
              }}
            />
            {/* Accessory Keyboard */}
            <div className={styles.accessoryKeyboard}>
              {['{', '}', '(', ')', '[', ']', ';', '=', '=>', 'log'].map((sym) => (
                <button type="button" key={sym} onClick={() => insertSymbol(sym)}>
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'console' && (
          <div className={styles.console}>
            <div className={styles.consoleToolbar}>
              <button type="button" onClick={onClear}>
                Clear
              </button>
              <button type="button" onClick={onStop} disabled={!isRunning}>
                Stop
              </button>
            </div>
            <div className={styles.consoleHelp}>
              Lightweight sandbox for demos and short challenges. Reload a preset anytime from the
              Files tab.
            </div>
            {loadingHint && <div className={styles.loadingHint}>{loadingHint}</div>}
            <div className={styles.consoleOutput}>
              {outputs.map((out) => (
                <div key={out.id} className={`${styles.logLine} ${styles[out.type]}`}>
                  {out.message}
                </div>
              ))}
              {outputs.length === 0 && <div className={styles.emptyLog}>No output</div>}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Tabs */}
      <div className={styles.bottomNav}>
        <button
          type="button"
          className={activeTab === 'files' ? styles.activeTab : ''}
          onClick={() => setActiveTab('files')}
        >
          Files
        </button>
        <button
          type="button"
          className={activeTab === 'code' ? styles.activeTab : ''}
          onClick={() => setActiveTab('code')}
        >
          Code
        </button>
        <button
          type="button"
          className={activeTab === 'console' ? styles.activeTab : ''}
          onClick={() => setActiveTab('console')}
        >
          Console
        </button>
      </div>
    </div>
  );
};
