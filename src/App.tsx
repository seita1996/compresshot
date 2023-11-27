import { useEffect, useState } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { save } from "@tauri-apps/api/dialog";
import "./App.css";
import { copyFile } from "@tauri-apps/api/fs";
import { listen } from "@tauri-apps/api/event";
import { appWindow } from '@tauri-apps/api/window';
import { Rect } from "./types";

function App() {
  const [previewImgPath, setPreviewImgPath] = useState("/tauri.svg");
  const [baseImgPath, setBaseImgPath] = useState("");
  const [isFullImgPrev, setIsFullImgPrev] = useState(false);

  useEffect(() => {
    let unlisten: any;
    async function f() {
      unlisten = await listen('about', event => {
        console.log(`about ${event.payload} ${new Date()}`)
      });
    }
    f();

    return () => {
      if (unlisten) {
        unlisten();
      }
    }
  }, [])

  async function getRect (): Promise<Rect> {
    return new Promise((resolve) => {
      let startX :number, startY :number;
      let endX, endY;
  
      const onMouseDown = (e: { clientX: number; clientY: number; }) => {
        startX = e.clientX;
        startY = e.clientY;
        window.removeEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
      };
  
      const onMouseUp = (e: { clientX: number; clientY: number; }) => {
        endX = e.clientX;
        endY = e.clientY;
        window.removeEventListener('mouseup', onMouseUp);
        resolve({
          x: Math.min(startX, endX),
          y: Math.min(startY, endY),
          width: Math.abs(endX - startX),
          height: Math.abs(endY - startY)
        });
      };
  
      window.addEventListener('mousedown', onMouseDown);
    });
  }

  async function screenShot() {
    await appWindow.hide();
    const localFullImgPath: string = await invoke("take_screenshot_full");
    setBaseImgPath(localFullImgPath);
    const fullscreenimg_path = convertFileSrc(localFullImgPath);
    setPreviewImgPath(fullscreenimg_path);
    setIsFullImgPrev(true);
    appWindow.show();
    appWindow.setFullscreen(true);
    appWindow.setDecorations(false);
    appWindow.setAlwaysOnTop(true);
    appWindow.setResizable(false);
    const rect = await getRect();
    await appWindow.setFullscreen(false);
    await appWindow.setDecorations(true);
    await appWindow.setAlwaysOnTop(false);
    await appWindow.setResizable(true);
    setIsFullImgPrev(false);
    const localImgPath: string = await invoke("take_screenshot_rect", { x: rect.x, y: rect.y, width: rect.width, height: rect.height });
    setBaseImgPath(localImgPath);
    const path = convertFileSrc(localImgPath);
    setPreviewImgPath(path);
  }

  async function openDialog() {
    if (isFullImgPrev) {
      return;
    }

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
          <img
            src={previewImgPath}
            className={isFullImgPrev ? "preview-fullscreen" : "preview"}
            alt="preview"
          />
        </div>
      </div>

      {!isFullImgPrev && <button onClick={() => { screenShot() }}>ScreenShot</button>}
    </div>
  );
}

export default App;
