use wasm_bindgen::prelude::*;
use web_sys::{console, window, CanvasRenderingContext2d, HtmlCanvasElement};
use std::f64;
use std::collections::HashMap;

// Estructura para representar un puntero en 3D
#[wasm_bindgen]
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct Pointer3D {
    id: String,
    start_x: f64,
    start_y: f64,
    start_z: f64,
    end_x: f64,
    end_y: f64,
    end_z: f64,
    color: String,
    thickness: f64,
    animated: bool,
    animation_progress: f64,
}

// Estructura para representar un bloque de memoria en 3D
#[wasm_bindgen]
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct MemoryBlock3D {
    id: String,
    x: f64,
    y: f64,
    z: f64,
    width: f64,
    height: f64,
    depth: f64,
    color: String,
    value: Option<String>,
    memory_type: String, // "stack", "heap", "global"
}

// Motor de animaciones principal
#[wasm_bindgen]
pub struct AnimationEngine {
    pointers: HashMap<String, Pointer3D>,
    memory_blocks: HashMap<String, MemoryBlock3D>,
    animation_speed: f64,
    last_frame_time: f64,
}

#[wasm_bindgen]
impl AnimationEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> AnimationEngine {
        console::log_1(&"AnimationEngine initialized".into());

        AnimationEngine {
            pointers: HashMap::new(),
            memory_blocks: HashMap::new(),
            animation_speed: 1.0,
            last_frame_time: window().unwrap().performance().unwrap().now(),
        }
    }

    #[wasm_bindgen]
    pub fn add_pointer(&mut self, pointer: JsValue) {
        let ptr: Pointer3D = serde_wasm_bindgen::from_value(pointer).unwrap();
        self.pointers.insert(ptr.id.clone(), ptr);
    }

    #[wasm_bindgen]
    pub fn add_memory_block(&mut self, block: JsValue) {
        let mem_block: MemoryBlock3D = serde_wasm_bindgen::from_value(block).unwrap();
        self.memory_blocks.insert(mem_block.id.clone(), mem_block);
    }

    #[wasm_bindgen]
    pub fn remove_pointer(&mut self, id: &str) {
        self.pointers.remove(id);
    }

    #[wasm_bindgen]
    pub fn remove_memory_block(&mut self, id: &str) {
        self.memory_blocks.remove(id);
    }

    #[wasm_bindgen]
    pub fn update_pointer_position(&mut self, id: &str, end_x: f64, end_y: f64, end_z: f64) {
        if let Some(pointer) = self.pointers.get_mut(id) {
            pointer.end_x = end_x;
            pointer.end_y = end_y;
            pointer.end_z = end_z;
        }
    }

    #[wasm_bindgen]
    pub fn animate(&mut self, delta_time: f64) {
        let current_time = window().unwrap().performance().unwrap().now();
        let actual_delta = (current_time - self.last_frame_time) / 1000.0;
        self.last_frame_time = current_time;

        // Animar punteros
        for pointer in self.pointers.values_mut() {
            if pointer.animated {
                pointer.animation_progress += actual_delta * self.animation_speed;

                if pointer.animation_progress > 1.0 {
                    pointer.animation_progress = 0.0;
                }

                // Efecto de pulso para punteros animados
                let pulse = (pointer.animation_progress * f64::consts::PI * 2.0).sin();
                pointer.thickness = 3.0 + pulse * 2.0;
            }
        }
    }

    #[wasm_bindgen]
    pub fn render(&self, canvas_id: &str) -> Result<(), JsValue> {
        let window = web_sys::window().unwrap();
        let document = window.document().unwrap();
        let canvas = document
            .get_element_by_id(canvas_id)
            .unwrap()
            .dyn_into::<HtmlCanvasElement>()?;

        let context = canvas
            .get_context("2d")?
            .unwrap()
            .dyn_into::<CanvasRenderingContext2d>()?;

        // Limpiar canvas
        context.clear_rect(0.0, 0.0, canvas.width() as f64, canvas.height() as f64);

        // Renderizar bloques de memoria
        for block in self.memory_blocks.values() {
            self.render_memory_block(&context, block);
        }

        // Renderizar punteros
        for pointer in self.pointers.values() {
            self.render_pointer(&context, pointer);
        }

        Ok(())
    }

    fn render_memory_block(&self, context: &CanvasRenderingContext2d, block: &MemoryBlock3D) {
        // Proyección simple 3D a 2D (isométrica)
        let iso_x = block.x - block.z * 0.5;
        let iso_y = block.y - block.z * 0.5;

        // Dibujar bloque como un rectángulo con perspectiva
        context.set_fill_style(&JsValue::from_str(&block.color));
        context.fill_rect(iso_x, iso_y, block.width, block.height);

        // Dibujar borde
        context.set_stroke_style(&JsValue::from_str("white"));
        context.set_line_width(2.0);
        context.stroke_rect(iso_x, iso_y, block.width, block.height);

        // Dibujar valor si existe
        if let Some(ref value) = block.value {
            context.set_fill_style(&JsValue::from_str("white"));
            context.set_font("14px Arial");
            context.fill_text(value, iso_x + 10.0, iso_y + 25.0).unwrap();
        }
    }

    fn render_pointer(&self, context: &CanvasRenderingContext2d, pointer: &Pointer3D) {
        // Proyección simple 3D a 2D
        let start_iso_x = pointer.start_x - pointer.start_z * 0.5;
        let start_iso_y = pointer.start_y - pointer.start_z * 0.5;
        let end_iso_x = pointer.end_x - pointer.end_z * 0.5;
        let end_iso_y = pointer.end_y - pointer.end_z * 0.5;

        // Dibujar línea del puntero
        context.set_stroke_style(&JsValue::from_str(&pointer.color));
        context.set_line_width(pointer.thickness);
        context.begin_path();
        context.move_to(start_iso_x, start_iso_y);
        context.line_to(end_iso_x, end_iso_y);
        context.stroke();

        // Dibujar cabeza de flecha
        self.draw_arrow_head(&context, end_iso_x, end_iso_y, start_iso_x, start_iso_y);
    }

    fn draw_arrow_head(&self, context: &CanvasRenderingContext2d, x: f64, y: f64, from_x: f64, from_y: f64) {
        let angle = (y - from_y).atan2(x - from_x);
        let arrow_length = 15.0;

        let x1 = x - arrow_length * (angle + f64::consts::PI / 6.0).cos();
        let y1 = y - arrow_length * (angle + f64::consts::PI / 6.0).sin();
        let x2 = x - arrow_length * (angle - f64::consts::PI / 6.0).cos();
        let y2 = y - arrow_length * (angle - f64::consts::PI / 6.0).sin();

        context.begin_path();
        context.move_to(x, y);
        context.line_to(x1, y1);
        context.move_to(x, y);
        context.line_to(x2, y2);
        context.stroke();
    }

    #[wasm_bindgen]
    pub fn get_pointer_count(&self) -> usize {
        self.pointers.len()
    }

    #[wasm_bindgen]
    pub fn get_memory_block_count(&self) -> usize {
        self.memory_blocks.len()
    }

    #[wasm_bindgen]
    pub fn set_animation_speed(&mut self, speed: f64) {
        self.animation_speed = speed.max(0.1).min(5.0);
    }

    #[wasm_bindgen]
    pub fn reset(&mut self) {
        self.pointers.clear();
        self.memory_blocks.clear();
    }
}

// Funciones de utilidad para debugging
#[wasm_bindgen]
pub fn log_memory_info() {
    console::log_1(&"Pointer Quest WASM Engine Active".into());
    console::log_1(&"WebAssembly memory initialized successfully".into());
}

#[wasm_bindgen]
pub fn benchmark_performance(iterations: usize) -> f64 {
    let start_time = window().unwrap().performance().unwrap().now();

    let mut sum = 0.0;
    for i in 0..iterations {
        sum += (i as f64).sin();
    }

    let end_time = window().unwrap().performance().unwrap().now();
    let elapsed = end_time - start_time;

    console::log_1(&format!("Benchmark: {} iterations in {}ms", iterations, elapsed).into());

    elapsed
}

// Inicialización de WebAssembly
#[wasm_bindgen(start)]
pub fn main() {
    console::log_1(&"Pointer Quest WebAssembly module loaded successfully! 🚀".into());
}
