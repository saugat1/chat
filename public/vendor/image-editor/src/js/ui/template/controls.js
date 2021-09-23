import { getHelpMenuBarPosition } from "@/util";

export default ({
  locale,
  biImage,
  loadButtonStyle,
  downloadButtonStyle,
  menuBarPosition,
}) => `
    <ul class="tui-image-editor-help-menu ${getHelpMenuBarPosition(
      menuBarPosition
    )}"></ul>
    <div class="tui-image-editor-controls">
        <div class="tui-image-editor-controls-logo">
        <div style="${loadButtonStyle}" @click="imageUploadModal = false" >
        ${locale.localize("cancel")} 
        
    </div>
        </div>
        <ul class="tui-image-editor-menu"></ul>

        <div class="tui-image-editor-controls-buttons">
            <div style="${loadButtonStyle}">
            ${locale.localize("select image")}
                <input type="file" accept="image/*" class="tui-image-editor-load-btn" />
            </div>
            <button class="tui-image-editor-download-btn" style="${downloadButtonStyle}">
                ${locale.localize("save")}
            </button>
        </div>
    </div>
`;
