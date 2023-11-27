// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, AboutMetadata};

pub mod screenshot;

#[tauri::command]
async fn take_screenshot_full() -> String {
    // capture screenshot
    let path = screenshot::full_capture();
    format!("{}", path)
}

#[tauri::command]
async fn take_screenshot_rect(x: i32, y: i32, width: u32, height: u32) -> String {
    // capture screenshot
    println!("{} {} {} {}", x, y, width, height);
    let path = screenshot::capture(x, y, width, height);
    format!("{}", path)
}

fn main() {
    let about = CustomMenuItem::new("about".to_string(), "About");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let mainmenu = Submenu::new(
        "Compresshot",
        Menu::new()
            .add_native_item(MenuItem::About(
                "compresshot".to_string(),
                AboutMetadata::default(),
            ))
            .add_native_item(MenuItem::Hide)
            .add_native_item(MenuItem::HideOthers)
            .add_native_item(MenuItem::ShowAll)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Quit)
            .add_native_item(MenuItem::Separator)
            .add_item(about)
            .add_native_item(MenuItem::Separator)
            .add_item(quit),
    );
    let screenmenu = Submenu::new(
        "Window",
        Menu::new()
            .add_native_item(MenuItem::EnterFullScreen)
            .add_native_item(MenuItem::Minimize)
            .add_native_item(MenuItem::Zoom)
            .add_native_item(MenuItem::CloseWindow),
    );
    let menu = Menu::new()
        .add_submenu(mainmenu)
        .add_submenu(screenmenu);
    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "about" => {
                let window = event.window();
                window.emit("about", "Compresshot".to_string()).unwrap();
            }
            "quit" => {
                std::process::exit(0);
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![take_screenshot_full, take_screenshot_rect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
