// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod screenshot;

#[tauri::command]
async fn take_screenshot() -> String {
    // capture screenshot
    let path = screenshot::capture();
    format!("{}", path)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![take_screenshot])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
