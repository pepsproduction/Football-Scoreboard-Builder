import { describe, expect, it } from 'vitest';
import { createProjectData, parseProjectJSON } from './projectStorage';
import { defaultEditorState } from '../store/editorStore';

describe('project storage migrations', () => {
  it('exports the current sport and new foul modules', () => {
    const data = createProjectData(defaultEditorState);
    expect(data.version).toBe('1.1.0');
    expect(data.state.sport).toBeNull();
    expect(data.state.modules.foulA).toBeDefined();
  });

  it('migrates legacy projects without sport or foul modules', () => {
    const data = createProjectData(defaultEditorState) as any;
    delete data.state.sport;
    delete data.state.modules.foulA;
    delete data.state.modules.foulB;

    const state = parseProjectJSON(JSON.stringify(data));
    expect(state.sport).toBe('football');
    expect(state.modules.foulA).toBeDefined();
    expect(state.modules.foulB).toBeDefined();
  });

  it('rejects malformed nested values instead of crashing the renderer', () => {
    const data = createProjectData(defaultEditorState) as any;
    data.state.colors = null;
    expect(() => parseProjectJSON(JSON.stringify(data))).toThrow(/colors/);
  });
});
