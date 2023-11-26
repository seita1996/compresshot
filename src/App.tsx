import { useState } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { save } from "@tauri-apps/api/dialog";
import "./App.css";
import { copyFile } from "@tauri-apps/api/fs";

function App() {
  const [previewImgPath, setPreviewImgPath] = useState("/tauri.svg");
  const [baseImgPath, setBaseImgPath] = useState("");

  async function screenShot() {
    const localImgPath: string = await invoke("take_screenshot");
    setBaseImgPath(localImgPath);
    const path = convertFileSrc(localImgPath);
    setPreviewImgPath(path);
  }

  async function openDialog() {
    let filePath = await save({
      filters: [{
        name: 'Image',
        extensions: ['png', 'jpeg']
      }]
    });
    if (filePath == null) {
      filePath = '';
    }
    await copyFile(baseImgPath, filePath);
  }

  return (
    <div className="container">

      <div className="row">
        <div onClick={openDialog}>
          <img src={previewImgPath} className="preview" alt="preview" />
        </div>
      </div>

      <button onClick={() => { screenShot() }}>ScreenShot</button>
    </div>
  );
}

export default App;
