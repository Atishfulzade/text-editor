import React, { useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { stateToHTML } from "draft-js-export-html";

import {
  Editor,
  EditorState,
  RichUtils,
  convertFromRaw,
  convertToRaw,
  getDefaultKeyBinding,
  KeyBindingUtil,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";

const styleMap = {
  "COLOR-red": { color: "red" },
};

function App() {
  const [editorState, setEditorState] = React.useState(() =>
    EditorState.createEmpty()
  );

  useEffect(() => {
    const savedContent = localStorage.getItem("editor_content");
    if (savedContent) {
      const convertContent = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(convertContent));
    }
  }, []);

  const handleSave = () => {
    const currentState = editorState.getCurrentContent();
    const rawState = convertToRaw(currentState);
    localStorage.setItem("editor_content", JSON.stringify(rawState));
    toast.success("Saved successfully!");
  };

  const removeSymbol = (editorState, symbol) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();
    const block = content.getBlockForKey(startKey);
    const text = block.getText();

    if (text.trim().startsWith(symbol)) {
      const rangeToReplace = selection.merge({
        anchorOffset: startOffset - symbol.length,
        focusOffset: startOffset,
      });

      const newContent = Modifier.replaceText(content, rangeToReplace, "");
      return EditorState.push(editorState, newContent, "remove-symbol");
    }

    return editorState;
  };

  const handleKeyCommand = async (command) => {
    let state;
    switch (command) {
      case "heading":
        state = await removeSymbol(editorState, "#");
        state = RichUtils.toggleBlockType(state, "header-one");
        break;
      case "bold":
        state = await removeSymbol(editorState, "*");
        state = RichUtils.toggleInlineStyle(state, "BOLD");
        break;
      case "redLine":
        state = await removeSymbol(editorState, "**");
        state = RichUtils.toggleInlineStyle(state, "COLOR-red");
        break;
      case "underline":
        state = await removeSymbol(editorState, "***");
        state = RichUtils.toggleInlineStyle(state, "UNDERLINE");
        break;
      default:
        return "not-handled";
    }

    setEditorState(state);
    return "handled";
  };

  const keyBindingFunction = (e) => {
    if (e.keyCode === 32 || KeyBindingUtil.hasCommandModifier(e)) {
      const selection = editorState.getSelection();
      const currentContent = editorState.getCurrentContent();
      const block = currentContent.getBlockForKey(selection.getStartKey());
      const text = block.getText();

      if (text.startsWith("#")) return "heading";
      else if (text.startsWith("***")) return "underline";
      else if (text.startsWith("**")) return "redLine";
      else if (text.startsWith("*")) return "bold";
    }
    return getDefaultKeyBinding(e);
  };

  return (
    <div className="flex justify-center h-screen w-screen flex-col items-center bg-stone-300">
      <Toaster position="top-center" />
      <div className="flex items-center w-full h-16 justify-between md:justify-center relative">
        <span className="text-xl ps-3">Demo editor by Atish Fulzade</span>
        <button
          className="md:px-10 py-2 px-5 hover:bg-purple-700 transition bg-purple-600 absolute right-2 md:right-20 text-white rounded"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
      <div className="h-[85%] w-[90%] border shadow-lg bg-white rounded overflow-x-hidden">
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          customStyleMap={styleMap}
          keyBindingFn={keyBindingFunction}
          placeholder="Try this
          Use # <spacebar> for Heading
          Use * <spacebar> for Bold text
          Use ** <spacebar> for Redline text
          Use *** <spacebar> for Underline"
        />
      </div>
    </div>
  );
}

export default App;
