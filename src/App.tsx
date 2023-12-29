import { useEffect, useState } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { save } from "@tauri-apps/api/dialog";
import "./App.css";
import { copyFile } from "@tauri-apps/api/fs";
import { listen } from "@tauri-apps/api/event";
import { appWindow } from '@tauri-apps/api/window';
import { Rect } from "./types";
import Crop from "./Crop";

function App() {
  const [previewImgPath, setPreviewImgPath] = useState("/tauri.svg");
  const [baseImgPath, setBaseImgPath] = useState("");
  const [isFullImgPrev, setIsFullImgPrev] = useState(false);
  const [rect, setRect] = useState<Rect>({x: 0, y: 0, width: 0, height: 0});

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

  const handleRectChange = (newRect: Rect) => {
    setRect(newRect);
  };

  const handleDragEnd = async () => {
    await appWindow.setFullscreen(false);
    await appWindow.setDecorations(true);
    await appWindow.setAlwaysOnTop(false);
    await appWindow.setResizable(true);
    setIsFullImgPrev(false);
    const localImgPath: string = await invoke("take_screenshot_rect", { x: rect.x, y: rect.y, width: rect.width, height: rect.height });
    setBaseImgPath(localImgPath);
    const path = convertFileSrc(localImgPath);
    setPreviewImgPath(path);
  };

  const sleep = (msec: number | undefined) => new Promise(resolve => setTimeout(resolve, msec));

  async function screenShot() {
    await appWindow.hide();
    await sleep(200);
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

      {!isFullImgPrev && <button onClick={() => { screenShot() }}>ScreenShot</button>}

      <div className="row">
        <div onClick={openDialog}>
          {!isFullImgPrev && <img
            src={previewImgPath}
            className={"preview"}
            alt="preview"
          />}
          {isFullImgPrev && <Crop
            img={previewImgPath}
            onRectChange={handleRectChange}
            onDragEnd={handleDragEnd}
          />}
        </div>
      </div>
    </div>
  );
}

export default App;
