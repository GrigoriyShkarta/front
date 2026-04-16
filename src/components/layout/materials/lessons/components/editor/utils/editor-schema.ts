import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { YoutubeBlock } from "../segments/custom-blocks/youtube-block";
import { AudioBlock } from "../segments/custom-blocks/audio-block";
import { FileBlock } from "../segments/custom-blocks/file-block";

/**
 * Centrally defined schema for the BlockNote editor to avoid circular dependencies
 * and ensure all custom blocks are properly initialized.
 */
export const editor_schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    youtube: YoutubeBlock(),
    audio: AudioBlock(),
    file: FileBlock(),
  },
});
