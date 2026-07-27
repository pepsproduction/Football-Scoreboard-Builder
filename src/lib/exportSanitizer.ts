// src/lib/exportSanitizer.ts
// Walks Konva stage clone and removes ALL Text nodes and UI-only groups before export
import Konva from 'konva';

/**
 * Sanitize a cloned Konva stage for PNG export.
 * - Removes all Text nodes recursively
 * - Removes the resize-handles group (ID: resize-handles)
 * - Throws if any Text node survives
 */
export function sanitizeExportStage(stage: Konva.Stage): void {
  // Remove resize handles UI overlay
  stage.find('#resize-handles').forEach((n) => n.destroy());

  // Remove preview-only icons (time clock, half arc) — leaves empty background boxes
  // These are the ModuleIconShape groups tagged with name="preview-only"
  stage.find('[name=preview-only]').forEach((n) => n.destroy());

  removeTextNodes(stage);
  verifyNoTextNodes(stage);
}

function removeTextNodes(node: Konva.Node): void {
  if (node instanceof Konva.Text) {
    node.destroy();
    return;
  }

  if ('getChildren' in node && typeof (node as Konva.Container).getChildren === 'function') {
    const children = (node as Konva.Container).getChildren();
    // Iterate in reverse to safely remove while iterating
    for (let i = children.length - 1; i >= 0; i--) {
      removeTextNodes(children[i]);
    }
  }
}

function verifyNoTextNodes(node: Konva.Node): void {
  if (node instanceof Konva.Text) {
    throw new Error(
      'Export aborted: Text node found in export stage. ' +
        'This is a safety violation. Please report this bug.'
    );
  }

  if ('getChildren' in node && typeof (node as Konva.Container).getChildren === 'function') {
    const children = (node as Konva.Container).getChildren();
    for (const child of children) {
      verifyNoTextNodes(child);
    }
  }
}

/**
 * Count text nodes (for debugging).
 */
export function countTextNodes(node: Konva.Node): number {
  if (node instanceof Konva.Text) return 1;
  if (!('getChildren' in node)) return 0;
  return (node as Konva.Container)
    .getChildren()
    .reduce((acc, child) => acc + countTextNodes(child), 0);
}
