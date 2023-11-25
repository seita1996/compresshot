use screenshots::Screen;
use std::{time::Instant, path::PathBuf};

pub fn capture() -> String {
    let start = Instant::now();
    let screens = Screen::all().unwrap();

    for screen in screens {
        println!("capturer {screen:?}");
        let mut image = screen.capture().unwrap();
        image
            .save(format!("target/{}.png", screen.display_info.id))
            .unwrap();

        image = screen.capture_area(300, 300, 300, 300).unwrap();
        image
            .save(format!("target/{}-2.png", screen.display_info.id))
            .unwrap();
    }

    let screen = Screen::from_point(100, 100).unwrap();
    println!("capturer {screen:?}");

    let image = screen.capture_area(300, 300, 300, 300).unwrap();
    let base_path = tauri::api::path::download_dir().unwrap_or_else(|| PathBuf::new());
    let path = base_path.join("capture_display_with_point.png");

    match path.to_str() {
        None => panic!("new path is not a valid UTF-8 sequence"),
        Some(s) => {
            image.save(s).unwrap();
            println!("run time: {:?}", start.elapsed());
            return format!("{}", s)
        },
    };
}
