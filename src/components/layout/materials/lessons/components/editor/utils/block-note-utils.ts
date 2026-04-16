import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";

export const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {}
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36).substring(2, 11);
};

export const ensureBlockId = (block: any) => ({
  ...block,
  id: block.id || generateId(),
});

/**
 * Recursively ensures all blocks and their children have valid IDs and types.
 * Also unwraps "material-style" blocks where content is a JSON string of other blocks.
 */
export const normalizeBlocks = (blocks: any[]): any[] => {
  if (!Array.isArray(blocks)) return [];
  
  const result: any[] = [];

  for (const block of blocks) {
    if (typeof block !== 'object' || block === null || Array.isArray(block)) {
      result.push({
        id: generateId(),
        type: 'paragraph',
        content: [{ type: 'text', text: String(block || ''), styles: {} }],
        children: []
      });
      continue;
    }

    // Handle "wrapper" blocks (material-style or generic wrappers)
    if (!block.type && typeof block.content === 'string' && block.content.trim().startsWith('[')) {
      try {
        const inner = JSON.parse(block.content);
        if (Array.isArray(inner)) {
          result.push(...normalizeBlocks(inner));
          continue;
        }
      } catch (e) {}
    }

    const normalized: any = {
      id: block.id || generateId(),
      type: block.type || 'paragraph',
      props: block.props || {},
      content: block.content,
      children: Array.isArray(block.children) ? normalizeBlocks(block.children) : [],
    };

    if (normalized.type === 'paragraph' && !Array.isArray(normalized.content)) {
      if (typeof normalized.content === 'string') {
          normalized.content = [{ type: 'text', text: normalized.content, styles: {} }];
      } else {
          normalized.content = [];
      }
    }

    result.push(normalized);
  }

  return result;
};

/**
 * Robustly parses initial content, handling various data wrappers and structures.
 */
export const parseContent = (initial_content: any) => {
    if (!initial_content) return undefined;

    try {
        const parsed = typeof initial_content === 'string'
            ? JSON.parse(initial_content)
            : initial_content;

        // Unwrap "main" block wrapper if it exists
        if (
            Array.isArray(parsed) &&
            parsed.length === 1 &&
            !parsed[0]?.type &&
            parsed[0]?.content &&
            typeof parsed[0].content === 'string' &&
            parsed[0].content.trim().startsWith('[')
        ) {
            try {
                const inner = JSON.parse(parsed[0].content);
                if (Array.isArray(inner)) {
                    return normalizeBlocks(inner);
                }
            } catch (e) {}
        }

        const blocksArray = Array.isArray(parsed) ? parsed : [parsed];
        const normalized = normalizeBlocks(blocksArray);
        return normalized.length > 0 ? normalized : undefined;
    } catch (e) {
        if (typeof initial_content === 'string' && initial_content.trim() !== '') {
            return [{
                id: generateId(),
                type: 'paragraph',
                content: [{ type: 'text', text: initial_content, styles: {} }],
                children: []
            }];
        }
        return undefined;
    }
};

/**
 * Automatically converts text urls in paragraph blocks to media blocks
 */
export const handleUrlConversion = (editor: any) => {
    editor.document.forEach((block: any) => {
        if (block.type === 'paragraph' && block.content && Array.isArray(block.content) && block.content.length === 1) {
            let text = '';
            const node = block.content[0];
            if (node.type === 'text') text = node.text.trim();
            else if (node.type === 'link') text = node.href.trim();

            const is_url = /^https?:\/\/\S+$/.test(text);
            if (is_url) {
                const clean_url = text.split('?')[0].split('#')[0];
                const is_image = /\.(jpeg|jpg|gif|png|webp|avif|svg)$/i.test(clean_url);
                const is_video = /\.(mp4|webm|ogg|mov)$/i.test(clean_url);
                const is_audio = /\.(mp3|wav|ogg|aac|m4a)$/i.test(clean_url);
                const youtube_match = text.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);

                let new_block: any = null;
                if (youtube_match) new_block = { id: generateId(), type: 'youtube', props: { url: text, videoId: youtube_match[1] } };
                else if (is_image) new_block = { id: generateId(), type: 'image', props: { url: text } };
                else if (is_video) new_block = { id: generateId(), type: 'video', props: { url: text } };
                else if (is_audio) new_block = { id: generateId(), type: 'audio', props: { url: text, name: text.split('/').pop() || 'Audio' } };
                else if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|txt|json|csv)$/i.test(clean_url)) {
                    new_block = { id: generateId(), type: 'file', props: { url: text, name: text.split('/').pop() || 'Document', extension: clean_url.split('.').pop()?.toUpperCase() || 'FILE' } };
                }

                if (new_block) {
                    const safe_block_id = block.id;
                    setTimeout(() => {
                        const current_block = editor.getBlock(safe_block_id);
                        if (current_block && current_block.type === 'paragraph') {
                            editor.replaceBlocks([safe_block_id], [ensureBlockId(new_block)]);
                        }
                    }, 0);
                }
            }
        }
    });
};
