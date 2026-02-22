import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import type { editor as MonacoEditor } from 'monaco-editor';

import type {
  PlaygroundFile,
  PlaygroundLanguage,
  PlaygroundOutputType,
  PlaygroundWorkspace,
} from '../../types/playground';
import { getDefaultWorkspace } from '../../utils/playgroundTemplates';
import { loadPlaygroundWorkspace, savePlaygroundWorkspace } from '../../utils/playgroundStorage';
import { usePlaygroundRunner } from '../../hooks/usePlaygroundRunner';
import '../../utils/monacoSetup';

import styles from './Playground.module.css';
import { PlaygroundMobile } from './PlaygroundMobile';

// ── Constants ────────────────────────────────────────────────────────────────

const SAVE_DEBOUNCE_MS = 500;

const LANGUAGE_OPTIONS: ReadonlyArray<{ label: string; value: PlaygroundLanguage }> = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
];

const OUTPUT_CLASS_MAP: Record<PlaygroundOutputType, string> = {
  stdout: styles.consoleStdout,
  stderr: styles.consoleStderr,
  result: styles.consoleResult,
  status: styles.consoleStatus,
};

// ── Extracted Sub-components ─────────────────────────────────────────────────

interface FileItemProps {
  file: PlaygroundFile;
  isActive: boolean;
  onSelect: (file: PlaygroundFile) => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, isActive, onSelect }) => (
  <div
    className={`${styles.fileItem} ${isActive ? styles.fileItemActive : ''}`}
    onClick={() => onSelect(file)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') onSelect(file);
    }}
  >
    <span className={styles.fileName}>{file.name}</span>
  </div>
);

interface TabItemProps {
  file: PlaygroundFile;
  isActive: boolean;
  onSelect: (file: PlaygroundFile) => void;
}

const TabItem: React.FC<TabItemProps> = ({ file, isActive, onSelect }) => (
  <div
    className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
    onClick={() => onSelect(file)}
    role="tab"
    tabIndex={0}
    aria-selected={isActive}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') onSelect(file);
    }}
  >
    {file.name}
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────

export const Playground: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [workspace, setWorkspace] = useState<PlaygroundWorkspace>(() => {
    const stored = loadPlaygroundWorkspace();
    return stored ?? getDefaultWorkspace('javascript');
  });

  const { outputs, isRunning, runCode, stopRun, clearOutputs } = usePlaygroundRunner();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleEditorMount = useCallback((editor: MonacoEditor.IStandaloneCodeEditor) => {
    editor.focus();
  }, []);

  // Debounce workspace persistence to avoid writing on every keystroke
  useEffect(() => {
    const timer = window.setTimeout(() => {
      savePlaygroundWorkspace(workspace);
    }, SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [workspace]);

  const activeFile = useMemo(
    () => workspace.files.find((file) => file.id === workspace.activeFileId) ?? workspace.files[0],
    [workspace.files, workspace.activeFileId]
  );

  const updateActiveFile = useCallback((content: string) => {
    setWorkspace((prev) => ({
      ...prev,
      files: prev.files.map((file) =>
        file.id === prev.activeFileId ? { ...file, content } : file
      ),
    }));
  }, []);

  const handleRun = useCallback(() => {
    if (!activeFile) return;
    runCode(activeFile.language, activeFile.content);
  }, [activeFile, runCode]);

  const handleLanguageChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextLanguage = event.target.value as PlaygroundLanguage;
      setWorkspace(getDefaultWorkspace(nextLanguage));
      clearOutputs();
    },
    [clearOutputs]
  );

  const handleFileSelect = useCallback((file: PlaygroundFile) => {
    setWorkspace((prev) => ({
      ...prev,
      activeFileId: file.id,
      activeLanguage: file.language,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setWorkspace(getDefaultWorkspace(workspace.activeLanguage));
    clearOutputs();
  }, [workspace.activeLanguage, clearOutputs]);

  if (isMobile) {
    return (
      <PlaygroundMobile
        workspace={workspace}
        onFileSelect={handleFileSelect}
        onCodeChange={updateActiveFile}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
        onStop={() => stopRun('stopped')}
        onClear={clearOutputs}
        onReset={handleReset}
        isRunning={isRunning}
        outputs={outputs}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            type="button"
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? 'Running…' : 'Run'}
          </button>
          <button
            className={styles.button}
            type="button"
            onClick={() => stopRun('stopped')}
            disabled={!isRunning}
          >
            Stop
          </button>
          <button className={styles.button} type="button" onClick={clearOutputs}>
            Clear Output
          </button>
          <button
            className={`${styles.button} ${styles.buttonDanger}`}
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
        <div className={styles.toolbarGroup}>
          <label className={styles.consoleLabel} htmlFor="playground-language-select">
            Language
          </label>
          <select
            id="playground-language-select"
            className={styles.select}
            value={workspace.activeLanguage}
            onChange={handleLanguageChange}
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Files</div>
          <div className={styles.fileList}>
            {workspace.files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                isActive={file.id === workspace.activeFileId}
                onSelect={handleFileSelect}
              />
            ))}
          </div>
        </aside>

        <section className={styles.editorPane}>
          <div className={styles.tabs} role="tablist">
            {workspace.files.map((file) => (
              <TabItem
                key={file.id}
                file={file}
                isActive={file.id === workspace.activeFileId}
                onSelect={handleFileSelect}
              />
            ))}
          </div>

          <div className={styles.editorWrapper}>
            <Editor
              height="100%"
              language={activeFile?.language}
              value={activeFile?.content}
              onChange={(value) => updateActiveFile(value ?? '')}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
              }}
            />
          </div>
        </section>
      </div>

      <section className={styles.console} aria-label="Console output">
        {outputs.length === 0 ? (
          <div className={styles.consoleLine}>
            <span className={styles.consoleLabel}>Console</span>
            <span className={styles.consoleStatus}>Run code to see output…</span>
          </div>
        ) : (
          outputs.map((entry) => (
            <div key={entry.id} className={styles.consoleLine}>
              <span className={styles.consoleLabel}>›</span>
              <span className={OUTPUT_CLASS_MAP[entry.type]}>{entry.message}</span>
            </div>
          ))
        )}
      </section>

      <div className={styles.statusBar}>
        <span className={styles.badge}>Playground</span>
        <span>Powered by Monaco + Pyodide + esbuild</span>
      </div>
    </div>
  );
};
